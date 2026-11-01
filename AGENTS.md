# Project Instructions for Coding Agents

Before changing code, read:

1. `docs/SYSTEM_OVERVIEW.md`
2. `docs/DEVELOPMENT_PHASE.md`
3. `docs/DESIGN_GUIDLINES.md` for frontend work
4. `docs/REQUIREMENTS.md` for the original user brief
5. `docs/CODE_STANDARDS.md`
6. The active phase's acceptance criteria and `docs/TESTING_GUIDE.md`

## Phase gate

- Work only on the phase the user explicitly names/authorizes. Overall project approval does not authorize implementation of every phase.
- Keep the phase status accurate in `DEVELOPMENT_PHASE.md`. Never mark a phase accepted for the user.
- Finish that phase only, report checks and manual verification steps, then stop for user testing/acceptance before the next phase.
- Preserve user data, reference files, and unrelated changes. Do not create extra features to fill gaps in a phase.

## Tests are part of every feature

- Every behavior change includes automated tests at the appropriate level; every reproducible bug fix includes a regression test.
- Add tests alongside the implementation, covering success, meaningful boundary cases, and failure/permission paths where relevant.
- Test scheduling rules and publication invariants directly. Do not rely on coverage percentage as evidence that behavior is correct.
- Never delete, weaken, skip, or lower a test/quality threshold to get a passing build without explaining the issue and asking the user.
- Run all affected lint, format, type, and test checks before reporting completion. CI is authoritative even when a local hook was bypassed.
- For nontrivial or version-sensitive third-party APIs, consult current library documentation through Context7 when available; follow the versions pinned in the project.
- If a check cannot run, state why and give the user a clear manual check; do not claim it passed.

## Code quality and security

- Follow `docs/CODE_STANDARDS.md`; use Python type hints, strict TypeScript, small cohesive modules, explicit validation, and actionable errors.
- Treat `docs/DESIGN_GUIDLINES.md` as a binding specification for every frontend phase. Keep its layout, token, surface, control, and layering rules; do not introduce one-off visual alternatives.
- Before implementing a UI primitive or layout, search the installed HeroUI v3 component inventory and official documentation. Prefer composing available accessible components; add custom wrappers or styling only for product-specific needs the library does not cover.
- Use HeroUI components for form controls and keep their selected values, placeholders, and swatches vertically centered across the interface.
- Use semantic theme tokens for every shell, frame, card, field, text, and state color. The body and topbar share the shell token; the active navigation tab and workspace frame share the subtle surface token; cards use the pure surface token. Do not hardcode colors in components.
- Keep the topbar at 20px padding on every side. Keep the workspace frame as the single vertical scroll region, filling the remaining viewport with a 20px outer gutter and 20px corner radius. The frame uses the subtle surface token and stays above the topbar/tab in stacking order so it covers reverse-radius tab overflow cleanly.
- Separate cards and form controls with background colors only: no card or input borders, outlines, or shadows. Inputs show keyboard focus with a background change. Preserve visible focus treatment on other interactive controls.
- Use Lucide React from `lucide-react` for interface icons. Keep decorative icons hidden from assistive technology and give icon-only controls accessible names.
- Run `pre-commit run --all-files` before handing off a phase.
- Keep credentials/secrets out of source, use parameterized persistence/API access, and enforce authorization server-side.
- Do not automatically change functional behavior to appease a linter. Explain intentional suppressions narrowly and locally.
- Do not auto-commit or push. Report files changed, commands/check results, and manual acceptance steps.
