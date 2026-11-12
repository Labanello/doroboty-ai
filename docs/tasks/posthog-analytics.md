# PostHog analytics (optional)

Slug: `posthog-analytics`
Created: 2026-11-12

## Goal

See page views and clicks from the published prototype in PostHog (course quest "Event Scout"), without changing the product contract for anyone who does not opt in: tests, the participant package and local development stay free of external requests.

## Context

- The project has no analytics by design (BRIEF.md, FEATURES.md AUTH/OPS entries). This task adds one **opt-in** exception, recorded as OPS-12.
- The app is a static GitHub Pages site with hash routes and fictional data only. Real testers may use it (T1 test), so form values and recordings must not be collected.

## Decisions

- **Opt-in by build variable.** `VITE_POSTHOG_KEY` (public `phc_` project key) and optional `VITE_POSTHOG_HOST`, set as GitHub repository variables and passed to the Pages build. Personal `phx_` keys are rejected in code.
- **Library loaded lazily** with a dynamic import, so builds without a key never fetch it.
- **Autocapture limited** to clicks on `a` and `button`. Page views are sent by hand per hash route change (the router, not the History API, drives navigation).
- **No cookies or local storage** (`persistence: "memory"`), no session recording, no person profiles, Do Not Track respected, so no consent banner is needed. This trades unique-visitor counting for privacy.
- **EU host by default** (`https://eu.i.posthog.com`).
- Not used: the PostHog wizard/MCP plugin (it needs an interactive login and rewrites files), and cookieless server hash mode (it needs a project setting, otherwise events are dropped).

## Acceptance Criteria

- [x] Without a key nothing loads or is sent; the existing e2e "no external requests" tests are unchanged.
- [x] With a (fake) key and PostHog traffic intercepted: a `$pageview` per route change with the hash URL, a `$autocapture` for a link click and a button click, no text-field values in any payload, no cookies, no PostHog local storage.
- [x] The privacy page states whether analytics is on.
- [ ] Production: one page view and one click visible in PostHog Activity → Live (needs the real key).
- [x] `npm run check` equivalents pass (format, lint, types, unit tests, build, e2e on Edge).

## Files / Areas

- `src/lib/analytics.ts`, `src/lib/analytics.test.ts`
- `src/features/prototype/app.tsx` (page view tracker), `settings.tsx` (privacy text)
- `.github/workflows/pages.yml` (repository variables), `docs/release-github-pages.md`, `FEATURES.md`

## Risks

- Ad blockers and Do Not Track hide events. A missing event is not proof that nothing was clicked.
- The public project key is in the bundle; anyone can send fake events to the project. Acceptable for a course prototype; do not base decisions on this data.
- `core-js` (a posthog-js dependency) has a harmless install-time funding message script.
