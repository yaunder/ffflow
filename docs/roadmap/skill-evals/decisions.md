# Skill eval design decisions

The agreed direction is real GitHub, actual Claude Code execution, and bounded checks of explicit skill obligations before full end-to-end evaluation. Operational defaults below remain proposed until implementation.

## Real GitHub from the first pilot

Use a dedicated test repository and actual `gh` operations. No stateful fake GitHub or simulated PR service is required. This directly exercises labels, queries, persisted titles, issue identity, and actual command behavior. Rebuild fixtures with real IDs and retain all setup receipts.

Use synthetic saved evidence to test graders. Introduce service fault injection only for a concrete later need, clearly separated from live-service evidence. Do not race an external writer against the agent merely to simulate a corrupt response.

## Claude Code is the system under test

Launch the pinned Claude Code CLI with the real FFFlow plugin and standard fixture context. Harvest its native session log/JSONL output and grade tool calls, arguments, results, and sequence afterward. Pair that with independent GitHub reads and local snapshots. Hooks are optional additions for a demonstrated observation or stop-control gap, not baseline infrastructure. The outer runner does not reimplement the agent loop. A Python/TypeScript SDK adapter is not a prerequisite or substitute runtime in the pilot.

## Segment contracts come before full workflows

Scope the user's request to a skill segment and declare its stop boundary. Observe actions in that segment. A normal skill entry point is used when possible; a truthful seeded continuation supports later phases without asking the model to invent an implementation first.

Full capture is already narrow and objectively checkable. Full epic implementation, code-quality judging, holistic review, and merging are outside phase 1. A future end-to-end suite supplements segment tests; it is not a prerequisite for accepting them as useful regression protection.

## Deterministic assertions first

Use actual GitHub reads plus Claude Code events and local state. Grade task membership, order, label relationships, ordinal prefixes, specific reads/verification, and stamp ownership. Reports of successful action require corroborating evidence. Do not score planning elegance or implementation design in the pilot.

## Keep tooling outside the plugin

Place future tooling in root `evals/`, with durable design in `docs/roadmap/skill-evals/`. The plugin retains its skills-only distribution. This documentation change does not release or modify the plugin, so it does not require a plugin version bump.

## Contract issues to resolve during expansion

- **Capture resume state:** `plan-capture` promises reruns but rejects `phase: captured`. Proposed resolution: accept that state for reconciliation, preserve IDs, and no-op when unchanged. Fresh-capture pilot cases avoid the ambiguity.
- **Audit plan location:** `audit --plan` writes inside `plan/`, while the architecture requires temporary plans outside the project tree. Proposed resolution: follow the project-hash convention.
- **Audit plan sealing:** audit can emit open decisions and mark `chat-complete`. Proposed resolution: retain unresolved state until decisions are settled.
- **Configuration absence:** distinguish default L0 methodology from planning initialization prerequisites explicitly.
- **Delegated auditor ownership:** L1+ execution can legitimately invoke an auditor. An audit-file diff alone does not establish self-certification. The L0 pilot checks editor behavior; the explicit-audit control validates observed auditor activity separately. Insufficient provenance cannot receive a pass.

Accept and test resolutions alongside skill changes. Do not let a judge silently select between contradictory contracts.

## Implementation configuration

Select/provision the dedicated test repository, choose an available pinned model and Claude Code version, and establish per-case limits in the first runner task. The user has authorized the real-repository approach; no repository has been provisioned by this roadmap edit. Use serial pilot runs and recorded artifact ownership. Keep results report-only until observation reliability is demonstrated.
