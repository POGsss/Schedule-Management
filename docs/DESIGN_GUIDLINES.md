# Design Guidelines — School Schedule Management

Status: user-directed design specification, ahead of application implementation.

The filename intentionally follows the user's requested `DESIGN_GUIDLINES.md`. Read alongside [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md) and [DEVELOPMENT_PHASE.md](DEVELOPMENT_PHASE.md). This is the visual authority for all implementation phases. Generic skill/library aesthetics must not override these decisions.

## Product and visual authority

This is a task-focused school administration tool: accurate data entry, readable timetables, conflict correction, and controlled publication take priority. Public users need fast schedule lookup on desktop and mobile.

The supplied dashboard screenshot is preserved at [design-reference.png](assets/design-reference.png). Borrow its horizontal top navigation, active tab physically joined to the content panel, rounded continuous outer frame, and orderly content regions. Do not reproduce its browser chrome, carbon statistics, gradients, glows, ring charts, tiny typography, or colored status pills.

The user's explicit direction is a flat, monochrome interface with light and dark modes. No additional visual-direction interview or alternative concept selection is needed for this documentation task. Impeccable is supporting guidance; the approved product specifications and this reference establish context even though its default PRODUCT.md/DESIGN.md files do not exist.

## Component and tooling decisions

- Use HeroUI React v3 with React 19 and Tailwind CSS v4. Do not introduce shadcn/ui, Mantine, or another competing component system.
- Use the official HeroUI MCP for current v3 APIs. Avoid mixing v2 provider/plugin recipes with v3 CSS-based setup.
- Import Tailwind first, then `@heroui/styles`, then project token and component overrides.
- Prefer HeroUI form, dialog, selection, button, and disclosure primitives while retaining accessible behavior. The timetable and connected navigation frame are project-specific compositions.
- Before implementing a UI primitive or layout, search the installed HeroUI v3 component inventory and official documentation. Prefer composing the available accessible components; create custom wrappers and layout rules only for product-specific needs that the library does not cover. Do not rebuild an existing HeroUI primitive by hand.
- Use HeroUI form controls and center their labels, placeholders, and selected values vertically. Keep that alignment consistent across control types and themes.
- Use Lucide React (`lucide-react`) for interface icons. Decorative icons are hidden from assistive technology; icon-only controls have accessible names.
- Impeccable is installed as the design skill. Apply its Operate-mode emphasis on precision and restraint. Do not let its default palette suggestions, imagery, concept generation, hooks, or documentation conventions expand this approved scope.
- Use shared project wrappers where necessary to prevent default HeroUI danger/success/warning colors and shadows leaking through.
- No paid HeroUI Pro components are required.

## Layout: connected top navigation

```text
School Scheduler   Overview  School Data  Sections  [Schedule]  Publish    Theme / Account
┌──────────────────────────────────────────────────┘        └─────────────────────────┐
│ Semester selector                    Draft / published state                       │
│ Page title                           Contextual actions                             │
│                                                                                     │
│ Main workspace: table, timetable, form, or focused status overview                    │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

- Navigation is at the top, not in a permanent sidebar.
- The page body and topbar use the same solid `shell` tone. The topbar has exactly 20px padding on all sides.
- The selected tab uses `surface-subtle`, the same token as the workspace frame. Its explicit height reaches the frame edge. The frame's stacking order is higher than the topbar and tab so the frame covers the tab's reverse-radius overflow and content never paints over the frame.
- The active tab's lower edge meets the workspace frame with no visible dividing line. Side corner joins form a clean continuous silhouette. Use positioned pseudo-elements/masks for solid geometry, never gradients or images to fake the seam.
- Keep navigation items compact vertically. The connected workspace begins immediately under the topbar with no horizontal frame strip across its top edge. Keep the 20px shell frame visible along the left, right, and bottom edges while the workspace content scrolls independently inside it.
- Inactive tabs remain visually separate in the band; route changes move the joined tab. Hover alone must not resemble selection.
- Preserve the join at first/last tabs, keyboard focus, zoom, horizontal scrolling, and both themes. Do not crop focus outlines at the join.
- Use route links with `aria-current="page"` for primary navigation. Use tab semantics only for same-page tab panels such as Section/Teacher/Room.
- The application shell fills the viewport. Use a 20px outer gutter around the workspace frame, including its top edge after the topbar, and a 20px radius on every frame corner. The workspace frame fills the remaining viewport and is the only vertical scroll container; lock viewport scrolling so growing content never moves the frame or page.
- Content padding: approximately 24px. Dense timetable pages may use full available width.
- Panel/control radii: 8–12px; avoid making every item a pill. Inactive navigation may use rounded ends inspired by the screenshot.
- Separate cards and form controls by solid background tones rather than borders or outlines. Cards and inputs MUST have no border, outline, or shadow. Keep keyboard focus visible on borderless inputs through a background change; preserve visible focus treatment on other interactive controls. Tables may use subtle solid borders. Do not turn every metric or line of text into a separate card.
- No drop shadows, glass blur, glow, gradients, or decorative textures. Depth is represented by border, spacing, and solid surface tone.

## One replaceable color

Expose exactly one authored chromatic input: `brandSeed`, initially `#0F8B78` as a replaceable teal inspired by the reference. This is not a locked school brand. Components must never contain independent brand, gray, red, amber, blue, or green literals.

Black and white are mathematical luminance endpoints for generating accessible tints/shades, not additional accent colors. Near-neutral surfaces and text remain very low-chroma derivatives of the seed; a grayscale seed yields a grayscale theme. Do not inject a fallback colored hue for grayscale seeds.

Changing the seed must regenerate every color token for both themes without manual palette edits. Keep status names semantic in code while mapping them to the same monochrome palette.

### Generation algorithm contract

Implement this in Phase 1 as a pure, testable theme utility; this document does not claim the palette is already implemented.

1. Accept and normalize a valid opaque sRGB hex color. Reject invalid input and retain the last valid seed.
2. Convert the seed to OKLCH, obtaining lightness L, chroma C, and hue H. Use H consistently for all non-achromatic tokens.
3. Generate an ordered palette using the target lightness and chroma multipliers below. Use `C_token = min(C_seed * multiplier, 0.16)`; reduce chroma as needed to stay in sRGB gamut while preserving hue/lightness.
4. For achromatic seeds, use C=0 throughout. The undefined hue is immaterial; do not invent chroma.
5. Assign light/dark semantic roles. Calculate actual sRGB relative-luminance contrast after gamut mapping; adjust foreground or action lightness until the required contrast is met. Simple color mixing alone does not guarantee accessibility.
6. Treat the supplied seed as the source, not a guarantee that its exact raw value is readable as a button fill. Accessible action shades may be lighter/darker derivatives. Never hue-shift to achieve contrast.
7. Publish CSS custom properties centrally. Persist light/dark/system preference locally. All future editable theme settings must update the same seed, not token-by-token overrides.

| Palette stop | Target OKLCH L | Seed chroma multiplier |
| ------------ | -------------- | ---------------------- |
| 0            | 0.995          | 0.02                   |
| 50           | 0.98           | 0.04                   |
| 100          | 0.95           | 0.10                   |
| 200          | 0.89           | 0.20                   |
| 300          | 0.78           | 0.35                   |
| 400          | 0.66           | 0.65                   |
| 500          | 0.56           | 1.00                   |
| 600          | 0.47           | 0.90                   |
| 700          | 0.38           | 0.70                   |
| 800          | 0.29           | 0.45                   |
| 900          | 0.21           | 0.25                   |
| 950          | 0.15           | 0.12                   |
| 1000         | 0.10           | 0.06                   |

These are initial generation targets, not pre-certified color pairs. Contrast validation may alter mapped role lightness while preserving the single-hue rule.

### Semantic tokens

Use a project prefix such as `--app-*`; map to HeroUI's actual installed-version variables rather than assuming these are its variable names.

| Role                               | Light starting stop | Dark starting stop |
| ---------------------------------- | ------------------- | ------------------ |
| canvas                             | 100                 | 1000               |
| surface (pure white in light mode) | #FFFFFF             | 950                |
| surface-subtle / field             | 50                  | 900                |
| surface-hover                      | 100                 | 800                |
| text                               | 950                 | 50                 |
| text-muted                         | 700                 | 300                |
| border-subtle                      | 200                 | 800                |
| border-strong                      | 500                 | 400                |
| shell / continuous frame           | 800                 | 800                |
| on-shell                           | 50                  | 50                 |
| accent / primary action            | 600                 | 300                |
| on-accent                          | 0                   | 1000               |
| accent-hover                       | 700                 | 200                |
| selected-subtle                    | 100                 | 800                |
| focus-ring                         | 600                 | 200                |

Additional tokens: `disabled-surface`, `disabled-text`, `overlay`, `selection`, `grid-line`, `meeting-surface`, `meeting-border`, `meeting-text`, `status-surface`, `status-border`, and `status-text`. Derive these from the same palette. Overlays may use opacity of a palette shade, but no blur. Skeletons are solid monochrome blocks with no shimmer gradient.

Configure HeroUI background/foreground, surface, field, accent, focus, muted, border, overlay, selection, and semantic status variables centrally. Audit portals, date pickers, toasts, invalid fields, browser autofill, native controls, and focus states for default colors. Set `color-scheme` per theme for native UI where supported.

## Monochrome statuses and schedules

Never rely on color alone. All status families use the same derived hue, with distinct wording, icon shapes, and background treatment. Status cards and fields remain borderless:

| Meaning                | Required visual encoding                                                               |
| ---------------------- | -------------------------------------------------------------------------------------- |
| Error / conflict       | Error icon + explicit explanation; stronger solid background                           |
| Warning / needs review | Triangle icon + "Needs review" label; distinct background where appropriate            |
| Success / valid        | Check icon + "Valid" or "Saved" label                                                  |
| Draft                  | Document icon + "Draft" label and version                                              |
| Published              | Check/document icon + "Published" and timestamp                                        |
| Locked                 | Lock icon + "Locked" accessible label                                                  |
| Destructive action     | Explicit verb such as "Delete room", appropriate confirmation, strong contrast; no red |

Timetable subjects do not receive rainbow colors. Identify meetings using subject code/name, section, room, teacher, and component labels. Use a small number of consistent same-hue fills for component/state distinctions, with a legend when needed. Selecting a meeting uses a background/focus state. Never hide a conflict or locked state inside a tooltip alone.

Charts, if needed, use labels, line styles, and same-hue tones. Do not add dashboard charts merely because the reference contains them. Faculty academic-unit compliance charts remain outside MVP scope.

## Typography, spacing, and icons

- Use a readable system sans-serif stack initially so the local package works offline; no remote font dependency.
- Body/forms: 14–16px; secondary metadata: at least 12px; page titles: 24–28px; section headings: 16–18px.
- Use tabular numerals for times, counts, and durations. Show explicit AM/PM in human-facing schedules.
- Use 4px spacing increments: 4, 8, 12, 16, 24, 32. Use whitespace and consistent alignment to establish hierarchy.
- Minimum interactive target 24px with sufficient spacing; prefer 40–44px controls and 44px mobile targets.
- Icons use one consistent outline style, inherit current text color, and have accessible names for icon-only controls. No colorful emoji as status indicators.

## Screens and behavior

### Administrative shell

Top routes: Overview, School Data, Sections, Schedule, Publish. Place settings inside the appropriate route or a clearly labeled top utility menu. Theme/account controls sit on the right. School Data contains faculty/rooms/subjects subnavigation without introducing a permanent sidebar.

Overview emphasizes next action and readiness findings rather than decorative statistics. Setup screens favor simple forms and editable tables. Persistent semester and draft/published context must remain visible near the page heading.

### Schedule playground

Section/Teacher/Room view switch; resource selector; generate, validate, and export actions; full-duration weekly meeting blocks; click-to-edit side panel on desktop and full-width panel on mobile. The editor is contextual, not a permanent navigation sidebar. Lock controls and validation explanations use the same monochrome rules.

### Public schedules

Retain the top frame and simple navigation, remove admin-only actions. Provide section/teacher/room search, publication identity, offline state, and a readable narrow-screen agenda view. Public viewing does not require an account.

### Responsive rules

- At approximately 1024px and above, show full top navigation and generous workspace width.
- Below that, preserve top navigation using scrollable route links and/or a labeled overflow menu. Keep the active route visible; do not replace the design with a left sidebar.
- At phone widths, reduce frame margin/padding and use an agenda/list alternative to the dense weekly grid. Horizontal scrolling is acceptable inside a labeled timetable/table region, not across the entire page.
- Support 320px width and 200% zoom without losing actions or text. Popovers/dialogs must stay inside the viewport.

### Interaction states

Specify default, hover, focus-visible, active, selected, disabled, loading, empty, invalid, offline, and success states. Explain disabled generation/publication through nearby text. Errors are announced accessibly and linked to affected fields/meetings. Keyboard users must be able to navigate forms and open/edit a meeting without dragging.

Transitions should be short (approximately 120–180ms) and limited to useful state feedback. Respect reduced motion. No decorative page entrance animation, animated gradients, moving backgrounds, or excessive ripples.

## Accessibility and arbitrary-seed checks

- Normal text contrast at least 4.5:1; large text at least 3:1; essential control boundaries and focus indicators at least 3:1 against adjacent colors.
- Decorative dividers may be subtle; they cannot be the sole means of identifying an input/control.
- Verify composite colors after opacity, not only raw palette values.
- Test both themes with teal, saturated blue/red, bright yellow, near-white, near-black, and grayscale seeds. These are test inputs, never simultaneous UI colors.
- All tokens must update after a seed change; no residual red error, green success, blue focus, or multicolored chart series.
- Preserve text/icon distinction for statuses in grayscale and print.
- Invalid input retains the last valid seed and shows an accessible explanation.

## Printing and exports

Use white paper and readable dark text with restrained seed-derived borders/fills; do not export a dark-mode page as a dark printed sheet. Printed schedules remain monochrome and preserve all state meanings through labels. UI chrome and the decorative frame are omitted from printed Excel layouts. Report formatting must not change schedule data or version identity.

## Implementation gates

Phase 1: preserve installed dependencies, scaffold Vite/TypeScript, wire HeroUI styles, implement seed-to-token generation, theme preference, connected top navigation shell, and a small component-state sample for review. No scheduling screens are authorized by this preparation task.

Every later phase: apply these tokens/components, verify both themes and keyboard/phone behavior, and report deviations. Phase 5 must verify meeting readability and the continuous tab/frame at real timetable density. Phase 8 must verify monochrome print output. Phase 9 must verify offline assets and theme persistence in the packaged application.

Review evidence must include light and dark screenshots of the connected shell, a second seed demonstrating complete recoloring, and relevant state/contrast checks. Dependency installation alone is not visual acceptance.

## Tooling record

Prepared 2026-11-01: HeroUI React/styles 3.2.7 and compatible React 19/Tailwind 4 dependencies in `frontend/`; exact versions are in package.json/package-lock.json. There is no runnable frontend yet. Phase 1 must extend this manifest, not overwrite it.

Official HeroUI MCP: global Codex server `heroui-react`, command `npx.cmd -y @heroui/react-mcp@1.1.3`. Impeccable skill: `C:/Users/PC/.codex/skills/impeccable`, installed from `pbakaus/impeccable`, `.agents/skills/impeccable`. These machine-local installations are not bundled with the end-user application. Restart/reload Codex if the server/skill is not discovered in an existing session. Automatic Impeccable hooks were not enabled.

Sources: [HeroUI setup](https://heroui.com/en/docs/react/getting-started/quick-start), [HeroUI MCP](https://heroui.com/en/docs/react/getting-started/mcp-server), [Impeccable](https://impeccable.style/).
