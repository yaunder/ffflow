# Phase 3 Continuous evaluation

Kind: design slice. Depends on: phase 1; broader release coverage follows phase 2. Status: proposed, not captured.

Use the bounded suite to review skill changes before investing in full development-flow evaluation.

| Change | Checks |
| --- | --- |
| Observer or grader change | Schema, fixture/setup logic, event coverage, and known-good/bad evidence tests |
| Skill or cartridge change | Affected segment cases and short downstream handoffs |
| Shared beliefs or architecture | Broader contract coverage and review of changed grading assumptions |
| Release | Promoted bounded regression cases |
| Model or Claude Code version | Paired suite with unchanged fixtures and grading |

Case metadata identifies dependencies. Capture changes select REG-002 and the capture-to-discovery handoff; work-epic changes select discovery, both ordering modes, and umbrella lookup. Documentation-only roadmap edits require structural checks, not paid model runs.

Use the dedicated GitHub repo with a serial CI lease initially. Save per-run object IDs, setup receipts, tool events, independent snapshots, outcomes, costs, and cleanup results. Set explicit spend/time limits and retain all attempts. Credentials must remain scoped to the test repository; evaluate reviewed skill revisions in isolated jobs rather than exposing credentials to arbitrary untrusted PR execution.

Begin report-only. Promote each case after its setup, observer, and grading have been validated. Confirmed critical behavior failures block a promoted case; outages and missing evidence require diagnosis. Establish ownership for triage, case retirement, fixture maintenance, and artifact retention before turning on recurring runs.

Exit when a representative skill PR selects the correct cases and produces inspectable evidence with bounded cost and reliable cleanup. An evaluator should be able to distinguish an incorrect Claude Code action from a GitHub or instrumentation problem without reading the entire transcript.
