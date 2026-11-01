# School Schedule Management — System Overview

Status: approved MVP plan; Phase 1 implementation is awaiting user acceptance.

## Purpose

Replace manual semester timetable plotting with a web application that places class meetings into valid times and rooms. Administrators maintain school data, assign teachers, generate and review schedules, and publish them. Students and teachers browse released schedules without signing in.

The project root is `schedule-management/`. Quality tooling and UI dependencies were prepared before Phase 1; the application foundation is now implemented and awaiting user acceptance. Project setup is explicitly included in Phase 1.

## Specification authority and agent instructions

- Read this file, [DEVELOPMENT_PHASE.md](DEVELOPMENT_PHASE.md), and [DESIGN_GUIDLINES.md](DESIGN_GUIDLINES.md) before implementing a phase.
- Visual direction: HeroUI v3, connected top navigation/frame, flat monochrome seed-derived light/dark themes. The design guidelines govern component and token decisions.
- The original narrative is preserved in [REQUIREMENTS.md](REQUIREMENTS.md); approved scope refinements in these specifications govern implementation.
- Implement only the phase explicitly authorized by the user. Approval of the overall plan or generation of these files does not authorize all implementation phases.
- Complete relevant checks, provide manual test instructions, and stop for user acceptance after each phase. Fixing the current phase does not authorize the next phase.
- Do not silently expand scope, change approved rules, or treat defaults as verified institutional policy. Record material changes in both affected specifications and obtain user agreement.
- Preserve reference files and user changes. Do not replace existing project content during scaffolding.
- Never claim solver performance, print fidelity, or packaging compatibility without testing it.

## Users and access

| User          | Capabilities                                                                   |
| ------------- | ------------------------------------------------------------------------------ |
| Administrator | Authenticated management of data, drafts, generation, publication, and exports |
| Public viewer | Browse published schedules by semester, section, teacher, or room              |

Student and teacher accounts are outside MVP. Public access must exclude drafts, credentials, private availability, administrative notes, and faculty personnel details. Authorization is enforced by the API, not only the interface.

## Approved MVP scope

- Semester configuration, teaching days, operating hours, and blocked periods.
- Subjects, academic units, lecture/laboratory components, approved meeting patterns, and room requirements.
- Faculty eligibility, availability, rooms, capacity, facilities, and availability.
- Projected and confirmed enrollment, section proposals, and reviewed fixed sections.
- Section subject offerings with explicit administrator-assigned eligible teachers.
- Automatic time and room placement, manual edits, locks, and independent validation.
- Draft versions, immutable published snapshots, and revision workflows.
- Synchronized section, teacher, and room calendars with subject names and time allotments.
- Public viewing and formatted Excel exports using equivalent school layouts.
- A Windows local demo launcher, persistent storage, backup/restore, and documented online deployment path.

## Explicit exclusions

- Automatic selection of teachers or allocation of subjects to achieve faculty unit targets.
- Enforcement of minimum, target, or maximum faculty academic-unit loads.
- Individual irregular-student enrollment conflicts, cross-section electives, and automatic laboratory subgroup formation.
- Automatic allocation or formal accounting of research, extension, and administrative duties.
- Arbitrary document ingestion, live Google integration, or Excel edits synchronized back into the application.
- Multi-campus optimization, simultaneous collaborative editing, and multi-stage institutional approval.
- Student/teacher accounts and actual cloud deployment in the initial implementation phases.

## Critical definitions

| Term               | Meaning                                                                |
| ------------------ | ---------------------------------------------------------------------- |
| Section            | Fixed student group belonging to a program/year in a semester          |
| Subject            | Curriculum item with a code, name, and academic units                  |
| Offering           | One subject delivered to one section in one semester                   |
| Component          | Lecture, laboratory, or other required part of an offering             |
| Meeting pattern    | Approved combination of weekly days and durations for a component      |
| Meeting            | A scheduled day, start/end time, teacher, room, and offering/component |
| Academic units     | Subject credits; the user's faculty-load concept is based on these     |
| Contact hours      | Actual scheduled teaching duration, distinct from academic units       |
| Published snapshot | Frozen schedule and display data released for public viewing           |

Assign teachers to offerings/components, never to an entire section. Class A may have Mathematics with Teacher A at 08:00–09:00 and English with Teacher B at 09:00–10:00. A teacher can teach multiple sections at non-overlapping times.

For lecture and laboratory, default to the same teacher. Allow an explicit different eligible teacher per component. Do not duplicate a subject's academic units across recurring meetings or components. Display contact-hour totals; do not label the MVP as verifying faculty workload compliance.

## Configuration defaults

Administrators review and may change these per semester:

| Setting                        | Initial default                                                      |
| ------------------------------ | -------------------------------------------------------------------- |
| Teaching days                  | Monday–Friday                                                        |
| Teaching window                | 07:00–19:00                                                          |
| Saturday                       | Disabled; can be enabled                                             |
| Scheduling increment           | 30 minutes                                                           |
| Section size                   | Minimum 15; maximum 35                                               |
| Institution-wide lunch closure | None; configurable breaks and unavailable periods                    |
| Timezone                       | Asia/Manila for school-local display; configurable semester metadata |

The timezone is a proposed implementation default for the Philippine school, not a verified institutional requirement. Store weekly times consistently as school-local day/minutes and timestamp audit/publication events with timezone-aware timestamps. Reject durations incompatible with the configured scheduling increment.

Treat other duties and breaks as unavailable intervals. Changing rules or source data invalidates affected draft validation; it must not mutate published schedules.

## Section planning

For a nonzero enrollment N within a single program/year grouping:

`minimum_sections = ceil(N / maximum_size)`

`maximum_sections = floor(N / minimum_size)`

Propose the minimum feasible section count and distribute students as evenly as possible. For 280 students, propose eight sections of 35. For 300, propose nine sections: three of 34 and six of 33. Zero enrollment produces no sections. If no feasible count exists, show a policy problem rather than silently exceeding limits.

Keep projected and confirmed enrollment separate. The administrator chooses the scenario and reviews proposed sections. Capacity checks may reveal that facilities require smaller sections. Do not silently merge programs, split laboratories, or change approved section counts to make solving easier.

## Scheduling contract

Inputs: fixed sections, required subject components, assigned teachers, allowed patterns, room compatibility, availability, settings, and locks.

Solver decisions: allowed pattern, meeting times, and compatible rooms. It may not silently change teachers, curriculum requirements, section counts, or hard constraints.

Mandatory rules:

1. No teacher, section, or room has overlapping meetings.
2. Faculty assignment is eligible and available.
3. Room capacity and required facilities satisfy the meeting requirements.
4. Meetings fit enabled days, operating hours, and availability.
5. Every required component has its full weekly contact duration in an approved pattern.
6. All explicitly locked assignments are respected.
7. Every required offering is represented; zero conflicts alone does not establish completeness.

Use half-open intervals: 08:00–09:00 and 09:00–10:00 do not overlap. Recurring patterns expand into all constituent weekly meetings for validation. Unless explicitly modeled later, a meeting occupies one room exclusively.

First prioritize a complete feasible schedule. Optional preferences such as fewer gaps can be added within Phase 6 only if they do not delay required functionality or weaken mandatory rules. Never claim an optimal schedule unless the solver proves optimality for the implemented objective.

Run an independent server-side validator on manual edits, solver results, and before publication. A conflicting edit is rejected with reasons. A partial draft may exist but must display missing requirements and cannot be published.

## Generation jobs

- Run the solver in a separate process so the API stays responsive.
- MVP permits one active generation job at a time.
- Persist job status and use a fixed input snapshot/revision identifier.
- Provide cancellation and a configurable solve time limit.
- Distinguish valid solution, proven infeasible, time limit without solution, cancellation, and execution error.
- A timeout without a solution does not prove impossibility.
- Detect changed inputs; outdated results require reconciliation and validation before use/publication.
- Preflight checks explain missing assignments, absent compatible rooms, and obvious shortages. Detailed solver conflict explanations are best-effort, not a promise to identify a minimal cause.
- Never silently publish partial solver results or relax rules.

## Schedule lifecycle and consistency

Workflow: configure → enter data → review sections → assign teachers → readiness check → generate/edit draft → validate → publish.

All calendars and Excel exports read one selected schedule version. Store canonical numeric times and format them consistently with explicit AM/PM in human-facing reports. The confirmed reference error—Calculus morning in room plotting but PM in the class schedule—must not be reproducible through separate report entry.

Consistent views cannot detect every mistaken input: a permitted evening time may still be unintended. Operating-hour validation and review make that mistake visible.

Publication atomically releases a validated snapshot, including the names and display data needed to keep historical reports stable. Revision edits occur in a new draft. The previous published version remains public until its replacement is released. Prevent source-record deletion from damaging existing offerings or history.

Public pages show semester, version, publication time, and last-update/connection state. Connected open pages check for new releases within 15 seconds; disconnected clients cannot receive updates and must not imply freshness. Public API responses must contain only released public data.

## Interface

- Semester overview: readiness, counts, generation state, and publication state.
- School data: spreadsheet-style management tables and clear validation.
- Rules: semester hours, availability, patterns, and compatibility forms.
- Playground: section/teacher/room tabs, weekly grid, full-duration meeting blocks, click-to-edit panel, locks, and validation panel.
- Publication/exports: completeness summary, release action, and downloadable reports.
- Public portal: semester and section/teacher/room lookup, responsive timetable/list view.

Click-to-edit is sufficient for MVP; drag-and-drop is deferred. The playground is not a full Excel engine. Use labels alongside colors and retain keyboard-accessible forms.

## Architecture and project structure

| Concern               | Choice                                                    |
| --------------------- | --------------------------------------------------------- |
| Frontend              | React 19 + TypeScript + Vite; HeroUI v3 + Tailwind CSS v4 |
| Backend               | Python + FastAPI                                          |
| Solver                | OR-Tools CP-SAT, separate process                         |
| Persistence           | SQLAlchemy + Alembic                                      |
| Local database        | SQLite                                                    |
| Hosted database later | PostgreSQL                                                |
| Excel                 | XlsxWriter                                                |
| Windows packaging     | PyInstaller bundle and launcher                           |
| Future hosting        | Docker-based API/worker deployment, HTTPS                 |

Proposed scaffold:

```text
frontend/                 Browser interface
backend/app/api/          Routes and access checks
backend/app/domain/       Rules, validation, and scheduling contracts
backend/app/services/     Jobs, publication, and exports
backend/app/persistence/  Models and database access
backend/tests/            Meaningful backend tests
backend/alembic/          Schema migrations
scripts/                 Development and packaging helpers
docs/                    Specifications and operating instructions
reference/               Preserved original examples
```

HeroUI and compatible React/Tailwind dependencies have been prepared in `frontend/package.json` and its lockfile ahead of Phase 1, with no application scaffold yet. Preserve and extend them. Select and pin remaining compatible supported runtime/dependency versions during Phase 1; document prerequisites and exact commands then. Do not assume Python or Node is already installed. The production backend serves the compiled frontend; development may use separate frontend/API processes.

Core records: semester/settings, enrollment scenario, program/year, subject/component/pattern, section, faculty/eligibility/availability, room/features/availability, offering/teacher assignment, schedule version/meeting/lock, generation job, administrator, and publication/audit events.

Use transactional validation and saves. Keep credentials out of source control, hash passwords with a maintained password-hashing library, use secure session practices, and protect state-changing browser requests appropriately. No production default password or authentication bypass.

## Excel and deployment

Create equivalent layouts for section, teacher, and room reports. Include subject names, dates/version identity, time ranges, labels, and print settings. Draft exports are visibly marked. Exports are snapshots; external workbook edits do not modify system data. Validate actual printing in the user's Excel environment before acceptance.

Local launcher: start server on loopback, wait for readiness, open browser, expose a clear shutdown path, and handle an existing instance/port conflicts. Store database, logs, and backups outside the executable bundle in a persistent application-data directory. Test restart, backup, and restore; never overwrite an existing database during an update.

Local-only access is a network restriction, not a loss of RBAC. LAN access is a separate explicit configuration. Future online deployment needs HTTPS, hosting, PostgreSQL migration, backups, monitoring, and a running solver worker. SQLite-to-PostgreSQL migration requires testing. No local/cloud synchronization in MVP.

## Acceptance governance

Each phase must have implementation/check results, a concise user walkthrough, known limitations, and explicit user acceptance before the next phase. Overall success means complete valid schedules, consistent views/exports, protected drafts, reliable publication, and a repeatable local demo—not merely an attractive calendar.

## Decision record

- 2026-11-01: User approved fixed sections, public viewing, local-first demo, approved meeting patterns, equivalent Excel layouts, and phased acceptance.
- 2026-11-01: Clarified and approved manual teacher assignment per offering/component; automatic faculty academic-unit allocation is deferred.
- 2026-11-01: User authorized generating these two specification files, including setup for an uninitialized application project. No implementation phase is authorized by this documentation action.
