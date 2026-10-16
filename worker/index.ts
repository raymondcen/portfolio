// Serves /api/* (run_worker_first). Everything else is static assets.

type NowPlaying = {
  state: 'playing' | 'recent';
  track: string;
  artists: string;
  trackId: string;
  trackUrl: string;
  playlistId: string | null;
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
    playedAt,
  };
}

async function nowPlaying(env: Env): Promise<NowPlaying> {
  const headers = { Authorization: `Bearer ${await accessToken(env)}` };

  const current = await fetch(`${API}/currently-playing`, { headers });
  if (current.status === 200) {
    const data = (await current.json()) as {
      is_playing: boolean;
      timestamp: number;
      item: SpotifyTrack | null;
      context: SpotifyContext;
    };
    if (data.item?.type === 'track') {
      return data.is_playing
        ? shape('playing', data.item, data.context, null)
        : shape('recent', data.item, data.context, new Date(data.timestamp).toISOString());
    }
  } else if (current.status !== 204) {

  const recent = await fetch(`${API}/recently-played?limit=1`, { headers });
  if (!recent.ok) throw new Error(`recently-played ${recent.status}`);
  const data = (await recent.json()) as {
    items: { track: SpotifyTrack; played_at: string; context: SpotifyContext }[];
  };
  const last = data.items[0];
  if (!last) throw new Error('no recent tracks');
  return shape('recent', last.track, last.context, last.played_at);
}

function json(body: unknown, status: number, maxAge: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${maxAge}` },
  });
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
    if (hit) return hit;

    let res: Response;
    try {
      if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REFRESH_TOKEN) {
        throw new Error('missing secret');
      }
      res = json(await nowPlaying(env), 200, 30);
    } catch (err) {
      console.error('now-playing failed:', err instanceof Error ? err.message : err);
      res = json({ state: 'error' }, 503, 10);
    }
    ctx.waitUntil(cache.put(request, res.clone()));
    return res;
  },
} satisfies ExportedHandler<Env>;
