// Serves /api/* (run_worker_first). Everything else is static assets.

type NowPlaying = {
  state: 'playing' | 'recent';
  track: string;
  artists: string;
  trackId: string;
  trackUrl: string;
  playlistId: string | null;
  playlistName: string | null;
  playedAt: string | null;
};

type SpotifyTrack = {
  type?: string;
  id: string;
  name: string;
  artists: { name: string }[];
  external_urls: { spotify: string };
};

type SpotifyContext = { type: string; uri: string } | null;

const API = 'https://api.spotify.com/v1/me/player';

// Spotify calls give up after 5s so a stalled upstream returns 503 instead of hanging the request
const timeout = () => AbortSignal.timeout(5000);

let token: { value: string; expires: number } | null = null;

async function accessToken(env: Env): Promise<string> {
  if (token && Date.now() < token.expires) return token.value;
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: env.SPOTIFY_REFRESH_TOKEN }),
    signal: timeout(),
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: data.access_token, expires: Date.now() + (data.expires_in - 60) * 1000 };
  return token.value;
}

function shape(
  state: NowPlaying['state'],
  track: SpotifyTrack,
  context: SpotifyContext,
  playedAt: string | null,
): NowPlaying {
  return {
    state,
    track: track.name,
    artists: track.artists.map((a) => a.name).join(', '),
    trackId: track.id,
    trackUrl: track.external_urls.spotify,
    playlistId: context?.type === 'playlist' ? context.uri.split(':').pop()! : null,
    playlistName: null,
    playedAt,
  };
}

// Playlist names by id, kept for the isolate's life. Only successes are kept, so a failure retries next time
const playlists = new Map<string, string>();

// Null when Spotify won't return it (Spotify-owned playlists 404 for new apps) or the call fails; the label then has no playlist
async function playlistName(id: string, headers: HeadersInit): Promise<string | null> {
  if (playlists.has(id)) return playlists.get(id)!;
  try {
    const res = await fetch(`https://api.spotify.com/v1/playlists/${id}?fields=name`, { headers, signal: timeout() });
    if (!res.ok) throw new Error(`${res.status}`);
    const { name } = (await res.json()) as { name: string };
    playlists.set(id, name);
    return name;
  } catch (err) {
    console.error('playlist failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

// Last track the Worker saw, so a pause survives Spotify dropping the session.
// "at" is when playing started, or the pause timestamp.
type Last = Omit<NowPlaying, 'state' | 'playedAt'> & { playing: boolean; at: number };

const kvError = (err: unknown) => console.error('kv failed:', err instanceof Error ? err.message : err);

// KV failures are logged and ignored so the endpoint never depends on them
async function recall(env: Env): Promise<Last | null> {
  try {
    return await env.NOW_PLAYING.get<Last>('last', 'json');
  } catch (err) {
    kvError(err);
    return null;
  }
}

// Writes only when the track or the playing flag changed, to keep writes low
async function remember(env: Env, np: NowPlaying, playing: boolean, at: number): Promise<void> {
  try {
    const last = await env.NOW_PLAYING.get<Last>('last', 'json');
    if (last?.trackId === np.trackId && last.playing === playing) return;
    const { state, playedAt, ...fields } = np;
    await env.NOW_PLAYING.put('last', JSON.stringify({ ...fields, playing, at } satisfies Last));
  } catch (err) {
    kvError(err);
  }
}

// Current track, saved to KV. Null when nothing is playing or paused (204, episode, ad).
async function current(env: Env, headers: HeadersInit): Promise<NowPlaying | null> {
  const res = await fetch(`${API}/currently-playing`, { headers, signal: timeout() });
  if (res.status === 200) {
    const data = (await res.json()) as {
      is_playing: boolean;
      timestamp: number;
      item: SpotifyTrack | null;
      context: SpotifyContext;
    };
    if (data.item?.type === 'track') {
      const np = data.is_playing
        ? shape('playing', data.item, data.context, null)
        : shape('recent', data.item, data.context, new Date(data.timestamp).toISOString());
      // The page shows the playlist only while playing
      if (data.is_playing && np.playlistId) np.playlistName = await playlistName(np.playlistId, headers);
      await remember(env, np, data.is_playing, data.is_playing ? Date.now() : data.timestamp);
      return np;
    }
  } else if (res.status !== 204) {
    throw new Error(`currently-playing ${res.status}`);
  }
  return null;
}

async function nowPlaying(env: Env): Promise<NowPlaying> {
  const headers = { Authorization: `Bearer ${await accessToken(env)}` };
  const np = await current(env, headers);
  if (np) return np;

  // No track now: the newer of the stored track and recently-played wins
  const [stored, recent] = await Promise.all([recall(env), fetch(`${API}/recently-played?limit=1`, { headers, signal: timeout() })]);
  if (!recent.ok) throw new Error(`recently-played ${recent.status}`);
  const data = (await recent.json()) as {
    items: { track: SpotifyTrack; played_at: string; context: SpotifyContext }[];
  };
  const last = data.items[0];
  const played = last && shape('recent', last.track, last.context, last.played_at);
  if (stored && (!played || stored.at > Date.parse(played.playedAt!))) {
    const { playing, at, ...fields } = stored;
    return { state: 'recent', ...fields, playedAt: new Date(at).toISOString() };
  }
  if (!played) throw new Error('no recent tracks');
  return played;
}

function json(body: unknown, status: number, maxAge: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${maxAge}` },
  });
}

// The edge copy keeps its short max-age; browsers get no-store. On cache hits Cloudflare's zone
// Browser Cache TTL rewrote max-age to 4h, which pinned an old track in the browser
function noStore(res: Response): Response {
  const out = new Response(res.body, res);
  out.headers.set('Cache-Control', 'no-store');
  return out;
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (url.pathname !== '/api/now-playing') return json({ error: 'not found' }, 404, 0);
    if (request.method !== 'GET') {
      return new Response(null, { status: 405, headers: { Allow: 'GET' } });
    }

    const cache = caches.default;
    const hit = await cache.match(request);
    if (hit) return noStore(hit);

    let res: Response;
    try {
      if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REFRESH_TOKEN) {
        throw new Error('missing secret');
      }
      res = json(await nowPlaying(env), 200, 15);
    } catch (err) {
      console.error('now-playing failed:', err instanceof Error ? err.message : err);
      res = json({ state: 'error' }, 503, 10);
    }
    ctx.waitUntil(cache.put(request, res.clone()));
    return noStore(res);
  },

  // Cron: keeps KV current while nobody is on the site. Never touches the edge cache.
  async scheduled(_controller, env): Promise<void> {
    try {
      await current(env, { Authorization: `Bearer ${await accessToken(env)}` });
    } catch (err) {
      console.error('scheduled failed:', err instanceof Error ? err.message : err);
    }
  },
} satisfies ExportedHandler<Env>;
