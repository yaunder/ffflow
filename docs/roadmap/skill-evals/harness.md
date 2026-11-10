# Claude Code and real GitHub evaluation harness

Status: proposed implementation design. The initial target is the actual Claude Code CLI with the FFFlow plugin, operating on a dedicated GitHub test repository. The outer runner sets up cases, observes actions, and grades them; Claude Code retains its own agent loop, tools, context handling, and skill loading.

## Start with the session log

The smallest useful runner prepares one real GitHub fixture, launches one scoped Claude Code session, saves its log, and runs an offline grading script. Start there. A custom agent loop, SDK application, hook framework, or live event dashboard is unnecessary for the first cases.

Harvest the session's native transcript when available, identified by the actual session ID and the pinned runtime's storage layout. Also capture the CLI's JSONL stream directly so the runner does not depend exclusively on an internal transcript path. Retain the raw records; normalize a copy for grading. Record which source contains tool inputs, results, skill expansion, and final output, and test that coverage before trusting a grade.

Existing manually run sessions can be graded with the same parser if their initial fixture and final state were saved. A transcript without a known starting state can support diagnosis, but it is not automatically a reproducible regression trial.

## Runtime and optional instrumentation

Pin the Claude Code binary version, model identifier, plugin commit/content hash, `gh` version, settings, and fixture revision. Start a fresh `claude -p` session in the trial checkout with the plugin supplied through `--plugin-dir` and save `--output-format stream-json --verbose` output. These interfaces are documented in the [CLI reference](https://code.claude.com/docs/en/cli-reference).

Use normal skill and project-context loading in a clean evaluation environment. Include only the fixture's project instructions and the tested plugin, plus any explicitly declared instrumentation. Verify the selected skill actually loads, through initialization and skill-expansion/tool evidence supported by the pinned version. Merely seeing the name in a catalog is insufficient. Do not use a mode that silently removes the context or skill behavior under test; validate the profile in the runner preflight. See [programmatic Claude Code](https://code.claude.com/docs/en/headless).

Use the harvested transcript/stream to inspect tool names, inputs, results, and sequence. Add `PreToolUse`, `PostToolUse`, or failure/denial hooks only when a case demonstrates a missing observation or needs pre-execution control. If added, preserve tool/session IDs and correlate with the original log. Hooks must not repair arguments, replace GitHub responses, inject answers, or implement a missing skill step. The [hooks reference](https://code.claude.com/docs/en/hooks) describes optional event inputs and controls.

A requested tool is not necessarily an executed or successful tool. Grade the result as well as the request. If hooks are introduced, their event coverage differs for validation errors and permission denials, so reconcile them against the raw log. Validate request/result/error classification with saved probe sessions before grading skill behavior.

When Bash runs a script, a tool event shows the shell request, not necessarily every API operation inside it. Preserve relevant script contents, outputs, and before/after state. Accept equivalent API access when provenance is clear; classify opaque provenance as `needs_review` or observer failure rather than inventing evidence. Do not claim network-complete auditing from shell-string matching.

## Real repository fixture lifecycle

1. Configure one dedicated repository, for example a future `yaunder/ffflow-evals` if available, with a stable small Python L0 project on `main`. Record its actual full name and commit; this is a proposed name, not an existing resource claim.
2. Allocate a unique run ID and serial lease for the pilot. Clone the real repository into a fresh sandbox. Create a local trial manifest outside agent access.
3. Provision each case's issues, labels, checklist, and any prepared branch through actual GitHub operations. Save every returned URL and number immediately. Do not assume contiguous IDs or allocate invented numbers.
4. Independently read the fixture back before starting Claude Code. Validate titles, label relationships, state, and checklist completeness. Missing required permissions/labels are setup failures unless their creation is the behavior being tested.
5. Run the scoped request against real `gh` and GitHub. Observe without correcting the agent's decisions.
6. Stop at the declared boundary, save local state, and read resulting GitHub objects independently. Use direct object reads and bounded retries for confirmed service propagation; do not rewrite data to make the case pass.
7. Grade before cleanup. Archive receipts, events, final snapshots, and raw outcomes.
8. Close run-owned issues/PRs and delete run-owned remote branches only according to the configured retention policy. Retain failures until evidence is saved. Record cleanup failure separately from the original behavior grade.

Namespace plan slugs, branches, umbrella titles, and issue-body markers with the run ID. Preserve the contractual task prefix `T<N> — `; do not prepend a run ID ahead of it. Track child ownership by their returned IDs, parent relation, and receipts. Do not close arbitrary issues found by a broad title search.

A shared repository cannot reset issue numbering or erase historical records. Reproducibility means recreating the same relationships and content with new IDs, not replaying identical numbers. Keep pilot execution serial; later concurrency needs independent namespaces plus a registry of dynamic artifacts and validated isolation.

The runner's setup credentials and agent credentials have separate roles. Provide repo-scoped access: read-only GitHub access for discovery/ordering/lookup/spec-update cases, issue-write access for capture. Avoid loading personal credentials for unrelated repositories. Do not bypass normal permissions globally. The real `gh` executable and service responses remain unchanged.

## Boundaries without answer leakage

A scoped invocation selects the relevant part of the real skill:

> Use /fff:work-epic <umbrella-number> to resolve the open tasks and report their intended execution order and any warnings. Stop after resolution; do not create a branch or implement tasks.

This narrows the work but does not supply the correct label, order, or fallback rule. Record this mode as `scoped_skill`; it measures compliance within the requested segment. It does not establish that an unconstrained run would reach the same result.

For a later phase, provide a truthful `seeded_continuation` handoff describing prepared code/tests or completed tasks. Do not create a forged Claude Code transcript or claim fixture-authored work was performed by the agent. Invoke the real skill with that phase selected.

The primary completion signal is a final segment report with all required evidence present. A completion message alone cannot pass a case. Start with the scoped prompt, normal permissions, repo credential limits, and a process time/budget cap. Inspect the log for actions beyond the requested segment; add a targeted hook only if reliable pre-execution stopping is needed. Test termination on the pinned runtime and preserve partial events. Never interpret every denied tool or process exit as successful boundary completion.

If the prompt explicitly prohibited a branch/create/merge action and Claude Code attempts it, record a boundary violation even if denied. If the observer unexpectedly blocks an operation required by the case, classify a harness error. Unknown compound commands must not be waved through or called violations solely on a naive regex: constrain the environment, inspect evidence, and flag unsupported observation.

GitHub read-only credentials do not prevent local branch or file changes. Inspect local Git/file state and logged actions as well. The trial environment and credential scope provide isolation; optional tool hooks are not a complete security boundary.

## Case contract example

The future schema should encode these concepts; names below are proposed, not a runnable configuration:

```yaml
id: REG-003
variant: numeric
mode: scoped_skill
runtime: claude-code
skill: fff:work-epic
fixture: numbered-epic
inputs:
  umbrella: fixture.umbrella.number
boundary: resolution_complete
allow_effects: []
required:
  - skill_loaded
  - actual_task_titles_read
  - reported_order_equals_fixture_numeric_order
  - closed_tasks_excluded
forbidden:
  - repository_mutation
  - branch_creation
  - implementation_dispatch
  - issue_or_pr_mutation
limits:
  wall_seconds: 300
  max_cost_usd: 2
```

Those example limits are initial proposals for a short read-only case, not measured requirements. Capture/spec-update cases get separately calibrated limits. Lock limits before paired comparisons; do not increase only the failing condition's allowance.

Expected IDs/order and assertions remain evaluator-only. The agent sees the repo, umbrella ID, task context, stop scope, and optionally a neutral output schema. A schema may request ordered issue IDs and warnings but must not enumerate their correct values. Use the same output requirements in both conditions and note that they can affect behavior.

## Action and state grading

A normalized event links its raw source to an observed action: load skill, read issue, list children, create issue, inspect persisted title, write file, or attempt a prohibited mutation. The adapter extracts evidence; it does not replace the action with its own execution.

Each assertion returns `pass`, `fail`, or `unknown` with evidence references. A trial passes only when all required predicates pass and no forbidden action occurred. Unknown critical evidence routes to review or harness diagnosis. Distinguish an attempted write, a successful write, and a report claiming a write.

For a reported sequence, parse the explicit list of issue IDs and compare it to the evaluator's fixture-derived order. Do not force one sorting implementation. For a warning, require a user-visible explanation of the missing-ordinal fallback; accept clear paraphrases and route ambiguous ones to human review. Output style or prose elegance is not a pilot metric.

For REG-006, inspect logged Edit/Write/Bash actions and before/after file snapshots. This catches direct stamp edits and final-state changes without custom hooks. A before/after hash cannot detect a transient write-and-restore inside one opaque shell process. Add filesystem observation only if the release assertion needs to cover that gap, and prove it catches the control. Otherwise report the narrower final-state/log evidence. Semantic stamp changes matter more than harmless YAML formatting.

## Evidence bundle and observer validation

Save a manifest, fixture receipts, preflight snapshots, Claude Code transcript/stream, local diffs, final GitHub snapshots, assertion results, and cleanup receipts. Include hook events only when that case enables them. Keep setup/grading/cleanup operations in separate logs so they cannot be mistaken for Claude Code actions. Redact credentials and keep graders outside agent access.

Before model trials, validate the observers and graders using known-good records and records with wrong labels, wrong ordering, absent reads, missing verification, denied writes, and self-stamps. Include traces that leave state unchanged by doing no work. A temporary broken skill provides a separate execution sensitivity probe; compensating model behavior is a result, not a grader defect.
