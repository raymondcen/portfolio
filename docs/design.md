# Design: rcen.dev

docs/wireframe.pdf is the layout reference and this file covers stack, tokens and behavior.

## 1. Decisions

The original plan described a single-page landing. The wireframes replace it.

| Considered | Chosen |
|---|---|
| Single page with anchor sections | Multi-page: `/`, `/experience`, `/projects`, `/resume`, `/about` |
| Hero with positioning line and CTAs | Home is name, nav and icons only |
| Featured cards plus "More projects" | One uniform accordion list, all projects |
| `/projects/[slug]` case study pages | None. Projects expand in place |
| Skills and Contact sections | Omitted. Contact is the footer icons |
| About section on the landing page | Its own `/about` page. Content not decided yet |
| Plain color fade on hover | Diagonal color wash on every hover |
| Cloudflare Pages | Cloudflare Workers (static assets) |

Unchanged: Astro, Tailwind, content collections, SEO, accessibility and performance targets.

Sitemap: `/`, `/experience`, `/projects`, `/resume`, `/about`, `/resume.pdf`, `/404`.

## 2. Tech stack and how each piece is used

### Build

| Tool | Role in this site |
|---|---|
| **Astro** | Site framework. Builds every page to static HTML at build time. One `.astro` file per route: `index`, `experience`, `projects`, `resume`, `about`, `404`. About is a plain Markdown-driven page, so its text can be edited without touching layout code. A shared `BaseLayout` holds the sticky header, footer icons, fonts and meta tags. Ships zero JavaScript unless a component opts in, and nothing here needs to (the accordion is native HTML). |
| **Tailwind CSS** | All styling. Design tokens from section 3 go in the Tailwind theme (`bg`, `selected`, `ink`, `sub`, `panel`, `panel-2`, `divider`) so classes read `text-ink hover:text-selected`. Name the body text color `ink` in Tailwind: `text-base` is already Tailwind's default font-size class and would collide. The wash animation lives in one small custom CSS file because it uses gradients and masks Tailwind doesn't cover cleanly. Unused classes are stripped at build. |
| **Astro Content Collections + Zod** | Projects and experience entries live as Markdown files in `src/content/projects/` and `src/content/experience/`, one file per entry. Frontmatter holds structured fields (title, dates, summary, metric, tags, GitHub URL, image, display order). The body holds the expanded text. A Zod schema checks every file at build, so a missing title or broken date fails the build instead of shipping. The Projects and Experience pages loop over these collections. Adding a project means adding one file. |
| **@astrojs/mdx** | Optional now. It was in the plan for case study pages, which were cut. Plain Markdown covers the expanded project text. Add MDX later only if an expanded project needs an embedded component such as a chart. |
| **astro-icon** | Inlines SVG icons at build time: LinkedIn, mail, GitHub, Back chevron, accordion chevron, external-link arrow and the 安 symbol as a local SVG. No icon font and no runtime cost. Plain inline SVG is an acceptable substitute that avoids the dependency. |
| **@astrojs/sitemap** | Generates `sitemap.xml` at build from the routes. Paired with a static `robots.txt` in `public/`. |
| **Fontsource (Newsreader)** | Self-hosts the Newsreader font from the npm package instead of loading from Google. Import only weights 400, 500 and 600. Faster and no third-party request. |

### Hosting and services

| Service | Role in this site |
|---|---|
| **GitHub** | Source repo. `main` is production. MIT license for code; written content and resume all rights reserved. |
| **Cloudflare Workers** | Hosting with static assets only: `wrangler.jsonc` serves `dist` and returns `404.html` for unknown routes. No Worker script and no adapter. Workers Builds is connected to the GitHub repo; every push to `main` runs build `npm run build` and deploy `npx wrangler deploy`. Non-production branches get preview URLs from Workers Builds. Free tier, global CDN, automatic HTTPS. Backend features (Workers AI, KV, D1, R2, Cron Triggers) can be added later without migrating. |
| **Cloudflare Registrar** | Domain purchase at cost. Same account as Workers, so DNS and the SSL certificate configure automatically when the custom domain is added to the Worker. |
| **Cloudflare Web Analytics** | Visitor counts and referrers (useful for seeing whether recruiters arrive from LinkedIn or a resume link). Enabled from the Cloudflare dashboard. No cookies and no banner required. |
| **GitHub Actions** | One workflow on pull requests: `astro check` (type-checks content collections), `npm run build` (catches build errors before Cloudflare deploys) and optionally Lighthouse CI against the performance targets. Deployment itself is handled by Cloudflare, not Actions. |

### Static files in `public/`

- `Raymond-Cen-Resume.pdf`: embedded on `/resume` and used by the Download button
- `og-image.png` (1200x630): preview image when the site is shared on LinkedIn
- `robots.txt`, `favicon.svg`

### Not used

No backend, database, CMS, contact form, UI component library, animation library (Framer Motion, GSAP) or dark mode. Contact is the mailto link in the footer.

## 3. Design tokens

| Token | Hex | Use |
|---|---|---|
| bg | `#F7F6F1` | Page background |
| selected | `#1C653A` | Hover, focus, 安 |
| ink | `#171717` | Body text |
| sub | `#64635F` | Secondary text, tags |
| panel | `#E8E7E2` | Experience and Projects card |
| panel-2 | `#DEDDD8` | Image slot, PDF border |
| divider | `#CFCEC8` | Lines between entries |

Font: Newsreader (serif), Georgia fallback.

## 4. Implementation notes

**Accordion (Projects)**
Use native `<details name="projects">` elements. Sharing a `name` gives one-open-at-a-time with zero JavaScript in current Chrome, Safari and Firefox. Older browsers allow several open at once, which is an acceptable fallback. Giving each project an `id` allows links like `/projects#fracfeedextractor` to open a specific project. That part needs a small script.

**Diagonal wash animation**
Every hover color change uses a diagonal wash: green `#1C653A` sweeps over ink `#171717` at a 135° angle, top-left to bottom-right. Unhovering reverses the sweep. Applies to nav items, Back, footer icons, project titles and chevrons and the Download PDF fill.

How it works: a 135° linear gradient with a hard color stop (green on one half, ink on the other) sits on an oversized background. Hover slides `background-position` so the green half crosses the element.

```css
.wash {
  background-image: linear-gradient(135deg, #1C653A 50%, #171717 50%);
  background-size: 300% 300%;
  background-position: 100% 100%;           /* ink showing */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  transition: background-position 300ms ease-out;
}
@media (hover: hover) {
  .wash:hover { background-position: 0 0; } /* green swept in */
}
.wash:focus-visible { background-position: 0 0; }
@media (prefers-reduced-motion: reduce) {
  .wash { transition: none; }
}
```

- Text (nav, Back, project titles): the `.wash` pattern above.
- Download PDF button: same gradient on the button fill without `background-clip: text`; label stays `#F7F6F1`.
- Footer icons and chevrons: SVG strokes can't use `background-clip`. Put the gradient on a wrapper and use the icon as a CSS `mask-image`.
- Wrap hover in `@media (hover: hover)` so phone taps don't leave items stuck green.
- Reduced motion: no sweep, instant color change.
- Check that text stays selectable and that screen readers still read it. `color: transparent` with `background-clip: text` is fine for both, but verify in Safari.
- Tune the angle, duration and stop softness in the browser. A slightly soft stop (for example `48%, 52%`) can look smoother than a hard edge on small text.

**Resume PDF embed**
Embedded PDFs render poorly on iOS Safari and most mobile browsers: often only the first page, or nothing. Plan a fallback, either a first-page image with an "Open PDF" link on small screens or a direct link. Name the file `Raymond-Cen-Resume.pdf`.

**安 symbol**
Newsreader has no CJK glyphs. Use an inline SVG of the character, not a CJK web font. A full CJK font is several MB and would break the 200 KB page budget. Give the link `aria-label="Raymond Cen, home"`.

**Fonts**
Self-host Newsreader (Fontsource package), use `font-display: swap` and preload the regular weight. Only weights 400, 500 and 600 are used.

**Home page SEO**
Home shows no positioning text, so the `<title>`, meta description and Open Graph tags must carry it. Example: "Raymond Cen | CS and Data Science, Oregon State. ML pipelines and data systems."

**Nav state**
Mark the current page with `aria-current="page"`.

**Not designed yet**
`/404`. Keep it minimal: same header, a one-line message and a link home.

## 5. Content still missing

Replace every `[bracketed]` placeholder before launch.

- [ ] Email address for the mailto link
- [ ] LinkedIn and GitHub profile URLs
- [ ] Experience: roles, dates and bullets for Novak Lab and the IT job
- [ ] Experience: IT employer name and location
- [ ] Experience: confirm order (newest first)
- [ ] Projects: your role on FracFeedExtractor, DubBetter Ring, Heart Disease Predictor and BrainBurst
- [ ] Projects: team size for DubBetter Ring, Heart Disease Predictor and BrainBurst
- [ ] Projects: role bullets for every expanded project
- [ ] Projects: which projects have a screenshot or diagram (hide the image slot for the rest)
- [ ] Small Shell: add a repo link or cut it
- [ ] DubBetter Ring: add context to the 70% figure (number of classes, live on edge hardware)
- [ ] Resume PDF file
- [ ] About page content (layout is ready; placeholder paragraphs in the same panel as Experience)

## 6. Quality targets

- [ ] Lighthouse: Performance 95+, Accessibility 100, Best Practices 100, SEO 100
- [ ] Landing page weight under 200 KB
- [ ] Keyboard-only pass: every link, button and accordion reachable with a visible focus ring
- [ ] Skip-to-content link on every page
- [ ] Resume page tested on an actual iPhone
- [ ] Diagonal wash tested in Safari, Chrome and Firefox and with reduced motion turned on

## Change log

2026-10-05: Hosting moved from Cloudflare Pages to Cloudflare Workers static assets. Keeps backend features available later without a migration.
