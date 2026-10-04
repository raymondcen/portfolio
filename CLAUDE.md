# Raymond Cen portfolio

Static personal portfolio for recruiters. Astro 7, Tailwind v4, content collections, hosted on Cloudflare Pages. No backend, database, CMS or UI library.

## Source of truth
Read before any layout, styling or content work:
- docs/handoff.md: stack decisions, design tokens, implementation notes
- docs/wireframe.pdf: layout and behavior notes

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

## Writing
Site copy and docs: no em dashes, no serial comma, no filler.

## Workflow
A task is one request that ends with a change to the repo. Questions and explanations are not tasks and trigger none of the updates below.

At session start, read docs/todo.md. Open docs/handoff.md sections only when the task touches them.

### docs/todo.md
After each task:
- Move finished items to `## Done` at the bottom with the date. Keep the 10 most recent.
- Add follow-ups or subtasks the task uncovered under the right heading.
- Add detail to an item only when the next session needs it: file paths, blockers, open questions.
- If nothing changed, leave the file alone.

### docs/handoff.md
handoff.md and the wireframe are the plan. A deviation is any change to scope, routes, tokens, layout, behavior, dependencies or hosting compared with what handoff.md says.
- Ask me before making a design or scope deviation. Implementation details that don't change behavior don't count.
- Once agreed, edit the affected handoff.md section so it states the current decision, update matching todo.md items and add one line to `## Change log` at the end of handoff.md: `YYYY-MM-DD: what changed. Why.` Create the section if missing.
- If the work matches the plan, leave both files alone. No rewording, reformatting or restating.

### End of task
1. `npx astro check` and `npm run build` pass.
2. todo.md updated if needed.
3. handoff.md updated if the plan changed.
4. Append ` | <one-line summary>` to this session's line in .claude/session.md. Replace it if the session does more work later.

Then report which docs changed, or say none did.

## Session
A SessionStart hook (.claude/hooks/session-id.mjs) writes the current and recent session IDs to .claude/session.md, which is local to each machine and gitignored. Don't edit that file except to add the task summary.

@.claude/session.md
