# Raymond Cen portfolio

Static personal portfolio for recruiters. Astro 7, Tailwind v4, content collections, hosted on Cloudflare Workers (static assets only). No backend, database, CMS or UI library.

## Source of truth
At the start of every session, read every file in docs/: Markdown, PDFs and images (PNG, JPG, WebP). Open images and PDFs with the view tool.

Precedence:
- docs/design.md is the source of truth for behavior, tokens and implementation.
- Images and PDFs in docs/ are visual references for layout.
- If they conflict, design.md wins. Flag the conflict instead of guessing.
- The wireframe PDF still shows Projects as an accordion on desktop. design.md supersedes it for desktop.

Open work is tracked in GitHub Issues.

If a request conflicts with these, say so before changing anything.

## Structure
- Routes: index, experience, projects, resume, about, 404. Don't add others.
- Shared shell: src/layouts/BaseLayout.astro (sticky header, footer icons, fonts, meta)
- Content: src/content/projects/ and src/content/experience/, one .md per entry, schemas in src/content.config.ts
- Images: src/assets/ so Astro optimizes them
- Static files: public/ (resume PDF, og-image, favicon, robots.txt)

## Rules
- Tailwind tokens live in src/styles/global.css under @theme. Body text color is `ink`, never `base`.
- Hover effects use the diagonal wash in docs/design.md, not plain color transitions.
- Never hardcode project or experience entries in pages. Loop over collections.
- No client-side JS unless the feature can't work without it.
- Every interactive element needs a visible focus ring and must work by keyboard.
- Ask before adding a dependency.
- Leave [bracketed] placeholders in place. Never invent content, metrics or dates.

## Commands
- Dev server: `astro dev --background`, then `astro dev stop`, `astro dev status`, `astro dev logs`
- Build: `npm run build`
- Type and content check: `npx astro check`
- Preview built dist the way Workers serves it: `npx wrangler dev`

Run the build and check before saying a task is done.

## Astro docs
Consult before related work:
- Routing: https://docs.astro.build/en/guides/routing/
- Components: https://docs.astro.build/en/basics/astro-components/
- Content collections: https://docs.astro.build/en/guides/content-collections/
- Styling and Tailwind: https://docs.astro.build/en/guides/styling/

## Writing
Site copy and docs: no em dashes, no serial comma, no filler.

## Definition of done
`npx astro check` and `npm run build` pass. If a change alters scope, routes, tokens, layout, behavior, dependencies or hosting, ask first, then update docs/design.md to match.
