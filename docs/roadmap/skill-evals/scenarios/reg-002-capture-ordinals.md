# REG 002 Capture task ordinals

Status: proposed. Runtime: Claude Code. Mode: full capture skill, real GitHub issue writes. Segment: `plan-capture` and its GitHub cartridge.

## Contract

Create task titles with correct `T<N> — <title>` prefixes, preserve task identity and epic relationships, and verify persisted titles before declaring capture complete. Sources: [capture hard rules](../../../../plugin/skills/plan-capture/SKILL.md#hard-rules) and [GitHub cartridge](../../../../plugin/skills/plan-capture/cartridges/github-issues.md).

## Real GitHub setup

Use a fresh checkout of the test repo, configured for L0 and GitHub capture. Create a unique temporary single-slice plan in `breakdown-complete` state with three tasks: add a validator, wire signup, and expose CLI errors. Supply valid spec backlinks, dependencies, and plain task titles without ordinals. Seed only generic prerequisite labels. Claude Code owns any new epic-specific label needed by its capture.

The roadmap variant has two phases, each containing three tasks, and starts in `roadmap-complete`. GitHub allocates actual issue numbers; no arbitrary ID assignment is attempted. Register objects from create receipts, `captured.json`, and independent repo reads so partial runs remain cleanable.

## Request and stop

> /fff:plan-capture <plan-dir>

Run capture to its completion report. Do not proceed to `work-epic` or implementation within this trial. Capture's local staging and real issue/label/comment writes are allowed; auto-commit, PR creation, merging, and issue closure are not.

## Log and state assertions

| Assertion | Evidence |
| --- | --- |
| Correct persisted task titles | Independent real GitHub reads after the session; prefix and numeric position both checked |
| Per-phase ordinals restart at 1; epic has no task prefix | Actual title/parent map |
| Correct membership, dependencies, and backlinks | Issue bodies/labels, captured map, and local phase files |
| All created tasks were verified after writes | Successful Claude Code reads or a verification query covering the persisted task titles, ordered after creation and before completion |
| Complete capture recorded accurately | `captured.json`, `phase: captured`, successful API results, no missing/duplicate task |
| No prohibited continuation or auto-commit | Session log and Git/GitHub state |

A creation response containing only a URL does not establish verification. The evaluator's own final read does not count as Claude Code verifying its work. Correct final titles with no observed verification fail that action assertion. A successful `gh ... --jq` query that prints only offending titles can legitimately return empty output: grade its predicate, scope, exit status, and coverage against the independent task map, rather than requiring every valid title to be printed. Allow equivalent CLI/API reads, and accept task content paraphrases only where the source contract permits them.

## Variants and controls

- `single-slice`: three task issues under one umbrella.
- `roadmap`: two phase epics; correct local ordinals and bidirectional backlinks.
- Bad saved evidence: missing prefix, all tasks labeled T1, wrong position, prefixed epic, duplicate task, broken backlink, or absent post-write verification.
- Good saved evidence: valid live state and logged persisted-title verification; grader does not depend on exact issue numbers.

## Sensitivity and scope

Remove ordinal generation or verification instructions from a temporary skill copy and compare actual runs. No live corruption race or fake response is needed. A controlled service-failure case can be designed later if it proves useful.

Exclude post-`captured` reruns until the [resume contract issue](../decisions.md#contract-issues-to-resolve-during-expansion) is resolved. This case evaluates capture only; the produced issues can feed REG-001 as a short, separately scored handoff.
