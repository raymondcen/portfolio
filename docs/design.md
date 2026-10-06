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
| **astro-icon** | Inlines SVG icons at build time: LinkedIn, mail, GitHub, Back chevron, accordion chevron and external-link arrow. No icon font and no runtime cost. Plain inline SVG is an acceptable substitute that avoids the dependency. The 嘉安 mark does not use astro-icon: `BaseLayout` imports `src/assets/an.svg?raw` and inlines it. |
| **@astrojs/sitemap** | Generates `sitemap.xml` at build from the routes. Paired with a static `robots.txt` in `public/`. Until launch, `BaseLayout` emits `<meta name="robots" content="noindex">` on every page while `SITE_LIVE` is false. `/404` passes `noindex` so it stays out of the index after launch. |
| **Fontsource (Newsreader)** | Self-hosts the Newsreader font from the npm package instead of loading from Google. Import only weights 400, 500 and 600. Faster and no third-party request. |

### Hosting and services

| Service | Role in this site |
|---|---|
| **GitHub** | Source repo. `main` is production. MIT license for code; written content and resume all rights reserved. |
| **Cloudflare Workers** | Hosting with static assets only: `wrangler.jsonc` serves `dist` and returns `404.html` for unknown routes. No Worker script and no adapter. Workers Builds is connected to the GitHub repo; every push to `main` runs build `npm run build` and deploy `npx wrangler deploy`. Non-production branches get preview URLs from Workers Builds. Free tier, global CDN, automatic HTTPS. Backend features (Workers AI, KV, D1, R2, Cron Triggers) can be added later without migrating. |
| **Cloudflare Registrar** | Domain purchase at cost. Same account as Workers, so DNS and the SSL certificate configure automatically when the custom domain is added to the Worker. |
| **Cloudflare Web Analytics** | Visitor counts and referrers (useful for seeing whether recruiters arrive from LinkedIn or a resume link). Enabled from the Cloudflare dashboard. No cookies and no banner required. |
| **Cloudflare Email Routing** | Forwards a `@rcen.dev` alias to the personal inbox, so the personal address never appears on the site. If the alias draws spam, disable it and create a new one. Free, same account. See "Email spam protection" in section 4. |
| **GitHub Actions** | One workflow on pull requests: `astro check` (type-checks content collections), `npm run build` (catches build errors before Cloudflare deploys) and optionally Lighthouse CI against the performance targets. Deployment itself is handled by Cloudflare, not Actions. |

### Static files in `public/`

- `Raymond-Cen-Resume.pdf`: embedded on `/resume` and used by the Download button
- `og-image.png` (1200x630): preview image when the site is shared on LinkedIn
- `robots.txt`, `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`

### Not used

No backend, database, CMS, contact form, UI component library, animation library (Framer Motion, GSAP) or dark mode. Contact is the mailto link in the footer.

## 3. Design tokens

| Token | Hex | Use |
|---|---|---|
| bg | `#F7F6F1` | Page background |
| selected | `#1C653A` | Hover, focus, 嘉安 |
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

**嘉安 mark**
Newsreader has no CJK glyphs. Use an inline SVG of the characters, not a CJK web font. A full CJK font is several MB and would break the 200 KB page budget. The mark is 嘉安 side by side, 嘉 left of 安. Glyphs are Noto Serif SC Bold converted to SVG paths; no font loads at runtime.

`src/assets/an.svg` has viewBox `0 0 1937 939` (landscape, about 2:1). Fill `#1C653A` sits on a wrapping `<g>`, not on each path, so the `fill="currentColor"` replace in `BaseLayout.astro` recolors both glyphs. `BaseLayout` also strips the C2PA metadata.

Favicon (`public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`): 嘉安 side by side on the `#F7F6F1` rounded square, viewBox `0 0 1127 1127`. Known trade-off: 嘉 is illegible at 16px.

The mark is decorative: not a link, not focusable and not selectable (`select-none`). The SVG is `aria-hidden` since the name sits next to it in the header. It shows on `/` only; every other page shows Back in the same slot.

**Header**
One row on every page, so "Raymond Cen" sits at the same y everywhere. Sizes are CSS variables in `:root` in `src/styles/global.css`, used through Tailwind's `(--var)` shorthand:

| Variable | Value | Use |
|---|---|---|
| `--header-pad` | `1.25rem` | Top and bottom padding (`py-(--header-pad)`) |
| `--header-row` | `4.5rem` | Fixed grid row (`grid-rows-[var(--header-row)]`) and mark height (`h-(--header-row) w-auto`) |
| `--header-back` | `3rem` | Back chevron (`size-(--header-back)`) |

- Header height is `2 x --header-pad + --header-row` (112px) on every page. The row is fixed, so the left slot never changes the header height.
- Grid is `1fr auto 1fr`: left slot, name, empty right column. `items-center` centers the mark, Back and the name on one vertical center.
- The left slot is `justify-self-start`, so the mark and the Back link share the left edge (`px-6`, `sm:px-8`).
- The mark fills the row: 72px tall, about 149px wide. Same size on desktop and mobile.
- Header and footer are sticky with a `bg` background. The mark stays inside the header, so content never scrolls under it.
- Change a size by editing the variable, not the classes. Content taller than `--header-row` overflows the row instead of growing the header.
- Known issue: at 375px the 149px mark widens the left column and "Raymond Cen" wraps to two lines on `/`. Its center stays aligned. Fix with a smaller `--header-row` below `sm` if it matters.
- Not done yet: in-page anchors and keyboard focus can land under the sticky header. Add `scroll-padding-top: calc(var(--header-row) + 2 * var(--header-pad))` on `html` when the first page with anchors ships.

**Fonts**
Self-host Newsreader (Fontsource package), use `font-display: swap` and preload the regular weight. Only weights 400, 500 and 600 are used.

**Home page SEO**
Home shows no positioning text, so the `<title>`, meta description and Open Graph tags must carry it. Home title: "Raymond Cen | CS and Data Science, Oregon State". Other pages use "<Page> | Raymond Cen" (404: "Page not found | Raymond Cen"). Meta descriptions are still `[bracketed]` placeholders.

**Nav state**
Mark the current page with `aria-current="page"`.

**Email spam protection**
Scrapers harvest addresses from `mailto:` links and plain text in HTML. Approach:
- The footer shows a Cloudflare Email Routing alias on `rcen.dev`, never the personal address. A spammed alias is disabled and replaced without touching the inbox.
- The address never appears in the built HTML. The repo and `dist` hold only its parts (for example user and domain stored separately), and a small inline script joins them and inserts the footer email link on page load. This is the one exception to the no client-side JS rule, since the protection can't work without it.
- Without JS the email icon is not rendered. LinkedIn stays as the contact path.
- After deploy, check that the full address does not appear in view-source or in `curl https://rcen.dev`.

**Not designed yet**
`/404`. Keep it minimal: same header, a one-line message and a link home.
