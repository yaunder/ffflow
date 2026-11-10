# Phase 1 Bounded regression checks on real GitHub

Kind: design slice. Depends on: none. Estimated implementation tasks: six. Status: proposed, not captured.

Deliver six bounded regression families running in the actual Claude Code CLI with real GitHub state. Grade required actions and concrete outcomes before evaluating open-ended implementation quality. See the [harness design](../harness.md) for runtime, credentials, lifecycle, and observation details.

## Implementation sequence

| Task | Scope | Acceptance evidence | Depends on |
| --- | --- | --- | --- |
| T1 | Provision the dedicated repo and run one read-only Claude Code skill segment | Real fixture receipts; skill load verified; session log harvested; offline grader checks reads/results/stop scope against good and bad evidence | None |
| T2 | Resolve actual epic children and numeric order | REG-001 seeded discovery and REG-003; wrong membership/order rejected; no branch or implementation | T1 |
| T3 | Exercise legacy fallback and umbrella identity lookup | REG-004 and REG-005; checklist and title assertions plus actual source reads | T2 |
| T4 | Capture actual task issues and verify persisted ordinals | REG-002 single-slice and roadmap cases; correct labels/maps/verification; short capture-to-discovery handoff | T1, T2 |
| T5 | Check audit ownership after a prepared implementation | REG-006 scoped spec correction; fixed implementation preserved; ownership evidence and explicit-audit control | T1 |
| T6 | Validate sensitivity and publish paired reports | Three trials per selected variant/revision; known-bad controls; evidence links; cleanup and infra failures separated | T3, T4, T5 |

These are implementation task boundaries, not tracker records. Each PR ships the relevant case contract, implementation, and validation together. Start with one read-only case and an offline session-log grader before adding capture writes. No hook framework or custom SDK agent is required.

## Shared fixtures

Use a dedicated real GitHub repository with a stable small Python L0 project and ordinary adopted-project instructions. Use new actual issues per trial, a unique plan slug, a fresh checkout/session, and a registry of returned IDs. Seed generic labels and prerequisite state; do not precompute the result the skill must produce. Capture must handle its own newly required epic association labels.

For ordering, create task issues in an order that conflicts with their ordinal order. Read back GitHub's actual list response; do not fake the service's response order. Use a checklist ordering that conflicts with both numeric and issue-creation order. For the compatibility variants, edit real issue titles during setup, then freeze the fixture for execution.

For audit ownership, seed completed code and tests with a simple known behavior. Claude Code performs only the subsequent spec update and applicable local checks. This creates a real audited-file edit without asking it to design an implementation.

## Run protocol

1. Check setup permissions, fixture state, runtime/skill loading, and observer controls.
2. Run one trial per primary variant and inspect all traces.
3. Add the named variants and short capture-to-discovery handoff. No full epic execution is required.
4. Compare baseline and candidate with three fresh trials per variant, equal limits, and alternating condition order.
5. Review failures and missing evidence. Separate setup/service/observer errors from agent errors.
6. Run controlled skill reversions on temporary plugin copies and report whether the case detects them. Do not assume an older instruction forces failure.
7. Save evidence before cleaning run-owned GitHub objects; record retained failures and cleanup errors.

## Exit criteria

- All six primary segment contracts run in Claude Code against the configured real repository.
- Required reads/actions are corroborated by events; persisted writes are checked independently on GitHub.
- Cases stop at their declared boundaries; prohibited attempts are visible even when blocked.
- Every grader rejects its known-bad controls, including a no-op agent.
- No primary case requires subjective code-quality judgment, full implementation, or a complete epic PR.
- Prepared fixture actions, Claude Code actions, and evaluator cleanup remain distinguishable.
- Paired manifests, cost, repetitions, actual object IDs, and evidence links are retained.
- Results are report-only until their reliability is reviewed.

Out of scope: live production repositories, merging, full epic workflows, general code-review scoring, automatic skill optimization, and building a fake GitHub API.
