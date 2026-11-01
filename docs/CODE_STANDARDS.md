# Code Standards

These standards apply to each implementation phase. `AGENTS.md` and the phase acceptance criteria require them.

## General

- Prefer clear names, small modules/functions, explicit data boundaries, and predictable error handling.
- Validate external input at API/UI boundaries. Do not hide invalid or incomplete schedule data.
- Keep source, tests, configuration, and documentation formatted consistently.
- Add dependencies only when they directly support approved scope; pin versions in lockfiles/configuration.

## Python

- Use Python 3.13-compatible syntax, type annotations, and Ruff formatting/linting.
- Use explicit domain types and timezone-aware timestamps for events. Keep timetable local day/minutes distinct from audit timestamps.
- Avoid hidden global state; inject persistence and external services where practical.
- Use pytest; name files `test_*.py`. Add meaningful assertions for expected results and failure paths.
- Use mypy strict checks for backend code.

## TypeScript and React

- Keep TypeScript strict; avoid `any` and non-null assertions unless validated and narrowly justified.
- Follow ESLint React Hooks rules. Keep components focused and move reusable domain logic into typed functions/modules.
- Keep API/data transformations outside presentational components where practical.
- Use accessible names, labels, keyboard interactions, and clear loading/empty/error states.
- Use Vitest and React Testing Library; test visible behavior, user interaction, and meaningful failure states.

## Tests and quality gates

- Add a unit/component/integration test for each changed behavior at its most useful boundary.
- Every reproducible bug fix gets a regression test.
- Add browser tests for critical complete workflows as those workflows are implemented.
- Target at least 80% line and branch coverage overall and 90% for core scheduling/domain rules, while testing each hard rule explicitly. Excluded generated/vendor code must be documented.
- Run the checks listed in `TESTING_GUIDE.md`; CI repeats required checks even if local hooks are skipped.
- No blanket lint suppressions or silent coverage threshold changes.
