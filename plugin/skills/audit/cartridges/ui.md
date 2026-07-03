# Audit cartridge: view-layer purity

## Purpose

The keep-honest layer for **view-layer purity** (architecture §2.9, methodology in `component-driven-ui`). UI discipline is easy to assert and easy to erode: a component gets wired into the app before it has a story, a raw color creeps in, a `useQuery` sneaks into a presentational component. This auditor detects those.

Applies **only** when the project's stack includes a UI cartridge (`typescript-ui` or an `extends`-of-it). Skipped otherwise. Invoked by `/audit` at L1+; advisory at L0/L1, blocking at L2/L3.

## Configuration

Reads from `.ffflow/config.yaml` (stack + level) and, optionally, a `ui:` block for overrides:

```yaml
ui:
  components_dir: src/components      # presentational — must be storied + tested
  containers_dir: src/containers      # connected adapters — exempt from story/purity checks
  app_dirs: [src/app, src/pages, src/routes]   # "app code" for the import-ordering check
  forbidden_imports: [src/app, src/api, src/store]  # a presentational component may not import these
  story_glob: "*.stories.@(ts|tsx|js)"
  token_prefixes: ["var(--"]          # allowed styling source; raw hex/px flagged
  story_coverage_threshold: 100       # L3
```

Defaults match the `typescript-ui` cartridge's directory structure; override only if the project deviates.

## Inputs

- `.ffflow/config.yaml` (stack, level, optional `ui:` block).
- The component/container source tree.
- The `typescript-ui` cartridge (for directory + token conventions).

## Outputs

- Findings per the `audit` contract.

## Checks

Five checks, each level-gated. Severity escalates with level: `info` at L0, `warn` at L1, `error` (blocking) at L2/L3.

### 1. Story presence (rules 2/4)

Every presentational component under `components_dir` has at least one colocated story file. A component with a `.tsx`/`.ts` but no matching `*.stories.*` is under-storied.

- **Finding:** `Button.tsx has no story — presentational components must be storied before use.`
- L3 adds the `story_coverage_threshold`: the ratio of storied components must meet it (default 100%).

### 2. No app import of an unstoried/untested component (rule 4 — the ordering gate)

Scan imports *from* `app_dirs` and `containers_dir`. Any import of a component under `components_dir` whose story **or** test file is missing is a violation — the component was wired in before it was proven.

- **Finding:** `src/containers/Checkout.tsx imports Button, which has no test — integrate only proven components (story + test green).`
- This is the audit-time mirror of the `work-issue` ordering gate. It catches what slips past the loop.

### 3. Dependency-rule violation (§2.9)

A presentational component under `components_dir` must not import from `forbidden_imports` (`app/`, `api/`, `store/`, data-fetching hooks). This is the frontend equivalent of the `architecture` cartridge's domain-purity check — reuse the same import-graph machinery.

- **Finding:** `src/components/atoms/UserCard.tsx imports src/store/session — presentational components take props, not store access. Move the wiring to a container.`

### 4. Token conformance (rule 1)

Component styles reference design tokens, not raw literals. Flag raw hex colors (`#rrggbb`), raw px/rem numeric literals in style positions, and named CSS colors, when they appear in component style blocks (`.css`, styled-template literals, Lit `css`, inline `style=`).

- **Finding:** `src/components/atoms/Badge.tsx:22 uses "#3b82f6" — use a design token (var(--color-primary)).`
- Heuristic, not perfect: allow-list is `token_prefixes`. Tokens' own source files (`src/tokens/**`) are exempt — that's where literals legitimately live.

### 5. State coverage (rule 2, heuristic — L2+)

For each storied component, compare its prop surface to its stories: a boolean/enum prop with no story exercising its off/each value suggests an unstoried state. Report as `info`/`warn` (never blocking — it's a heuristic prompt, not a hard rule).

- **Finding:** `Button has a "loading" prop but no story renders loading=true — story the states the component can reach (empty/loading/error/edge).`

## Per-level behavior

| Level | Checks run | Severity |
|---|---|---|
| L0 | 1, 3, 4 | `info` — advisory nudge |
| L1 | 1, 3, 4 | `warn` |
| L2 | 1, 2, 3, 4, 5 | `error` (blocking) for 1–4; `warn` for 5 |
| L3 | 1, 2, 3, 4, 5 | `error` for 1–4 + story-coverage threshold + near-100% component coverage (from `typescript-ui`); `warn` for 5 |

## Finding shape

Same as every audit cartridge — file, line, severity, message, and a suggested fix. Story-presence and dependency-rule findings convert cleanly to plan tasks via `audit --plan`:

```markdown
# Task: Story and test the Button atom before it ships in Checkout

## Problem
src/components/atoms/Button.tsx is imported by src/containers/Checkout.tsx but has
no story and no test — it was integrated before being proven in isolation (§2.9).

## Approach
Write Button.stories.tsx covering its reasonable states (primary/secondary/danger/
disabled/loading/overflow) and Button.test.tsx pinning click + disabled + loading
behavior. Follow the canonical triple in the typescript-ui cartridge. Both green
before Checkout keeps the import.

## Out of scope
- Restyling Button; only story + test the existing behavior.
- Other unstoried components (file separate tasks).
```

## Auto-fix scope

- **Token conformance (check 4):** partially auto-fixable when a raw value maps 1:1 to an existing token (`#2563eb` → `var(--color-primary)`). Offered under `--fix`; ambiguous literals are left as findings.
- **Everything else:** not auto-fixable. Writing a missing story or removing a store import is authoring work → plan tasks.

## Anti-patterns

- Auditing container directories as if they were presentational. Containers are adapters; exempt them via `containers_dir`.
- Treating every numeric literal as a token violation. Line-height `1.5`, `z-index: 0`, opacity — allow-list sensibly; the target is color/spacing/type literals that should be themeable.
- Blocking on state-coverage (check 5). It's a heuristic prompt; keep it non-blocking or it generates noise.
- Running this cartridge on a non-UI project. Gate on the stack including a UI cartridge.

## Friction addressed

- Components wired into the app before anyone storied their broken states.
- Presentational components that quietly grew a data dependency, defeating reuse and isolated testing.
- Design-language drift as raw colors/spacings accrete past the token layer.
- The `work-issue` ordering gate being bypassed in a hand-edit — this catches it at audit/CI time.
