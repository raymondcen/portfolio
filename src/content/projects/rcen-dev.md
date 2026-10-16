---
title: rcen.dev
start: "2026-10"
end: "2026-10"
context: personal
teamSize: 1
role: Solo
summary: Static Astro site on Cloudflare Workers with an edge API, currently serving live Spotify now-playing data.
tags: [Astro, TypeScript, Tailwind CSS, Cloudflare Workers, Spotify Web API]
github: https://github.com/raymondcen/portfolio
live: https://rcen.dev
status: complete
order: 60
---

Personal site for recruiters covering my projects, experience and background. Pages are prebuilt with Astro and Tailwind and served from Cloudflare's edge, with a Worker handling `/api/*` routes.

- Modeled projects, experience and About content as typed Astro content collections with Zod schemas, so a missing field or malformed date fails the build instead of shipping.
- Built a now-playing endpoint that refreshes a Spotify OAuth token, caches responses at the edge and stores the last-played track in Workers KV. A one-minute cron keeps it current with no visitors on the site, writing to KV only when the track changes.
- Set up GitHub Actions CI that runs type checks, a production build and Lighthouse CI.

**Key decision.** Hosted on Cloudflare Workers with static assets instead of Cloudflare Pages. Pages covers a static site, but Workers runs code in front of the assets on chosen routes, which the Spotify endpoint needed. The trade-off was more configuration up front for routes, bindings and the cron trigger.