---
name: component-driven-ui
description: View-layer purity — presentational vs. connected components, the atoms→molecules→organisms→layouts ladder, story-as-vignette doctrine, design tokens, and the decompose→story→test→integrate ordering. The frontend sibling of hexagonal-architecture. L1+ reference rulebook.
---

# component-driven-ui

## Purpose

Reference rulebook (L1+). Loaded as context by `plan-chat`, `work-issue`, and `/audit --type ui`. Not invoked as a tool.

This is `hexagonal-architecture`, rotated onto the view. Same dependency rule, same purity discipline, same L0–L3 dial. Read that rulebook first if you haven't — everything here is the frontend application of it.

**The component layer is the frontend's domain.** Pure. Presentational. Built, storied, and tested in complete isolation, with zero dependency on model, logic, or backend. The app wiring is the adapter that plugs data into components already proven on their own.

## The dependency rule

```
Components ← Containers ← App
```

- **Components (presentational)** know nothing about where data comes from. Props in, events out. No fetching, no store access, no routing, no use-case calls. Fully deterministic given their props — the frontend's domain layer.
- **Containers (connected)** are the adapters. They fetch, subscribe to stores, call use cases, and pass plain data + callbacks down to presentational components. Thin. Untested-in-isolation by design (they're wiring).
- **App** composes containers into routes/pages.

A presentational component importing from `app/`, `api/`, `store/`, or a data-fetching hook is the frontend equivalent of a `PostgresConnection` leaking into a `User` entity. Forbidden. Enforced by `/audit --type ui` at L1+.

## The composition ladder

Atomic Design vocabulary. Build bottom-up.

| Tier | What it is | Examples | Depends on |
|---|---|---|---|
| **Atoms** | Indivisible primitives | `Button`, `Input`, `Icon`, `Badge`, `Text` | Design tokens only |
| **Molecules** | Small groups of atoms with one job | `SearchField`, `FormRow`, `MenuItem`, `Card` | Atoms + tokens |
| **Organisms** | Distinct sections composed of molecules/atoms | `NavBar`, `DataTable`, `CommentThread`, `SignupForm` | Molecules + atoms |
| **Layouts** | Structural arrangement, content-agnostic | `AppShell`, `TwoColumn`, `Modal`, `Grid` | Organisms as slots |
| **Pages** | A layout filled with organisms at the point of app assembly | `SettingsPage`, `CheckoutPage` | Layouts + organisms |

Everything up to and including **pages** is presentational and storied. The **container** that feeds a page real data is the first thing allowed to touch model/logic.

## Story-as-vignette doctrine

> A story is a visual vignette of one state a component can reach.

Every atom, molecule, organism, and layout gets Storybook stories covering its **reasonable states** — not just the happy path. The stories are the catalog of every state we expect the component to reach in production. When in doubt, ask: "what does this look like when…"

- **empty** — no data yet, zero-length list, blank field
- **loading** — in-flight, skeleton, spinner
- **error** — failed load, validation error, permission denied
- **populated** — the ordinary case, and a *dense* variant
- **edge** — one item, huge item, overflow/truncation, very long i18n string
- **interactive states** — hover, focus, active, disabled, selected
- **theme/locale** — dark mode, RTL, high-contrast if supported

A component with only a happy-path story is under-storied. The `ui` audit cartridge heuristically flags components whose prop surface implies states no story covers.

## Design language — the token layer

Components consume **design tokens**, never raw literals.

- Color, spacing, typography, radius, shadow, z-index, motion → tokens (CSS custom properties, driven by style-dictionary or equivalent).
- A raw `#3b82f6` or `padding: 13px` in a component is a violation — it bypasses the language and can't be re-themed. `/audit --type ui` flags raw hex/px literals in component styles.
- FFFlow blesses two baselines (see "Framework fit" below and the `typescript-ui` stack cartridge), both token-driven: the React lane (**Radix** primitives + **shadcn-style owned** components) and the Web Components lane (**Web Awesome** kit, themed via CSS custom properties + parts). Pick a lane in `.ffflow/stack.yaml`.

The design language *is* the set of atoms + tokens. Adding a new atom is adding a word to the language — it earns a story catalog and tests before anything composes it.

## The build ordering (the rule that forces backend-divorced design)

When adding a feature that has a UI:

1. **Decompose.** Break the feature's surface into atoms → molecules → organisms → layout. Identify what already exists in the design language and what's new.
2. **Build each new component in isolation.** Presentational only. Props + events. No data source.
3. **Story it.** Write stories for every reasonable state (above). This is the visual design step — you're designing the component's whole state space, on the Storybook canvas, with no backend in sight.
4. **Test it.** Interaction tests (Storybook test-runner) + fast component unit tests. Green.
5. **Assemble upward.** Compose proven components into the molecule/organism/layout above. Story + test *that* assembly — including the fully-assembled page, still fed by story args, not real data.
6. **THEN integrate.** Only now write the container: fetch/store/use-case wiring that feeds the proven page real data, and touch the app's own TS files.

Steps 1–5 happen with **zero** model/logic code. That's the point. The UI is designed and proven divorced from the backend; integration is the last, thin step. **No component is imported into app/container code until it has stories covering its states and passing tests.** This is the ordering gate `work-issue` enforces at L2+.

## Framework fit — what this rulebook assumes

The philosophy is framework-agnostic in principle but assumes a **client component model**: a sealed, props-in / events-out unit you can render in isolation on the Storybook canvas. FFFlow blesses **two baselines** — a React lane and a Web Components lane — that differ in *ownership philosophy* but share this rulebook, one token layer, and one `ui` audit gate. Pick a lane in `.ffflow/stack.yaml`; the `typescript-ui` cartridge ships templates for both.

| Lane | Baseline | Ownership model | Storybook | Notes |
|---|---|---|---|---|
| **React** (prescribed default) | Radix headless primitives + **shadcn-style owned** components + token layer | *You own the markup.* Primitives supply behavior/accessibility; the styled component is copied into your repo and yours to evolve. | First-class (`@storybook/react-vite`) | Most examples and tooling. Concrete React atom/story/test templates ship in the cartridge. |
| **Web Components** (blessed alternative) | **Web Awesome** kit (Lit) + token layer | *You consume a styled kit.* Batteries-included components themed via CSS custom properties, CSS parts, and design tokens. | First-class (`@storybook/web-components-vite`, Vite builder) | A custom element + Shadow DOM is a hard, platform-level seal — the dependency rule enforced by the runtime, not convention. Framework-agnostic (usable even inside a React app). **Web Awesome** is the actively-developed successor to **Shoelace** (Shoelace archived 2026-05; same team, same Lit foundation) — prefer Web Awesome for new work. Caveat: slot content in stories and "show code" with args are rougher than React; prefer explicit slot stories. |

The two lanes are a real choice, not a cosmetic one: **own-the-markup** (Radix/shadcn) gives maximum control and no runtime kit dependency; **consume-a-kit** (Web Awesome) gives a large, accessible, natively-themeable component set with a platform-level purity seal, at the cost of evolving markup you don't own. Both satisfy the token-layer rule; both story and test identically. The choice is a baseline/renderer swap, not a philosophy change.

> **Not the same as htmx.** Web Awesome/Shoelace are *client-side Web Components* and fit this rulebook fully. htmx is server-rendered fragments and does **not** — see "Server-rendered UIs" below. Don't conflate them because both read as "HTML-first."

### Server-rendered UIs (htmx and friends) — a different paradigm

htmx and server-rendered-fragment approaches are **not** a drop-in alternative here, and FFFlow doesn't pretend they are. In that model the "component" is an HTML fragment the *server* renders; there is no client component to import, and the unit of reuse straddles the exact view/app boundary this rulebook exists to keep clean. Consequences:

- **Storybook doesn't apply** as the isolation surface — you'd be storying static HTML strings, not a live component.
- **The story / no-app-import gates don't map.** `/audit --type ui`'s Storybook checks are N/A for a server-fragment project.
- **The purity discipline still can and should hold**, expressed differently: render fragments from **pure templates** (no business logic in the template), unit-test those templates in isolation, and prove the endpoint with **fragment contract tests** (request → assert returned HTML), the way you'd test any adapter. This is closer to hexagonal's infrastructure-adapter testing than to component isolation.

If a project is htmx-first, it does not adopt the `typescript-ui` cartridge's Storybook toolchain; it keeps view-layer purity through pure-template + contract-test discipline instead. The rulebook's *principle* (view logic divorced from data) survives; its *Storybook mechanics* do not.

## Per-level expectations

| Level | View-layer purity enforcement |
|---|---|
| L0 | Encouraged. Separate presentational from connected components; Storybook optional; self-review nudge. |
| L1 | Recommended. Decompose-first is the norm; stories for key states; token layer present; no audit gate yet. |
| L2 | **Required.** Storybook mandatory; every atom/molecule/organism/layout has stories over its reasonable states; fast component + interaction tests run in CI; `/audit --type ui` flags story-less components and dependency-rule violations; **no app/container import of an unstoried component.** |
| L3 | **Blocking + near-total.** Story + component-test coverage gated (near-100%); state/variant coverage tracked; design-token conformance enforced (no raw hex/px); the decompose→story→test→integrate ordering is a blocking gate in `work-issue`; optional visual-regression on the story set. |

Mirrors hexagonal's own dial (optional L0 → required L2 → blocking L3) exactly.

## Conventions

- Presentational components live apart from containers. A common split: `components/` (presentational, storied) vs. `containers/` or colocated `*.container.tsx` (connected, thin).
- One component, one story file, one test file, colocated: `Button.tsx` / `Button.stories.tsx` / `Button.test.tsx`.
- Props are plain data + callbacks. Never pass a store, a query client, or an app-model type into a presentational component.
- A container's only job is to turn app state into props. Keep it dumb enough that it needs no isolated tests — it's covered by the page's integration test.
- New atom = new word in the design language: token-driven, story catalog, tests, before anything composes it.

## Anti-patterns

- **Fetching inside a presentational component.** `useQuery` / `fetch` / store access in a component that should be props-in. Push it up to a container.
- **App-model types in component props.** `<UserCard user={User} />` where `User` is a domain/API type couples the view to the backend. Pass a flat view-model (`{ name, avatarUrl }`) instead.
- **Raw literals bypassing tokens.** Hard-coded hex/px/font values. Use tokens so the language stays coherent and re-themeable.
- **Happy-path-only stories.** A story set that never shows loading/error/empty/overflow. The states you don't story are the states that break in production.
- **Testing components through the app.** Driving a button by booting the whole app is slow and couples the test to wiring. Test the component in isolation; test the wiring once at the page/container level.
- **Integrating before proving.** Wiring a component into the app before it has stories + green tests. This is the ordering violation the whole rulebook exists to prevent.
- **Building the screen top-down.** Starting from the page and stubbing children inline. Build atoms first; assemble upward.

## Relationship to other rulebooks

- **`hexagonal-architecture`** — this is its view-layer sibling. Same dependency rule; components are to the frontend what domain is to the backend. On a full-stack feature, the container is where the frontend's adapter meets the backend's application ports.
- **`tdd-loop`** — the story + interaction test is the "red" for a UI chess move. Story-driven development is TDD with the story as the failing spec.
- **`writing-specs`** (L2+) — acceptance specs describe stakeholder-visible behavior; stories describe the component states that behavior renders through. Specs stay implementation-free (no CSS selectors); stories are where the visual states live.

## Friction addressed

- UI built entangled with data-fetching, impossible to reason about or reuse.
- Components whose broken states (empty, error, overflow) are only discovered in production because no story ever showed them.
- Design decisions made against a live backend, so the UI can't be iterated without the whole stack running.
- Design-language drift as raw colors and spacings accrete, defeating theming.
- Slow, flaky UI test suites that boot the app to click one button.
