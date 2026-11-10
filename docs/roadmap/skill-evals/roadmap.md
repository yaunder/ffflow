# FFFlow skill evaluation roadmap

Status: proposed development roadmap for the Yaunder fork. No runner or eval results exist yet. Skill source baseline: `96913468c5b89e6c35c060512fe5053a8283f6c8`.

Start by evaluating specific, observable skill contracts inside Claude Code against a real GitHub test repository. Establish that Claude Code loads the skill, reads the right state, makes the required decision, and performs the required action. Evaluate subjective implementation quality and full development workflows later.

A real service does not require a full end-to-end workflow. Resolving an epic's tasks from real GitHub and stopping before implementation is a useful, bounded behavior eval. It proves task resolution, not implementation quality or complete epic execution.

This durable roadmap follows the [FFFlow artifact convention](../../../plugin/docs/architecture.md#45-durable-roadmap-layer-in-the-repo). Implementation tasks remain proposed, not captured. See [design decisions](decisions.md) and the [Claude Code and GitHub harness design](harness.md).

## Delivery phases

| Phase | Scope | Depends on | Completion evidence |
| --- | --- | --- | --- |
| [1 — Bounded regression checks](phases/phase-1.md) | Real GitHub fixtures, Claude Code action capture, six regression families | None | Required actions and state transitions receive evidence-backed grades |
| [2 — More contracts and short handoffs](phases/phase-2.md) | More skill checkpoints, level-specific rules, producer/consumer pairs | Phase 1 | Contract coverage grows without requiring open-ended implementation |
| [3 — Continuous evaluation](phases/phase-3.md) | PR case selection, reports, budgets, stable release checks | Phase 1; broader coverage follows phase 2 | Skill changes receive actionable current-versus-candidate evidence |
| [4 — End-to-end outcomes and skill value](phases/phase-4.md) | Complete development flows, subjective quality rubrics, contribution comparisons | Phases 2 and 3 | Human-calibrated outcome evidence complements action checks |

Phase 3's report-only CI may start during phase 2. Neither full epic execution nor an LLM judge is a prerequisite for the pilot.

## Initial regression families

| ID | Skill segment | What Claude Code must demonstrate | Stop before |
| --- | --- | --- | --- |
| [REG-001](scenarios/reg-001-label-discovery.md) | Epic task discovery | Read real open children associated with the requested umbrella; exclude unrelated/closed tasks | Branching or implementation |
| [REG-002](scenarios/reg-002-capture-ordinals.md) | Capture | Create real issues with correct task ordinals, relationships, and verification | Work execution |
| [REG-003](scenarios/reg-003-natural-order.md) | Epic ordering | Resolve numeric title order from actual issue titles | Branching or dispatching implementers |
| [REG-004](scenarios/reg-004-legacy-order.md) | Epic compatibility | Use the entire checklist order when any title lacks an ordinal; warn | Branching or implementation |
| [REG-005](scenarios/reg-005-umbrella-lookup.md) | Epic PR identity lookup | Read the requested umbrella by ID and derive the correct PR title | Push, PR creation, or review |
| [REG-006](scenarios/reg-006-audit-ownership.md) | Post-implementation spec update | Apply a fixed spec correction without editor self-certification | Push or PR creation |

The cases derive from the [0.4.1 and 0.4.2 fixes](../../../CHANGELOG.md). REG-001 initially uses independently seeded issues. A later short handoff feeds REG-002's actual capture output into REG-001 without repairing it. That tests composition without involving coding or PR review.

## Unit of evaluation

An evaluation case consists of a pinned skill revision, a real fixture, a scoped request, allowed and prohibited effects, observable assertions, and a completion boundary. Its score applies to that segment only.

Use the actual installed plugin and Claude Code runtime, then harvest its session log for offline grading. This is the default observation method; add hooks only when a case needs evidence or control the log cannot provide. Do not paste a rewritten subset of SKILL.md into a custom agent or tell the model which sorting algorithm, label syntax, or stamp rule is expected. The prompt may select a skill phase and tell the agent where to stop; the skill supplies how to do it.

Distinguish three sources of evidence:

1. **Claude Code events:** skill loading, tool requests and results, reads, writes, denied attempts, and ordering of actions.
2. **Independent GitHub observations:** actual persisted issues, labels, bodies, state, and associations, read by the evaluator outside the agent session.
3. **Local state:** plan artifacts, Git history/diffs, and protected-file observations.

Claude Code's final report is an observable decision for sorting/selection cases. It is not proof that a claimed API write or validation happened. Require the underlying evidence too.

## Proposed tooling layout

Keep tooling outside the shipped `plugin/` tree:

```text
evals/
  cases/                 # Versioned segment contracts, prompts, assertions
  fixtures/              # Small project templates and setup recipes
  runner/                # Claude Code CLI adapter and lifecycle
  github/                # Real fixture provisioning, observation, cleanup
  observers/             # Tool events and file-state collection
  graders/               # Deterministic action/state predicates
  tests/                 # Runner, observer, fixture, and grader checks
```

Store run manifests, raw streams, snapshots, and reports outside the agent's accessible fixture. Persist the actual GitHub URL/IDs and fixture creation receipts. No fake GitHub implementation is part of the pilot.

## Grading policy

Each scenario defines required observations, forbidden actions, and accepted equivalent behavior. Prefer semantic checks such as a query constrained to the correct epic and open state over exact shell command strings. `gh issue view <id>` and an equivalent issue-by-ID API read can satisfy the same identity assertion.

Grade required actions separately from results. Correctly reporting IDs without reading the fixture does not pass discovery. Correct final titles without persisted-title verification fail capture's verification assertion. Denied prohibited writes are observable violations even when the final GitHub state is unchanged.

A failed exploratory read that is corrected can still satisfy the final contract unless that read violates an explicit prohibition. Retain retries and unnecessary requests as diagnostic measures. Do not silently turn every inefficient action into a correctness failure.

Results are `pass`, `behavior_failure`, `harness_error`, or `needs_review`. Missing expected actions and loops under a working environment are behavioral failures. Service outages, broken setup, and lost event capture are harness errors. Ambiguous warning interpretation is reviewable, not a guessed pass. Publish all attempts and their classifications.

The pilot needs no subjective code-quality score. In REG-006, code and tests are prepared inputs and the expected spec correction is concrete. For warnings, deterministic checks can identify clear cases; uncertain paraphrases go to human review. An LLM judge must not be added merely to avoid defining an assertion.

Validate graders using known-good and deliberately broken saved evidence, including no-op traces. Then use controlled skill changes to test behavioral sensitivity. A grader rejecting a fabricated bad trace does not prove that a model run will expose a defective skill; report those two results separately.

## Comparisons and reliability

Compare the accepted fork baseline and candidate under the same model, Claude Code version, settings, fixture recipe, permission envelope, and limits. Each trial gets newly created GitHub objects and fresh local/session state. Normalize actual IDs to fixture roles only for reporting; never substitute fake IDs into the agent's observations.

Start with one trial per variant to debug the harness, then three per variant per revision. Alternate revision order. Report counts by family and variant, all-trials-pass counts, failed predicates, retries, time, tokens, and cost. Six families cannot support confident claims about small global improvements. Preserve all attempts; a rerun must not erase a failure.

A pre-fix skill may still pass because the model or project instructions compensate. Keep that result. Use evidence to determine which contracts the suite discriminates, rather than weakening realistic context to manufacture failures.

## Operational boundaries

Use a dedicated real GitHub repository with a stable fixture `main`, serial pilot execution, unique per-trial artifacts, and repository-scoped credentials. Repository provisioning and actual runs are implementation work; this document does not claim a repository has been created. The user has accepted real-repository evals; choosing/provisioning the dedicated target is the first implementation configuration step.

Run only contract checks whose side effects are declared. Read-only cases must not create issues or branches; capture cases intentionally create real issues. Never merge as part of the pilot. Retain failed-run evidence and clean up only recorded run-owned artifacts after grading. [Harness design](harness.md) specifies identity mapping, event collection, and cleanup.

Begin report-only. Promote individual stable cases after reviewing their fixtures, observation completeness, and repeated results. Later CI selects downstream consumers when producers change. Documentation-only roadmap edits need structural checks, not model runs.

## Research basis

[Anthropic's agent eval guidance](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) supports combining outcome and trace checks, isolated trials, repeated runs, and explicit grader calibration. Here, trace checks are warranted where the skill contract itself specifies an action or sequence.

[SkillsBench v4](https://arxiv.org/abs/2602.12670v4) motivates paired skill comparisons with deterministic verification. [SkillGym v2](https://arxiv.org/abs/2609.27717v2) motivates executable task environments. [Anthropic's skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) provides a baseline-versus-candidate review pattern. Automated optimization such as [SkillOpt](https://github.com/microsoft/SkillOpt) remains a later possibility after reliable graders and held-out cases exist.
