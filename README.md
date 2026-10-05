# rcen.dev

Personal portfolio for Raymond Cen: https://rcen.dev

## Stack

Astro 7, Tailwind v4, content collections, Cloudflare Workers static assets.

## Run locally

Requires Node 22.12 or later.

```
npm install
npm run dev
```

Open http://localhost:4321.

## Commands

- `npm run build`: build the site to `dist/`
- `npm run preview`: serve the built site locally
- `npx astro check`: type-check pages and content
- `npx wrangler dev`: serve `dist/` the way Workers does

## Deploy

Pushes to `main` build and deploy via Cloudflare Workers Builds. Other branches get preview URLs. CI runs `astro check` and build on pull requests and pushes to `main`.

Built with AI assistance (Claude Code). CLAUDE.md holds the project conventions.

## License

Code is MIT licensed. Site content and resume: all rights reserved.
