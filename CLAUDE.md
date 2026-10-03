# Raymond Cen portfolio

Static personal portfolio for recruiters. Astro 7, Tailwind v4, content collections, hosted on Cloudflare Pages. No backend, database, CMS or UI library.

## Source of truth
Read before any layout, styling or content work:
- docs/handoff.md: stack decisions, design tokens, implementation notes
- docs/wireframes.pdf: layout and behavior notes

If a request conflicts with these, say so before changing anything.

## Structure
- Routes: index, experience, projects, resume, about, 404. Don't add others.
- Shared shell: src/layouts/BaseLayout.astro (sticky header, footer icons, fonts, meta)
- Content: src/content/projects/ and src/content/experience/, one .md per entry, schemas in src/content.config.ts
- Images: src/assets/ so Astro optimizes them
- Static files: public/ (resume PDF, og-image, favicon, robots.txt)

## Rules
- Tailwind tokens live in src/styles/global.css under @theme. Body text color is `ink`, never `base`.
- Hover effects use the diagonal wash in the handoff, not plain color transitions.
- Never hardcode project or experience entries in pages. Loop over collections.
- No client-side JS unless the feature can't work without it.
- Every interactive element needs a visible focus ring and must work by keyboard.
- Ask before adding a dependency.
- Leave [bracketed] placeholders in place. Never invent content, metrics or dates.

## Commands
- Dev server: `astro dev --background`, then `astro dev stop`, `astro dev status`, `astro dev logs`
- Build: `npm run build`
- Type and content check: `npx astro check`

Run the build and check before saying a task is done.

## Astro docs
Consult before related work:
- Routing: https://docs.astro.build/en/guides/routing/
- Components: https://docs.astro.build/en/basics/astro-components/
- Content collections: https://docs.astro.build/en/guides/content-collections/
- Styling and Tailwind: https://docs.astro.build/en/guides/styling/