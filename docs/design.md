# Design: rcen.dev

This file is the source of truth for stack, tokens and behavior. Images and PDFs in docs/ are layout references. docs/wireframe.pdf still shows Projects as an accordion on desktop; section 4 supersedes it. It also shows a Home item in the home nav; the Nav section in section 4 supersedes it.

## 1. Decisions

The original plan described a single-page landing. The wireframes replace it.

| Considered | Chosen |
|---|---|
| Single page with anchor sections | Multi-page: `/`, `/experience`, `/projects`, `/resume`, `/about` |
| Hero with positioning line and CTAs | Home is name, nav and icons only |
| Nav with a Home item | No Home item. Home is the nav itself, and Back returns to it |
| Featured cards plus "More projects" | All projects in one list: split view (list plus detail panel) on desktop, accordion on mobile |
| `/projects/[slug]` case study pages | None. Details open in the detail panel on desktop and expand in place on mobile |
| Skills and Contact sections | Omitted. Contact is the footer icons |
| About section on the landing page | Its own `/about` page. Content not decided yet |
| Plain color fade on hover | Diagonal color wash on every hover |
| Cloudflare Pages | Cloudflare Workers (static assets) |
| Novak Lab capstone listed under Experience | Capstone on Projects only; Experience lists paid work |

Unchanged: Astro, Tailwind, content collections, SEO, accessibility and performance targets.

Sitemap: `/`, `/experience`, `/projects`, `/resume`, `/about`, `/resume.pdf`, `/404`.

## 2. Tech stack and how each piece is used

### Build

| Tool | Role in this site |
|---|---|
| **Astro** | Site framework. Builds every page to static HTML at build time. One `.astro` file per route: `index`, `experience`, `projects`, `resume`, `about`, `404`. About is a plain Markdown-driven page, so its text can be edited without touching layout code. A shared `BaseLayout` holds the sticky header, footer icons, fonts and meta tags. Ships zero JavaScript unless a component opts in. The exceptions are the Projects desktop selection island and the footer email script (section 4). The mobile accordion is native HTML. |
| **Tailwind CSS** | All styling. Design tokens from section 3 go in the Tailwind theme (`bg`, `selected`, `ink`, `sub`, `panel`, `panel-2`, `divider`) so classes read `text-ink hover:text-selected`. Name the body text color `ink` in Tailwind: `text-base` is already Tailwind's default font-size class and would collide. The wash animation lives in one small custom CSS file because it uses gradients and masks Tailwind doesn't cover cleanly. Unused classes are stripped at build. The build inlines all CSS into each page (`build.inlineStylesheets: 'always'`) so back navigation never paints an unstyled frame while a separate stylesheet revalidates. |
| **Astro Content Collections + Zod** | Projects and experience entries live as Markdown files in `src/content/projects/` and `src/content/experience/`, one file per entry. Schemas live in `src/content.config.ts`; each collection uses the glob loader on `**/*.md`, and the file name is the entry id used for deep links (`/projects#fracfeedextractor`). Projects frontmatter, required: `title`, `start`, `context` (one of `capstone`, `course`, `hackathon`, `personal`), `teamSize` (positive integer, 1 means solo), `summary`, `tags` (at least one), `status` (one of `complete`, `archived`, `in-progress`) and `order`. Optional: `end` (equal to `start` for a single-month project and shown as one date; absent means present), `contextDetail` (course number or event name and length), `teamNote` (nuance the number cannot carry), `role`, `metric` (prefix "Team result:" when it is not solely mine), `github`, `devpost`, `live` and `video` (URLs) and `image` (`{ src, alt }`, alt required whenever an image exists). Experience frontmatter, required: `title` (the role), `organization`, `location`, `start`, `type` (employment type, not displayed), `summary` (one line), `tags` (at least one) and `order`. Optional: `end` (absent means present), `teamSize`, `role` (assigned team role, distinct from the title) and `github`. Dates are quoted `"YYYY-MM"` strings, not Date objects: a parsed Date is UTC midnight and renders as the previous day in Pacific time, and YYYY-MM strings sort correctly as plain strings. An entry whose end is before its start fails. The body holds the expanded text: for projects one description paragraph followed by the role bullets, for experience the bullets. A Zod schema checks every file at build, so a missing title or broken date fails the build instead of shipping. The Projects and Experience pages loop over these collections. Adding a project means adding one file. |
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

- `resume.pdf`: embedded on `/resume` and used by the Download button
- `og-image.png` (1200x630): preview image when the site is shared on LinkedIn
- `robots.txt`, `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`

### Not used

No backend, database, CMS, contact form, UI component library, animation library (Framer Motion, GSAP) or dark mode. Contact is the mailto link in the footer.

## 3. Design tokens

| Token | Hex | Use |
|---|---|---|
| bg | `#F7F6F0` | Page background |
| selected | `#006930` | Hover, focus, 嘉安 |
| ink | `#171717` | Body text |
| sub | `#64635E` | Secondary text, tags |
| panel | `#E8E7E1` | Experience and Projects card |
| panel-2 | `#DEDDD7` | Image slot, PDF border |
| divider | `#CFCEC6` | Lines between entries |

Font: Newsreader (serif), Georgia fallback.

## 4. Implementation notes

**Projects: desktop split view (viewport ≥ 900px)**
docs/Projects, desktop split view.pdf is the visual reference.

Layout
- The page is locked to the viewport: root height `100dvh`, `overflow: hidden`. The page never scrolls. Only the two panels scroll.
- Header and footer stay at their natural height (`flex-shrink: 0`). Main fills the remaining height (`flex: 1; min-height: 0`).
- Content container: max-width 1120px, centered, 32px horizontal padding, 8px vertical padding.
- Two panels side by side with a 24px gap. Both stretch to the same height and line up top and bottom.
- Left list panel: `flex: 0 1 360px`. Right detail panel: `flex: 1 1 560px; min-width: 0`.
- Both panels: background `panel` `#E8E7E1`, radius 10px, `overflow-y: auto`, `overflow-x: hidden`, `scrollbar-gutter: stable`, thin scrollbar (`#B9B8B3` thumb, transparent track).

List panel
- 8px padding. One row per project, ordered by the display order field.
- Each row is a real `<button>` with `aria-current` on the selected row. Minimum height 44px, padding 14px 16px, radius 6px.
- Row content: title (18px, 600) and dates (13px, `sub` `#64635E`) on one line that wraps when narrow, so the date drops below the title. Summary below (14px, `sub`, line-height 1.4).
- Selected row: background `panel-2` `#DEDDD7` and title in `selected` `#006930`. Unselected rows use the `.wash` hover on the title.
- The selected title holds the wash at its green end (`background-position: 0 100%`). When another row is selected, the previous title runs the wash in reverse: ink sweeps back in from the top right to the bottom left, at the same constant speed. Reduced motion: it turns ink instantly.
- With JS the `panel-2` background is one highlight behind the rows that slides and resizes to the newly selected row (600ms ease-out). It is placed instantly on load and on resize. Reduced motion: it moves instantly. Without JS each selected button keeps its own background.
- The first project is selected on load.

Detail panel
- 28px 32px padding, flex column, 16px gap. All children `flex-shrink: 0`.
- Same section order for every project, skipping empty fields: title (32px, 600; plays the wash sweep to `selected` `#006930` each time the project is shown and stays green, instant green under reduced motion) with dates right-aligned (15px, `sub`) and wrapping when narrow, image slot (220px tall, `panel-2`, only when the project has an image), description (17px, line-height 1.6, max-width 68ch), role bullets, metric line (16px, 600), tag pills (13px, `sub` on `bg` `#F7F6F0`, fully rounded, wrapping), "View on GitHub" link with external-link arrow.
- The panel keeps a fixed shape. It never resizes to fit content.
- `tabindex="0"` and `aria-label="Project details"` so keyboard users can scroll it.
- Reset `scrollTop` to 0 when the selected project changes.

Overflow rules
- No horizontal scrolling anywhere on the page.
- No text clipped outside a panel. Text wraps at word boundaries (`overflow-wrap: break-word`). Titles may break mid-word only as a last resort (`overflow-wrap: anywhere`).
- Fit content first. Vertical scrolling inside a panel is the fallback. Never shrink font size to make content fit.
- Content guideline per project: one description paragraph, two bullets, one metric, about eight tags or fewer.

Behavior
- Selection needs a small island script (vanilla JS or an Astro `client:load` component). Keep it small: click to select, update `aria-current`, swap the detail content and reset its scroll.
- Render every project's detail block in the static HTML and toggle visibility, so content works without JavaScript and stays indexable. Without JS, show all detail blocks stacked.
- No deep links: the URL stays `/projects` with no hash. The first project is selected on every load.

**Projects: mobile (< 900px)**
- Unchanged: the native `<details name="projects">` accordion from the wireframe, with normal page scrolling. Sharing a `name` gives one-open-at-a-time with zero JavaScript in current Chrome, Safari and Firefox. Older browsers allow several open at once, which is an acceptable fallback.
- The first project is open on load. No hash links to individual projects.
- Open item: title and chevron in `selected` `#006930`, like the selected row on desktop. Closed items use the `.wash` hover.
- The viewport lock does not apply below 900px.

**Diagonal wash animation**
Every hover color change uses a diagonal wash: green `#006930` sweeps over ink `#171717` at a 45° angle, bottom-left to top-right. Unhovering reverses the sweep. Applies to nav items, Back, footer icons, project titles and chevrons and the Download PDF fill.

How it works: a 45° linear gradient with a hard color stop (green on the bottom-left half, ink on the top-right half) sits on a background twice the element's size. At rest `background-position: 100% 0` shows ink, with the edge on the bottom-left corner. Hover slides it to `0 100%` so the green half crosses the element and the edge ends on the top-right corner.

Constant speed: the edge moves at the same pixel speed on every element, so short titles finish sooner than long ones. Duration is `--wash-size` (the element's width plus height in px) times `--wash-ms-per-px` (2ms, in `:root` in global.css, the one knob for wash speed), with `linear` timing. A small inline script in BaseLayout sets `--wash-size` on every `.wash` with a ResizeObserver, so it stays right through resizes, wrapping, font loading and hidden blocks being shown. Without JS it falls back to 240 (480ms). The mobile chevron has a fixed 24px box, so its size is a constant 48 in CSS.

```css
.wash {
  background-image: linear-gradient(45deg, var(--color-selected) 50%, var(--color-ink) 50%);
  background-size: 200% 200%;
  background-position: 100% 0;                /* ink showing */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  --wash-duration: calc(var(--wash-size, 240) * var(--wash-ms-per-px));
  transition: background-position var(--wash-duration) linear;
}
@media (hover: hover) {
  .wash:hover { background-position: 0 100%; } /* green swept in */
}
.wash:focus-visible { background-position: 0 100%; }
@media (prefers-reduced-motion: reduce) {
  .wash { transition: none; }
}
```

- Text (nav, Back, project titles): the `.wash` pattern above.
- Download PDF button: same gradient and direction (bottom left to top right) on the button fill without `background-clip: text`; label stays `#F7F6F0`.
- Footer icons and chevrons: SVG strokes can't use `background-clip`. Put the gradient on a wrapper and use the icon as a CSS `mask-image`. Same direction: green enters from the bottom left.
- Back chevron, interim: it turns `selected` instantly on hover or keyboard focus of the Back link (`group-hover:text-selected group-focus-visible:text-selected`), with no sweep. Replace it with the mask-image wash above.
- Wrap hover in `@media (hover: hover)` so phone taps don't leave items stuck green.
- Reduced motion: no sweep, instant color change.
- Check that text stays selectable and that screen readers still read it. `color: transparent` with `background-clip: text` is fine for both, but verify in Safari.
- Tune the angle, duration and stop softness in the browser. A slightly soft stop (for example `48%, 52%`) can look smoother than a hard edge on small text.

**Experience**
The Novak Lab capstone is shown under Projects only, not Experience.

- The whole page scrolls with header and footer sticky. No `lockViewport` and no inner scroll box.
- One `panel` card, centered, max-width 720px, radius 10px, padding 28px 32px.
- Entries are ordered by `order` ascending. A `divider` line separates entries, with none after the last.
- Each entry is an `<article>` laid out as:
  ```
  Title                         Dates
  Organization               Location

  One-line summary
  - Bullets
  ```
  Row one: the role (`title`, 24px, 600, `ink`) on the left, dates (15px, `sub`, italic, same format as Projects) on the right. Row two: `organization` on the left, `location` on the right (both 15px, `sub`). Each row wraps when narrow, dropping its right item under the left.
- Then the one-line `summary` (17px, line-height 1.6, max-width 68ch), the body bullets styled like the Projects role bullets and tag pills identical to Projects.
- `type` is not displayed.
- Nothing on the page is interactive: no hover effects and no JS.

**Resume**
The file is `public/resume.pdf`. The page shows the PDF and a Download PDF button (`download="resume.pdf"`). No visible heading so the PDF gets the height; a screen-reader-only `<h1>Resume</h1>` keeps the page outline.

- Desktop (≥ 900px): `<object data="/resume.pdf#navpanes=0&view=FitH" type="application/pdf">` with a `title` for screen readers and an "Open PDF" link as fallback content. Border `selected`, centered, max-width 860px so a letter page reads at about 100% in Chrome's viewer. The page uses `lockViewport`: the object fills the height between header and footer and the PDF scrolls inside it. On short windows the object shrinks rather than the page scrolling.
- Mobile (< 900px): no embed, since iOS Safari and most mobile browsers show one page or nothing. Instead a direct "Open PDF" link (new tab, `aria-label` ending "(opens in new tab)") and the Download button. The switch is Tailwind responsive classes, no JS.
- Download button: `ink` fill, `bg` label, `.btn-wash` in global.css. Its `--wash-size` is a constant 226 (the button's fixed width plus height), since BaseLayout's observer only measures `.wash`.

**嘉安 mark**
Newsreader has no CJK glyphs. Use an inline SVG of the characters, not a CJK web font. A full CJK font is several MB and would break the 200 KB page budget. The mark is 嘉安 side by side, 嘉 left of 安. Glyphs are Noto Serif SC Bold converted to SVG paths; no font loads at runtime.

`src/assets/an.svg` has viewBox `0 0 1937 939` (landscape, about 2:1). Fill `#006930` sits on a wrapping `<g>`, not on each path, so the `fill="currentColor"` replace in `BaseLayout.astro` recolors both glyphs. `BaseLayout` also strips the C2PA metadata.

Favicon (`public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`): 嘉安 side by side on the `#F7F6F0` rounded square, viewBox `0 0 1127 1127`. Known trade-off: 嘉 is illegible at 16px.

The mark is decorative: not a link, not focusable and not selectable (`select-none`). The SVG is `aria-hidden` since the name sits next to it in the header. It shows on `/` only; every other page shows Back in the same slot. Hovering the mark shows `"blessed peace"`, quotation marks included, through the native `title` tooltip. Keyboard and touch users don't see it, which is acceptable for decoration.

**Header**
One row on every page, so "Raymond Cen" sits at the same y everywhere. Sizes are CSS variables in `:root` in `src/styles/global.css`, used through Tailwind's `(--var)` shorthand:

| Variable | Value | Use |
|---|---|---|
| `--header-pad` | `1.75rem` | Top and bottom padding (`py-(--header-pad)`) |
| `--header-row` | `3.5rem` | Fixed grid row (`grid-rows-[var(--header-row)]`) |
| `--header-mark` | `2.625rem`, `--header-row` from `sm` | Mark height (`h-(--header-mark) w-auto`) |
| `--header-back` | `2.25rem`, `3rem` from `sm` | Back chevron (`size-(--header-back)`) |

- Header height is `2 x --header-pad + --header-row` (112px) on every page. The row is fixed, so the left slot never changes the header height.
- Grid is `1fr auto 1fr`: left slot, name, empty right column. `items-center` centers the mark, Back and the name on one vertical center.
- The left slot is `justify-self-start`, so the mark and the Back link share the left edge (`px-6`, `sm:px-8`).
- Back text is `text-lg` below `sm` and `text-2xl` from `sm`. Below `sm` the link also has `pr-4` so it keeps a gap before the name.
- From `sm` the mark fills the row: 56px tall, about 116px wide. Below `sm` it is 42px tall and has `pr-4`, matching Back.
- Header and footer are sticky with a `bg` background. The mark stays inside the header, so content never scrolls under it.
- Change a size by editing the variable, not the classes. Content taller than `--header-row` overflows the row instead of growing the header.
- At 375px "Raymond Cen" fits on one line on every page.
- No skip link. The header holds at most one link (Back), so keyboard users reach the content in one Tab.
- Not done yet: in-page anchors and keyboard focus can land under the sticky header. Add `scroll-padding-top: calc(var(--header-row) + 2 * var(--header-pad))` on `html` when the first page with anchors ships.

**Fonts**
Self-host Newsreader (Fontsource package), use `font-display: swap` and preload the regular weight. Only weights 400, 500 and 600 are used.

**Home page SEO**
Home shows no positioning text. Home title: "Raymond Cen". The home meta description and Open Graph description must carry the positioning (CS and Data Science, Oregon State). Other pages use "<Page> | Raymond Cen" (404: "404 | Raymond Cen"). Meta descriptions are still `[bracketed]` placeholders, including home's `[Home meta description]`.

**Nav**
The nav shows on `/` only, in this order: Resume, Experience, Projects, About. Resume is first because it is what most recruiters want. There is no Home item: `/` is the nav, and every other page returns to it through Back. The header name is not a link.

Mark the current page with `aria-current="page"`.

**Footer links**
LinkedIn and GitHub open in a new tab (`target="_blank" rel="noopener noreferrer"`), and their `aria-label` ends in "(opens in new tab)" so screen readers announce it. `BaseLayout` applies this to any `http` href in `socials`. Email (`mailto:`) opens in the same tab.

**Email spam protection**
Scrapers harvest addresses from `mailto:` links and plain text in HTML. Approach:
- The footer shows a Cloudflare Email Routing alias on `rcen.dev`, never the personal address. A spammed alias is disabled and replaced without touching the inbox.
- The address never appears in the built HTML. The repo and `dist` hold only its parts (for example user and domain stored separately), and a small inline script joins them and inserts the footer email link on page load. This is the one exception to the no client-side JS rule, since the protection can't work without it.
- Without JS the email icon is not rendered. LinkedIn stays as the contact path.
- After deploy, check that the full address does not appear in view-source or in `curl https://rcen.dev`.

**404 page**
`/404`: same header and footer. Centered between them, a large "404" in `selected` (`font-medium`, `text-8xl`, `sm:text-9xl`) with "This page doesn't exist" below in `ink` (`text-xl`, `sm:text-2xl`). Nothing else: the header Back link is the way home. `wrangler.jsonc` sets `not_found_handling: "404-page"`, so unknown routes get `404.html` with a 404 status.
