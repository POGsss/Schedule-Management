# Testing Guide

Tests are part of each feature and bug fix. Follow the active phase and `AGENTS.md`.

## First-time local setup

From the repository root in PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.lock
.venv\Scripts\pre-commit install --hook-type pre-commit --hook-type pre-push
Push-Location frontend
npm ci
Pop-Location
```

CI installs the same Python and Node toolchains automatically. Keep `frontend/package-lock.json` committed.
The Phase 1 application shell and readiness endpoint have focused frontend and backend integration tests. New application behavior requires tests alongside its implementation.

## Required change evidence

- New behavior: focused automated tests covering normal use and meaningful boundaries/errors.
- Bug fix: regression test reproducing the bug before the fix and passing after it.
- API/security change: integration coverage for authorization and invalid input.
- Scheduling change: tests for the corresponding resource/availability/duration invariant.
- UI workflow change: component tests, and browser coverage for critical complete flows.

Choose the smallest test level that verifies the behavior. Do not create tests that simply restate implementation details.

## Commands

From project root:

```powershell
pre-commit run --all-files
python scripts/run_backend_tool.py pytest --cov=backend --cov-branch --cov-report=term-missing
Push-Location frontend
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run build
Pop-Location
```

Apply the baseline database migration before running the application:

```powershell
python scripts/run_backend_tool.py alembic -c backend/alembic.ini upgrade head
```

Use Vitest watch mode with `npm run test:watch` while developing. Run one test by passing the file path after `npm run test --`.

## Coverage

Initial gate: at least 80% line and branch coverage for measured backend/frontend application code. Target at least 90% for scheduling/domain logic, with direct tests for every hard constraint. Coverage is a floor, not proof that test assertions are useful. Adjust excludes only for generated or third-party code and explain them. CI must fail if a configured threshold is missed.

## Manual handoff

For each phase, report commands run, pass/fail results, tests added, limitations, and concise manual steps with expected outcomes. The user verifies the phase before authorizing the next one.
