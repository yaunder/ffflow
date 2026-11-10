# Phase 2 More contracts and short handoffs

Kind: design slice. Depends on: phase 1. Status: proposed, not captured.

Expand toward roughly 25 scenario families through bounded actions and short producer/consumer handoffs. Keep implementation judgment out of a case when a known fixture can expose the contract directly.

| Area | Next cases | Concrete evidence |
| --- | --- | --- |
| Planning | Refuse unresolved decisions; allow prose question marks; preserve prior decisions on resume | Plan metadata, files, and tool actions |
| Capture | Repeated no-op; one task update; preserved IDs; roadmap backlinks | Actual GitHub objects and captured maps |
| Execution gates | Existing behavior detected; a known failing check blocks readiness; dependency handling | Fixed tests, tool outcomes, and decision artifacts |
| Audit | Known drift versus clean state; out-of-scope changes; stamp authorization | Seeded facts, findings, scope reads, and stamp changes |
| Characterization | Preserve implementation; register new audit surface; use required annotations | Local diffs, metadata, and concrete fixture facts |
| Upgrade | Dry run; stale stamp; preserve human text; idempotent reconciliation | File state and observed action order |

Resolve the [documented contract issues](../decisions.md#contract-issues-to-resolve-during-expansion) before making affected cases blocking. A short handoff uses one skill's untouched output as the next skill's input; it need not continue through the whole lifecycle.

Add focused L1/L2/L3 checks only for unique obligations, such as required audits, Gherkin validity, RID uniqueness, or gate execution. Introduce one TypeScript fixture when a case needs it. Avoid the full Cartesian product of skills, levels, stacks, and backends.

Interactive cases need a scripted response driver that answers the actual decision without revealing the expected skill behavior. Document whether the driver changes the runtime profile. Service-failure cases can be added when a real need justifies fault injection; label the injected boundary distinctly from live GitHub coverage.

Exit when each family has an explicit contract and observation boundary, short handoffs catch incompatible artifacts, and the coverage matrix shows remaining gaps. Defer semantic planning quality, architectural taste, and general implementation quality to phase 4.
