// One-time: get a Spotify refresh token and save it to .dev.vars.
// Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .dev.vars and
// http://127.0.0.1:8888/callback as a redirect URI on the Spotify app.
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';

const FILE = '.dev.vars';
const REDIRECT = 'http://127.0.0.1:8888/callback';
const SCOPES = 'user-read-currently-playing user-read-recently-played playlist-read-private playlist-read-collaborative';

const text = readFileSync(FILE, 'utf8');
const vars = Object.fromEntries(
  text.split(/\r?\n/).filter((l) => l.includes('=')).map((l) => {
    const i = l.indexOf('=');
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  }),
);
const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = vars;
if (!id || !secret) {
  console.error(`Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in ${FILE} first.`);
  process.exit(1);
}

const state = randomBytes(16).toString('hex');
const authorize = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  response_type: 'code',
  client_id: id,
  scope: SCOPES,
  redirect_uri: REDIRECT,
  state,
})}`;

const server = createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  if (url.pathname !== '/callback') return res.writeHead(404).end();

  const fail = (msg) => {
    res.writeHead(400).end(msg);
    console.error(msg);
  };
  if (url.searchParams.get('state') !== state) return fail('State mismatch. Try again.');
  const code = url.searchParams.get('code');
  if (!code) return fail(`Authorization failed: ${url.searchParams.get('error')}`);

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT }),
  });
  if (!tokenRes.ok) return fail(`Token exchange failed with status ${tokenRes.status}.`);
  const { refresh_token } = await tokenRes.json();

  const line = `SPOTIFY_REFRESH_TOKEN=${refresh_token}`;
  const updated = /^SPOTIFY_REFRESH_TOKEN=.*$/m.test(text)
    ? text.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, line)
    : `${text.replace(/\s*$/, '\n')}${line}\n`;
  writeFileSync(FILE, updated);

  res.writeHead(200).end('Done. You can close this tab.');
  console.log(`Saved refresh token to ${FILE}`);
  server.close();
  process.exit(0);
});

server.listen(8888, '127.0.0.1', () => {
  console.log(`Open this URL to authorize:\n${authorize}`);
});
