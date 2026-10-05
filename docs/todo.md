# Next steps

## Next session
- Push a branch and confirm Workers Builds creates a preview URL (`preview_urls: true` is set in wrangler.jsonc)
- Confirm the CI run is green in the GitHub Actions tab
- Start on tokens, Newsreader font and wash CSS in src/styles/global.css

## Build pages
- Tokens, Newsreader font and wash CSS in src/styles/global.css
- BaseLayout: sticky header, 安 SVG, footer icons, meta tags, skip link
- Home page (remove the noindex placeholder)
- Content schemas plus one project and one experience entry
- Projects page (accordion)
- Experience page
- Resume, About and 404 pages
- SEO, accessibility and Lighthouse pass

## Setup and infrastructure
- README: add "Site content and resume: all rights reserved"
- Work on a branch per page so each gets a preview URL and CI run
- Run the pre-launch checks in docs/handoff.md section 7

## Content to upload
- Email, LinkedIn URL and GitHub URL (needed for BaseLayout)
- Resume PDF named Raymond-Cen-Resume.pdf, in public/
- Project screenshots or diagrams, in src/assets/projects/
- Remaining items in docs/handoff.md section 6

## Done
- 2026-10-05: Repo connected to Cloudflare Workers Builds; production deploy live at https://rcen.dev (custom domain via wrangler.jsonc `routes`)
- 2026-10-05: `preview_urls: true` added to wrangler.jsonc
- 2026-10-05: `site` in astro.config.mjs set to https://rcen.dev
- 2026-10-05: public/robots.txt added (allow all, sitemap at https://rcen.dev/sitemap-index.xml)