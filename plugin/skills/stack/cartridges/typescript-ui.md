# Stack cartridge: TypeScript UI

## Purpose

The prescriptive web-UI toolchain for **view-layer purity** (architecture §2.9). Extends the base `typescript` cartridge with Storybook, a component/interaction test runner, a design-token layer, and an accessibility check. Loaded by `init-ffflow` and `stack-init` when a project opts into UI. The methodology is in the `component-driven-ui` rulebook; this cartridge is the tooling that enforces it.

Everything in `typescript.md` still applies (pnpm, prettier, eslint, tsc, vitest, coverage). This file adds the UI-specific dimensions and recipes on top.

## Two baselines, one rulebook

FFFlow blesses two baselines that differ in ownership philosophy but share the rulebook, the token layer, and the `ui` audit gate. Pick a lane with `ui_baseline` in `.ffflow/stack.yaml`.

| Lane (`ui_baseline`) | Framework | Primitives / kit | Ownership | Storybook framework |
|---|---|---|---|---|
| `react` (default) | React | Radix primitives + shadcn-style **owned** components | You own the markup | `@storybook/react-vite` |
| `web-components` | Lit | **Web Awesome** kit (successor to Shoelace) | You consume a themeable kit | `@storybook/web-components-vite` |

Both render in Storybook as first-class citizens; both are themed through the same design-token layer; both story and test identically. htmx / server-rendered fragments are **not** a lane here (see `component-driven-ui` → "Server-rendered UIs").

## Dimensions

```yaml
stack: typescript-ui
extends: typescript
applies_to: typescript
dimensions:
  ui_baseline:       { tool: react, options: [react, web-components] }   # pick lane
  # react lane
  ui_framework:      { tool: react, when: "ui_baseline == react" }
  ui_primitives:     { tool: radix, when: "ui_baseline == react" }
  component_kit:     { pattern: shadcn-owned, when: "ui_baseline == react" }
  # web-components lane
  ui_framework_wc:   { tool: lit, when: "ui_baseline == web-components" }
  component_kit_wc:  { tool: web-awesome, when: "ui_baseline == web-components" }  # formerly Shoelace (sunset 2026-05)
  # shared
  design_tokens:     { tool: style-dictionary, format: css-vars }
  story_tool:        { tool: storybook, version: ">=8" }
  component_test:    { tool: "vitest-browser + @testing-library" }
  interaction_test:  { tool: storybook-test-runner, when: "level >= L2" }
  a11y_check:        { tool: "@storybook/addon-a11y", when: "level >= L2" }
  visual_regression: { tool: playwright-ct, when: "level == L3" }        # or chromatic; optional
  # coverage
  component_coverage_line: 95         # inherits typescript baseline; near-100 at L3
  story_coverage_threshold: 100       # every presentational component has >=1 story; L3 gate
```

`.ffflow/stack.yaml` can override any dimension (framework, primitives, kit, thresholds, VR tool).

## Per-level expectations

| Level | UI tooling active |
|---|---|
| L0 | Storybook optional. If present: stories run, no gate. |
| L1 | Storybook + component tests present; stories for key states; token layer wired. No audit gate. |
| L2 | + `storybook-test-runner` (interaction tests) + `addon-a11y`; `test-stories` in `check-all`; `/audit --type ui` enforces story presence + dependency rule. |
| L3 | + story-coverage gate (100% of presentational components storied), near-100% component coverage, token-conformance gate, optional visual regression. |

## Directory structure

Presentational components separated from connected containers (the dependency rule from `component-driven-ui`):

```
src/
  components/            # presentational — storied, tested, no data source
    atoms/
      Button/
        Button.tsx            (or Button.ts for the web-components lane)
        Button.stories.tsx
        Button.test.tsx
    molecules/
    organisms/
    layouts/
  containers/           # connected adapters — fetch/store/use-case wiring, thin
  tokens/               # design-token source (style-dictionary input)
.storybook/
  main.ts
  preview.ts
```

## Justfile recipes

Additions to the `typescript` baseline. `storybook` is dev-only (not in `check-all`); the test recipes fold in.

```just
# Run Storybook dev server
storybook:
    pnpm storybook dev -p 6006

# Build the static Storybook (CI artifact / visual-regression input)
build-storybook:
    pnpm storybook build -o storybook-static

# Component + interaction tests. Fast; runs on every build.
test-stories:
    @if [ "$(just _empty)" = "yes" ]; then echo "test-stories: no source files yet"; else pnpm test-storybook --coverage; fi

# Accessibility check across the story set (L2+)
test-a11y:
    pnpm test-storybook --stateFilter=a11y

# Build design tokens (style-dictionary) into CSS custom properties
tokens:
    pnpm style-dictionary build

# Visual regression against built stories (L3, optional)
test-visual:
    pnpm playwright test --config=playwright-ct.config.ts
```

`check-all` gains `test-stories` (and, at L2+, `test-a11y`):

```just
# L2+ check-all extends the typescript baseline
check-all: format lint typecheck coverage test-stories test-a11y
    @echo "All checks passed"
```

## Config files

Templates live in `typescript-ui-templates/`. `stack-init` reads them and writes the lane-appropriate set. Files suffixed `.react` / `.wc` are lane-specific; unsuffixed files are shared.

| File | Template path | Lane / when |
|---|---|---|
| `.storybook/main.ts` | `main.ts.react` | react |
| `.storybook/main.ts` | `main.ts.wc` | web-components |
| `.storybook/preview.ts` | `preview.ts` | shared (imports built tokens) |
| `vitest.config.ts` (browser project) | `vitest.config.ui.ts` | shared — adds a browser test project alongside the base node project |
| `package.json` devDeps | `package.devDeps.ui.react.json` | react |
| `package.json` devDeps | `package.devDeps.ui.wc.json` | web-components |
| tokens seed | `tokens/tokens.json` | shared |
| sample atom triple | `sample/Button.*` (`.react` / `.wc`) | lane — the canonical component/story/test pattern |

## The canonical triple

Every presentational component ships as a colocated **triple**: the component, its stories (a vignette per reasonable state), and its test. `stack-init` writes a sample `Button` triple in the chosen lane as the pattern to copy. This is the physical embodiment of the rulebook's "decompose → story → test → then integrate" ordering — the triple exists and is green *before* any container imports the component.

## Notes

- **Web Awesome, not Shoelace, for new work.** Shoelace archived 2026-05; Web Awesome is the same team's Lit-based successor. If a project has existing Shoelace, `ui_baseline: web-components` with `component_kit_wc: shoelace` pins it, but flag the migration.
- Component tests run in **vitest browser mode** (real DOM) — faster and truer than jsdom for UI. The base `typescript` node test project stays for non-UI logic.
- Interaction tests live *in the story* (`play` functions) and run via `storybook-test-runner`, so a story is both a vignette and a test. This is why story coverage and interaction coverage rise together.
- Tokens are the single source of color/spacing/type. Components reference CSS custom properties; the Web Awesome lane also themes via CSS parts. Raw hex/px in a component is a `/audit --type ui` violation.

## Anti-patterns

- Running Storybook and the app off divergent token builds. `tokens` runs before both; `preview.ts` imports the same built CSS the app does.
- jsdom for component tests "because it's already there." Browser mode catches layout/interaction bugs jsdom silently passes.
- Storying only the happy path. The cartridge's coverage gate counts components, not states — the `ui` audit cartridge is what flags under-storied state spaces. Both matter.
- Mixing presentational and container concerns in `src/components/`. Containers live in `src/containers/`; the audit cartridge flags a component that imports from `app/`/`api/`/`store/`.
- Prescribing Shoelace as a default in 2026+. It's sunset. Web Awesome is the living path.
