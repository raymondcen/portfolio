# Next steps

## Next session
- Connect the repo to Cloudflare Workers (Workers & Pages > Create > Import a repository). Build `npm run build`, deploy `npx wrangler deploy`, non-production deploy `npx wrangler versions upload`. Worker name must match `name` in wrangler.jsonc.
- Confirm the deploy works and note the `*.workers.dev` URL
- Enable preview URLs in the Worker settings and confirm a branch push creates one.
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
- Set `site` in astro.config.mjs to the workers.dev URL until a domain is bought
- Work on a branch per page so each gets a preview URL and CI run
- Buy the domain on Cloudflare Registrar and add it to the Worker as a custom domain
- Update `site` to the real domain
- Run the pre-launch checks in docs/handoff.md section 7

## Content to upload
- Email, LinkedIn URL and GitHub URL (needed for BaseLayout)
- Resume PDF named Raymond-Cen-Resume.pdf, in public/
- Project screenshots or diagrams, in src/assets/projects/
- Remaining items in docs/handoff.md section 6