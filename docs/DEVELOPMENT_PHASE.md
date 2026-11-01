# School Schedule Management — Development Phases

Read [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md) and [DESIGN_GUIDLINES.md](DESIGN_GUIDLINES.md) before implementing any phase. They define approved scope, terminology, rules, architecture, exclusions, and visual decisions.

## Execution and approval rules

This is a spec-driven implementation plan, not authorization to execute every phase. All phases currently have status **Not started**. Start a phase only when the user requests it. After implementation, perform the relevant checks, provide user test instructions and known limitations, and mark it **Awaiting user acceptance**. Only explicit acceptance authorizes advancing when the user also requests the next phase. Rejection returns the phase to **In progress** for fixes.

Allowed statuses: Not started → In progress → Awaiting user acceptance → Accepted. Record acceptance date and evidence in the table below; never infer acceptance from silence. Material scope changes must update the specifications with user agreement.

| Phase | Status      | Acceptance date / evidence |
| ----- | ----------- | -------------------------- |
| 1     | Awaiting user acceptance | —                          |
| 2     | Not started | —                          |
| 3     | Not started | —                          |
| 4     | Not started | —                          |
| 5     | Not started | —                          |
| 6     | Not started | —                          |
| 7     | Not started | —                          |
| 8     | Not started | —                          |
| 9     | Not started | —                          |

## Phase 1: Project Setup and Application Foundation

### Overview

Create the application from the existing documentation/reference repository and prepared frontend dependency manifest. Establish a reproducible development environment without implementing later business features. HeroUI dependencies were installed as an authorized preparation task; Phase 1 was explicitly authorized to begin.

### Requirements

- Explicit authorization to begin Phase 1.
- Preserve `docs/`, `reference/`, and existing Git history/user changes.
- React/TypeScript/Vite frontend, Python/FastAPI backend, SQLite, SQLAlchemy, and Alembic.
- Verify available Python, Node.js, package manager, and Git versions. Document missing prerequisites rather than assume installation.

### User Stories

- As a developer, I can follow documented steps to install dependencies and launch the application.
- As the project owner, I can open a working application shell and verify the API/database connection.

### Tasks

- Inspect repository instructions and installed tools before scaffolding.
- Create the frontend/backend/scripts structure from SYSTEM_OVERVIEW.
- Select compatible supported versions, pin dependencies, and commit lockfiles where appropriate.
- Configure an isolated Python environment, local configuration examples, and ignored secret/runtime files.
- Initialize database configuration and a baseline Alembic migration; verify fresh creation and upgrade.
- Add an API health/readiness endpoint and a frontend shell displaying connection status.
- Preserve the installed HeroUI v3/React 19/Tailwind 4 manifest and lockfile; wire styles into the Vite scaffold.
- Implement the connected top navigation/frame, single-seed palette generation, light/dark/system theme preference, and a small component-state review sample per DESIGN_GUIDLINES.md.
- Verify theme contrast with representative saturated, near-black/white, and grayscale seeds. Ensure warning/error states use text/icons and the same hue, without library-default colors leaking through.
- Establish Ruff/mypy, ESLint/Prettier/TypeScript, pytest/coverage, and Vitest/React Testing Library checks. Add meaningful tests with each implemented behavior; do not add empty placeholder tests or claim application checks pass before app code exists.
- Configure pre-commit for fast formatting/lint checks and pre-push for unit tests; document how to install hooks.
- Add GitHub Actions quality jobs for frontend/backend checks, unit tests with coverage, and the frontend build; verify CI uses the same quality requirements as local commands.
- Add `AGENTS.md`, `docs/CODE_STANDARDS.md`, and `docs/TESTING_GUIDE.md` as persistent project guidance.
- Add root README instructions for prerequisites, exact installation/start/check commands, ports, configuration, and troubleshooting.
- Prepare a production frontend build path suitable for later serving by FastAPI; do not package an executable yet.

### Acceptance Criteria

- A fresh checkout can be set up using the documented commands without replacing reference files.
- Frontend opens in a browser and confirms API/database readiness.
- The selected top route joins the continuous page frame in light and dark modes. Changing one seed recolors all component states; representative contrast and keyboard/mobile checks pass. Provide light/dark screenshots and a second-seed screenshot for review.
- A fresh local database can be created through migrations.
- Tooling and CI execute the configured checks. Application tests/build are added and become mandatory as their implementations arrive; no empty placeholder test suite is counted as meaningful coverage.
- No credentials, virtual environments, dependency folders, or generated databases are tracked.
- Manual test: follow README setup, start both services, open the shell, stop/restart, and confirm readiness again.
- Handoff includes commands run, results, and any prerequisite limitations. Stop for acceptance.

## Phase 2: Administrator Access and Semester Settings

### Overview

Establish the authenticated administrative boundary and editable semester scheduling rules.

### Requirements

- Phase 1 accepted and Phase 2 authorized.
- Public viewing remains unimplemented until Phase 7; administrative endpoints are already protected.
- Use the configurable defaults in SYSTEM_OVERVIEW, without hardcoding them into solver logic.

### User Stories

- As an administrator, I can securely sign in and sign out.
- As an administrator, I can create a semester and define days, hours, increment, and blocked periods.

### Tasks

- Implement safe initial administrator provisioning, password hashing, sessions, and API authorization.
- Add semester/settings schema and migrations.
- Implement settings forms, validation, persistence, and active-semester selection.
- Support enabled weekdays, operating windows, scheduling increment, school timezone, and institution-wide unavailable periods.
- Reject invalid/reversed windows and incompatible intervals.
- Establish revision tracking for changes that affect later draft validation.
- Test authentication boundaries and settings persistence.

### Acceptance Criteria

- Unauthenticated direct API requests cannot read or mutate administrative data.
- Login/logout work; no production default password is embedded.
- A new semester starts with the documented defaults and can be changed to allow Saturday or evening classes.
- Invalid settings display actionable errors and do not persist.
- Manual test: create a semester, change its hours, reload, verify persistence, sign out, and attempt an administrative request.
- Stop for acceptance.

## Phase 3: Academic and Resource Data

### Overview

Build structured data management for the scheduling engine.

### Requirements

- Phase 2 accepted and Phase 3 authorized.
- Academic units remain distinct from contact duration; formal faculty-unit compliance is excluded.
- Manual forms and explicit demo seed data are sufficient; arbitrary spreadsheet import is excluded.

### User Stories

- As an administrator, I can maintain teachers and their approved subjects and availability.
- As an administrator, I can define room capacities/facilities and subject lecture/lab meeting requirements.

### Tasks

- Add program/year, faculty, eligibility, room, facility, subject, component, pattern, and availability records/migrations.
- Create management tables and validated editing forms.
- Define patterns explicitly, including meeting count, durations, allowed days, and any linked timing requirements.
- Support faculty and room unavailable periods and component-specific room feature requirements.
- Represent other duties as blocked times only.
- Add safe referenced-record deletion/archive behavior.
- Provide a small clearly labeled demo dataset covering lecture, chemistry lab, drawing, and PE, without importing private personnel credentials.
- Test incompatible pattern duration, duplicate identifiers, invalid capacity, and availability validation.

### Acceptance Criteria

- Data persists across restart and is editable through the UI.
- A subject can have separate lecture/lab requirements without duplicating its academic units.
- Patterns incompatible with the semester increment or required weekly duration are rejected.
- Chemistry and PE can require distinct room features.
- Manual test: create each resource type, assign eligibility, block faculty/room availability, and attempt invalid entries.
- Stop for acceptance.

## Phase 4: Enrollment, Sections, and Teaching Assignments

### Overview

Turn enrollment and curriculum requirements into explicit schedulable offerings.

### Requirements

- Phase 3 accepted and Phase 4 authorized.
- Fixed-section students only. Teacher selection is manual, not a solver decision.
- Section size bounds are editable; defaults are 15–35.

### User Stories

- As an administrator, I can compare projected and confirmed enrollment and review section proposals.
- As an administrator, I can assign different eligible teachers to different subjects within the same section.

### Tasks

- Implement enrollment scenarios by semester/program/year and balanced section proposals.
- Require review before applying a proposal; handle revisions without silently deleting assignments.
- Associate required subjects with program/year/semester and generate section offerings.
- Assign eligible teachers per offering, defaulting lecture/lab to the same teacher with explicit component overrides.
- Add readiness checks for missing teachers, missing patterns, incompatible room capacity/features, and obvious resource shortages.
- Preserve academic-unit information without enforcing teacher unit targets.
- Test section boundary cases and eligibility/assignment behavior.

### Acceptance Criteria

- 280 students propose eight sections of 35; 300 propose three of 34 and six of 33.
- Zero students produce no sections; infeasible minimum-size cases produce an explanation.
- Projected counts are not overwritten by confirmed counts.
- Class A Mathematics may use Teacher A while Class A English uses Teacher B.
- Lecture and lab default to one teacher but allow an explicit eligible alternative.
- Missing/ineligible assignments are identified before generation.
- Manual test: create both enrollment scenarios, review sections, attach subjects, assign teachers, and inspect readiness findings.
- Stop for acceptance.

## Phase 5: Manual Schedule Playground and Validator

### Overview

Create the shared schedule model, synchronized calendars, and an independent correctness validator before implementing automatic solving.

### Requirements

- Phase 4 accepted and Phase 5 authorized.
- Click-to-edit is sufficient; a full spreadsheet engine and drag-and-drop are excluded.
- Partial drafts are allowed but visibly incomplete. Conflicting edits are rejected.

### User Stories

- As an administrator, I can place a meeting and see it in section, teacher, and room views.
- As an administrator, I receive a clear explanation when an edit is invalid.

### Tasks

- Add draft versions, meetings, canonical day/minute times, and time/room locks.
- Build weekly views, selection filters, full-duration meeting blocks, and editing forms.
- Implement server-side overlap, availability, eligibility, capacity, feature, pattern, and completeness checks.
- Validate and save transactionally; protect against stale edits.
- Show incomplete requirements separately from conflicts.
- Add numeric contact-hour summaries without faculty-unit compliance claims.
- Test back-to-back intervals, multi-day patterns, each resource conflict, incomplete duration, and report-time consistency.

### Acceptance Criteria

- One saved morning meeting displays the same AM time in all three calendars.
- Adjacent 08:00–09:00 and 09:00–10:00 meetings are allowed when other constraints hold.
- Teacher, room, and section overlap attempts are rejected with resource/meeting details.
- Wrong room type, insufficient capacity, unavailable time, and missing component hours are detected.
- Reload preserves meeting data and locks.
- Manual test: enter valid meetings, inspect all views, attempt each conflict category, and verify rejected edits do not alter the draft.
- Stop for acceptance.

## Phase 6: Automatic Schedule Generation

### Overview

Generate complete times and rooms for assigned offerings while enforcing the same rules as the independent validator.

### Requirements

- Phase 5 accepted and Phase 6 authorized.
- OR-Tools CP-SAT; one active background solver job; fixed teacher assignments.
- Solver may select only approved patterns and compatible rooms. No silent constraint relaxation.

### User Stories

- As an administrator, I can generate a draft without freezing the application.
- As an administrator, I can lock selected placements, regenerate, cancel, and understand unsuccessful outcomes.

### Tasks

- Convert snapshot input into solver variables and mandatory constraints.
- Implement a separate solver process, persisted job state, time limit, cancellation, and restart/error handling.
- Preserve locks and prevent input mutation during solving from being silently ignored.
- Distinguish valid results, infeasibility, timeout without solution, cancellation, and execution failure.
- Validate every result independently before accepting it as a valid draft.
- Add actionable preflight diagnostics and honest solver failure messages.
- Test a feasible mixed-component dataset, teacher/resource conflicts, impossible inputs, locks, stale results, cancellation, and timeout status handling.
- Record dataset size and observed runtime; do not set an untested universal performance guarantee.

### Acceptance Criteria

- Representative lecture/lab/drawing/PE requirements receive complete valid placements.
- Teacher assignments are unchanged; locked times/rooms remain unchanged.
- The API stays responsive while solving; a second active job is prevented.
- Impossible input is not presented as a successful or publishable schedule.
- Timeout without a solution is not labeled proven infeasible.
- Changed inputs make an older result visibly outdated and require reconciliation/validation.
- Manual test: generate, inspect all calendars, lock a meeting, regenerate, then test a deliberately impossible room/availability case.
- Stop for acceptance.

## Phase 7: Publication and Public Schedule Viewing

### Overview

Release validated schedule snapshots and provide public read-only browsing.

### Requirements

- Phase 6 accepted and Phase 7 authorized.
- No student or teacher login. Public API data must be explicitly limited to released fields.
- Published history remains stable after master-data edits.

### User Stories

- As an administrator, I can review and publish a complete valid version.
- As a student, I can find my section schedule without signing in.
- As a teacher, I can find my published teaching schedule.

### Tasks

- Implement atomic validation/publication and immutable snapshots of meetings/display data.
- Add a revision-draft action that leaves the current public version intact.
- Create public semester/section/teacher/room filters, responsive calendar/list display, and empty states.
- Display version/publication time and poll for release changes within 15 seconds.
- Show disconnected/last-update state instead of implying stale data is live.
- Test direct draft endpoint access, public data projection, invalid publication, revision isolation, and historical stability.

### Acceptance Criteria

- An incomplete or invalid schedule cannot be published.
- Anonymous users cannot access drafts, credentials, private availability, or administrative notes.
- New public visits receive the current release; open connected pages update within 15 seconds.
- Draft edits and later subject/teacher name changes do not silently rewrite existing published snapshots.
- Manual test: publish v1, open an anonymous browser, edit a revision, confirm v1 remains visible, publish v2, and observe the update.
- Stop for acceptance.

## Phase 8: Excel Reports and Print Layouts

### Overview

Export the selected version using equivalent school-friendly layouts.

### Requirements

- Phase 7 accepted and Phase 8 authorized.
- Use XlsxWriter. Exact visual duplication and workbook reimport/synchronization are excluded.
- Admin may export drafts clearly marked as drafts. Public export, if exposed, is published-only.

### User Stories

- As an administrator, I can download and print section, teacher, and room schedules.
- As an administrator, I can identify which semester/version an exported workbook represents.

### Tasks

- Agree on one equivalent layout per report type using existing references.
- Generate subject names/codes, sections, teachers, rooms, days, time ranges, and appropriate contact-duration totals.
- Add titles, draft/published labels, version identifiers, borders, legend, print areas, orientation, and page scaling.
- Handle long names, valid/unique worksheet names, empty outputs, and text that could otherwise become spreadsheet formulas.
- Test workbook contents against the same canonical version data used by the UI.
- Document that exported files are snapshots and Excel changes do not update the application.

### Acceptance Criteria

- The Calculus morning example remains AM in every exported view.
- Workbook data matches the selected schedule version, including published historical display data.
- Draft exports cannot be mistaken for published output.
- Representative sheets are legible in Excel print preview and a user-reviewed print/PDF result.
- Manual test: export all three report types, compare several meetings to the UI, check long labels, and inspect page breaks/print scaling.
- Stop for acceptance.

## Phase 9: Windows Demo Packaging and End-to-End Acceptance

### Overview

Deliver a repeatable local demonstration and document the later online deployment route.

### Requirements

- Phase 8 accepted and Phase 9 authorized.
- A supported Windows target is selected and recorded during packaging.
- Default server binding is loopback. LAN exposure is not enabled silently.
- Online hosting purchase/deployment and local/cloud synchronization are excluded.

### User Stories

- As an administrator, I can launch the application without installing development tools.
- As the project owner, I can demo the full workflow and recover local data from backup.

### Tasks

- Build the frontend and package the Python backend/solver dependencies with PyInstaller.
- Implement a launcher that starts the server, checks readiness, opens the browser, handles existing instances/port conflicts, and provides shutdown.
- Use persistent application-data storage outside the installation bundle.
- Add safe backup/restore procedures, schema-version checks, and pre-restore protection; document update handling.
- Test the bundle on a clean supported Windows machine without Python/Node development installations.
- Document installation, first admin provisioning, startup/shutdown, logs, recovery, and demo reset without destroying user data.
- Prepare a full demo script using the accepted representative dataset.
- Document future Docker/API/worker hosting, PostgreSQL migration/testing, HTTPS, backups, and monitoring requirements.
- Run end-to-end regression checks for generation, validation, publication, public visibility, and Excel consistency.

### Acceptance Criteria

- Launching the packaged application opens a ready browser interface on the clean Windows target.
- Data survives shutdown/restart; updates do not replace the existing database.
- Backup and restore recover a known schedule and publication version.
- Repeated launch and occupied-port cases produce controlled behavior.
- The complete setup-to-publication-to-export demo succeeds.
- Known limitations and observed solver/package behavior are documented.
- Manual test: install/launch, create or load demo data, generate and publish, export, restart, verify persistence, back up, and restore in a controlled test.
- Stop for final MVP acceptance. Future enhancements require a separate approved phase plan.

## Required phase handoff template

```text
Phase:
Status: Awaiting user acceptance
Implemented:
Checks run and results:
How to launch/test:
Manual acceptance steps and expected outcomes:
Known limitations or blockers:
Specification changes, if any:
User acceptance: Pending
```
