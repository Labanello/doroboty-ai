# "Co zrobiłem sam" proof card

Slug: `proof-card`
Created: 2026-11-03

## Goal

Help a non-technical recruiter check, before the first interview, what an AI candidate did themselves. Candidates fill an optional three-field card when applying; employers see the card with a simple concreteness rating and two template interview questions in the candidates list and the application detail.

## Context

Participant discovery (AIPH3, weeks 2–3, Supersprint cycle `tydzien-2-ponowny-zakup`):

- Interviews F1, F3, F4: recruiters cannot verify AI candidates' own work before the interview.
- Case data: for applications scoring 85+, "continue" after the interview fell from 58.0% (May) to 17.9% (June 2026).
- Selected opportunity O1, idea P1 ("Co zrobiłem sam" card + 2 first-interview questions), planned test T1.

## Plan

- [x] Review relevant code/docs
- [x] Optional `proof` on drafts and applications (Zod), submit action, Marek's example application with a vague card
- [x] `proof.ts`: field rating rule and template questions, with unit tests
- [x] Candidate application form: three optional fields
- [x] Employer: card tag in the candidates list; card + questions in the process view
- [x] Update FEATURES.md; run verification; desktop/mobile/keyboard check

## Acceptance Criteria

- [x] A candidate can submit with or without the card; the existing answer/consent rules are unchanged.
- [x] The card is stored immutably with the application, survives reload, export and import; old saves without a card still load.
- [x] The employer sees "Karta x/3" (or "Brak karty") per application and, in the detail, the three fields with "Konkret" / "Ogólnie" / "Brak" plus exactly two questions that say which field they check.
- [x] Rating and questions are labelled as a simple prototype rule and templates, not AI.
- [x] The existing review → invite stage flow still works from the same screen.
- [x] `./scripts/verify` passes (or actual failures are reported).

## Files / Areas

- `src/features/prototype/model.ts`, `proof.ts` (new), `proof.test.ts` (new)
- the application form (`marketplace.tsx`) and the employer views (`recruiting-application.tsx`, `workspace.tsx`)
- `FEATURES.md`

## Risks

- The rule (at least 40 characters and a number) is a crude proxy; a candidate can game it. This is acceptable for a UI test and stated in the UI.
- A longer application form may lower completion; the card is optional.

## Handoff Notes

- Implemented on branch `feature/proof-card`. Employer tab order is Karta → Odpowiedź → CV; candidates keep Odpowiedź → CV and get Karta last only when they submitted a card.
- Checks run 2026-11-03: format:check, design-system:check, lint, typecheck, vitest (34), verify:packet and build passed. Playwright Chromium is not provisioned on this machine, so the e2e suite ran with a temporary local config using the installed Microsoft Edge channel: 35 passed. This includes 5 existing journeys whose expectations were updated for the new first tab and the three extra fields, plus a new proof-card journey with an axe check and 1280/390/320 px overflow checks. `./scripts/verify` itself was not run (it needs bash and the provisioned Chromium).
- Repo-local `core.autocrlf=false` was set because the machine's global `true` broke the kit hash check and Prettier.
