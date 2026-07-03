---
name: adopt-ffflow
description: End-to-end onboarding for a new FFFlow project. Runs init-ffflow, stack-init, then hands off to plan-roadmap to phase out the work (greenfield or brownfield — roadmap figures out the right per-phase entry point). Use `--ui` to adopt FFFlow's view-layer-purity structure (the frontend sibling of hexagonal) on an already-adopted project.
---

# adopt-ffflow

## Purpose

A single entry point for "I want this project on FFFlow." Coordinates the bootstrap sequence and hands off to phase-level planning.

This skill **delegates**. It doesn't reimplement any step — it composes `init-ffflow`, `stack-init`, and `plan-roadmap`. The roadmap takes it from there (and figures out per-phase whether to invoke `characterize`, `plan-chat`, or `audit --plan`).

## When to invoke

- Day one on a new project.
- First time adopting FFFlow on an existing project.

## Inputs

- Current working directory.
- Optional `--greenfield` or `--brownfield` to skip the detection prompt.
- Optional `--vision-doc <path>` to pre-select the vision file the roadmap will read.
- Optional `--ui` (with optional `--lane react|web-components`) to adopt the view-layer-purity structure on a project that's **already** on FFFlow. This is the "make our UI follow the ffflow structure, as a sibling to our hex discipline" verb — see "UI adoption mode" below.

## Outputs

- All the artifacts the underlying skills produce: `.ffflow/config.yaml`, stack scaffolding, hooks, CI, and a sealed roadmap in `<plan-dir>/`.
- A "what's next" report at the end, pointing at the first phase's tier-2 handoff.

## Detection

Heuristics for greenfield vs. brownfield (asked, never assumed silently):

- Empty repo or only `README.md` / `project.md` / `VISION.md` → greenfield.
- < 5 source files → greenfield.
- Existing source code with tests → brownfield, well-tested.
- Existing source code with little/no tests → brownfield, undertested.

Show the user the heuristic result and confirm before proceeding.

The greenfield/brownfield split only affects the **bootstrap steps**. The roadmap handles both cases internally — it just produces different phase shapes (greenfield starts with foundation; brownfield often starts with `characterize` phases).

## Resume

Adoption is multi-step and frequently interrupted (a day, a week, a sprint). On invocation, the skill detects partial state before doing anything:

| Detected state | Adoption is at |
|---|---|
| No `.ffflow/config.yaml` | step 0 — run `/init-ffflow` |
| `.ffflow/config.yaml` exists; no stack scaffolding (no justfile or recently-installed CI) | step 1 — run `/stack-init` |
| Stack scaffolding present; no roadmap in `<plan-dir>/` | step 2 — run `/plan-roadmap` |
| Roadmap exists with `phase: roadmap-incomplete` | step 2 — resume `/plan-roadmap` |
| Roadmap sealed (`roadmap-complete`); no first-phase handoff yet | step 3 — invoke the first phase's tier-2 entry point (which the roadmap names) |
| Roadmap sealed; at least one phase complete | adoption complete; user is in the steady-state cadence |

The skill prints a briefing like:

```
Adoption resume — your project is at step 2 of 3.
Last step: stack-init complete (justfile + hooks + CI installed).
Next: /plan-roadmap to phase out the work.

Continue from here? (y/n)
```

Each sub-skill is already resumable on its own; this skill just surfaces the right one to invoke and offers continuity.

## Flow (unified)

Greenfield and brownfield share the same flow at this level — the divergence is inside `plan-roadmap`, not here.

1. **`/init-ffflow`** — write `.ffflow/config.yaml`, prompt for level/stack/capture.
1a. **Cartridge-availability check.** Before running `/stack-init`, verify cartridges exist for the configured stack(s):
    - Single-stack project: confirm `skills/stack/cartridges/<stack>.md` exists. If missing, refuse to proceed with a clear list of available cartridges.
    - Polyglot project: walk `polyglot.subprojects[].stack` and verify each. For any missing, prompt: **abort**, **downgrade subproject to a supported stack**, or **proceed with custom** (in which case stack-init will install only the baseline justfile/hooks/CI for that subproject; the user fills in the language-specific bits).
    - Also verify the configured `level` is at or below each cartridge's declared `max_level`. If the user requested L3 but the cartridge tops out at L2, surface the same gap-handling prompt from `init-ffflow` §2a (drop level, use polyglot, or proceed with silent skip).
2. **`/stack-init`** — install stack deps + justfile + git hooks + CI workflow (idempotent; non-destructive on existing projects).
3. **`/plan-roadmap`** — read the vision (project.md / README / prompt) or survey the existing codebase, produce an ordered phase list. The roadmap will:
   - Greenfield: phase 1 = foundation, phase 2 = smallest end-to-end slice, etc.
   - Brownfield (well-tested): build phases directly on existing spec coverage.
   - Brownfield (undertested): phase 1 = `characterize` the touched surface, then build phases on the characterized base.
4. **Briefing**: report which tier-2 skill handles the first phase, and what `<plan-dir>/phases/phase-1.md` says the work is.

## UI adoption mode (`--ui`)

For a project **already on FFFlow** that wants to adopt view-layer purity (§2.9) — the frontend sibling of the hexagonal discipline the project already runs. This is the one-invocation path behind *"FFFlow is opinionated about UI; apply that structure here as a sibling to our hex religion."* Also triggered by that intent in natural language, not just the flag.

This mode **delegates** just like the main flow — it composes existing skills, reimplements nothing:

1. **Precondition check.** Confirm `.ffflow/config.yaml` exists (project is already adopted). If not, tell the user to run plain `/adopt-ffflow` first — UI purity sits *on top of* an adopted project, it doesn't bootstrap one.
2. **Promote the stack to `typescript-ui`.** If `stack: typescript`, propose the switch to `stack: typescript-ui` and write the lane to `.ffflow/stack.yaml` (`ui_baseline: react | web-components`) — detected from `package.json` signals (React vs. Lit/Web Awesome), asked if ambiguous. If already `typescript-ui`, skip. Delegates to `/init-ffflow` (re-run, single-field diff). Non-TypeScript stacks: explain UI purity ships as the `typescript-ui` cartridge today and stop.
3. **Scaffold the toolchain.** Run `/stack-init`. Idempotent and non-destructive — adds Storybook, browser-mode component tests, style-dictionary tokens, the justfile recipes, and the sample `Button` triple without touching existing components.
4. **Baseline the existing UI.** Run `/audit --type ui --plan`. This is the heart of adoption: it inventories the current components against the philosophy — story-less components, presentational components reaching into `store`/`api`, raw hex/px bypassing tokens, app imports of unproven components — and converts the findings into a plan (`plan-breakdown → plan-capture → work-issue`). The plan *is* the migration backlog: each task storifies + tests one component to the standard.
5. **State the sibling relationship.** In the briefing, name it explicitly: the project now enforces two purity disciplines — `hexagonal-architecture` on the backend (domain ← app ← infra) and `component-driven-ui` on the frontend (components ← containers ← app). Same dependency rule, same dial, same audit machinery. Point at `component-driven-ui` as the rulebook to read.
6. **Right-size the gate.** Note the current level's UI enforcement (advisory at L0/L1, blocking at L2/L3) and offer to raise the level if the user wants the gates to bite now rather than after the backlog is worked.

The result: the project is set up so *new* UI work self-enforces the ordering (via `work-issue`/`tdd-loop`/`self-review`, all already stack-aware), and *existing* UI has a concrete, prioritized plan to reach the standard — exactly parallel to how `characterize` backfills a spec safety net for legacy backend code.

## Briefing examples

### Greenfield, vision in `project.md`

```
✓ FFFlow installed at level L1, stack python.
✓ Stack scaffolding written (pyproject.toml, justfile, hooks, CI).
✓ Roadmap sealed: 5 phases (slug=mvp).

Phase 1 — Foundation (verify scaffolding) → /plan-chat
Phase 2 — Core pricing domain → /plan-chat (depends on 1)
Phase 3 — Discount logic → /plan-chat (depends on 2)
...

Next: /plan-chat  (reads <plan-dir>/mvp/phases/phase-1.md)
```

### Brownfield, undertested, "add OAuth"

```
✓ FFFlow installed at level L1, stack typescript.
✓ Stack scaffolding present (already had pnpm + vitest; added missing hooks).
✓ Roadmap sealed: 5 phases (slug=oauth-rollout).

Phase 1 — Characterize auth surface (src/auth/) → /characterize src/auth/
Phase 2 — Refactor session storage → /plan-chat (depends on 1)
Phase 3 — Add OAuth provider integration → /plan-chat (depends on 2)
Phase 4 — Add OAuth flow to UI → /plan-chat (depends on 3)
Phase 5 — Deprecate password auth → /plan-chat (depends on 4)

Note: Phase 1 is non-trivial — src/auth/ has 6 modules and ~30% test coverage.
Expect ~2 weeks before reaching Phase 2 at typical cadence.

Next: /characterize src/auth/  (reads <plan-dir>/oauth-rollout/phases/phase-1.md)
```

Don't sugar-coat. The user needs to know the scale.

### UI adoption (`--ui`), existing React app already on FFFlow

```
✓ Stack promoted: typescript → typescript-ui (lane: react).
✓ Wrote .ffflow/stack.yaml (ui_baseline: react).
✓ Scaffolding added (Storybook, browser-mode vitest, style-dictionary tokens,
  justfile: storybook/test-stories/tokens, sample Button triple). Existing
  components untouched.
✓ /audit --type ui --plan → 23 findings, planned as slug=ui-purity:
    · 14 components with no story
    · 5 presentational components importing from src/store or src/api
    · 3 raw-color literals bypassing tokens
    · 1 app import of an untested component

View-layer purity is now a sibling to your hexagonal discipline:
  backend:  domain ← application ← infrastructure   (hexagonal-architecture)
  frontend: components ← containers ← app           (component-driven-ui)
Same dependency rule, same L0–L3 dial, same audit machinery.

Current level L1 → UI gate is ADVISORY. Raise to L2 to make /audit --type ui
blocking and enforce "no app import of an unproven component" in work-issue.

Next: /plan-breakdown  (reads the ui-purity plan) — then work the component
      backlog like any other chess moves. Read component-driven-ui first.
```

## Interactive points

The skill asks the user only when:
- Detecting greenfield vs brownfield (one confirmation).
- Inside `/init-ffflow` (level / stack / capture).
- Inside `/stack-init` (per-item plan confirmation, unless `--yes`).
- Inside `/plan-roadmap` (vision input, phase shape, decision resolutions).
- After everything, before the final next-steps brief.

Everything else is hands-off. If the user invokes via `/autopilot adopt-ffflow`, the autopilot stands in for the routine answers based on project signals — but flags the high-stakes decisions (level choice, capture backend, phase ordering) for explicit user confirmation.

## What this does NOT do

- Replace existing tests. Specs are additive.
- Rewrite source code.
- Force a specific directory layout. Conventions are proposed; user can override.
- Commit anything without confirmation.
- Start executing phases. After roadmap is sealed, the user invokes the first tier-2 skill manually (or via `autopilot`).

## Quality checks before final report

- [ ] `.ffflow/config.yaml` present and valid.
- [ ] Justfile, hooks, CI installed and `just check-all` passes (or, if failing, the failure is surfaced to the user explicitly).
- [ ] Roadmap sealed (`<plan-dir>/<slug>/metadata.json` shows `roadmap-complete`).
- [ ] Phase placeholders written (`<plan-dir>/<slug>/phases/phase-N.md` for each phase).

## Anti-patterns

- Running `/plan-roadmap` before `/stack-init`. Roadmap needs to know the stack to propose phases sensibly.
- Forcing brownfield through a greenfield-style roadmap. If the touched surface lacks specs, phase 1 should be `characterize` — let the roadmap decide that.
- Skipping `/plan-roadmap` and going straight to `/plan-chat`. Single-slice work doesn't need a roadmap, but adoption-time work always benefits from phase-level orientation.
- Dumping everything into one giant commit. Each delegated skill commits at its own granularity.

## Friction addressed

- "Where do I start?" — single command, no decision burden upfront.
- Order-of-operations confusion (init → stack → roadmap → phases).
- Greenfield projects with vision docs that never become a plan because "what's the first slice?" is paralyzing.
- Brownfield projects deferring FFFlow because the bootstrap looks daunting.
- The handoff cliff where adoption used to end at "next: /plan-chat" with no further structure.
