# REG 001 Capture labels and epic discovery

Status: proposed. Runtime: Claude Code. Mode: scoped skill, read-only GitHub. Segment: `work-epic` task resolution.

## Contract

Discover the open tasks associated with the requested umbrella using capture's `epic-<umbrella-id>` relationship. Exclude unrelated and closed issues. Sources: [GitHub cartridge](../../../../plugin/skills/plan-capture/cartridges/github-issues.md) and [work-epic](../../../../plugin/skills/work-epic/SKILL.md).

## Real GitHub setup

Create a real umbrella E, three open children A/B/C, a closed child D, and another umbrella with an unrelated child. Apply `ffflow-task` and `epic-E` to the intended children, using E's actual returned number. Give open children valid task ordinals so fallback does not interfere. Record all real IDs and read the state back independently.

For the primary case, fixture setup creates these objects directly. This isolates discovery from capture. The later handoff variant uses REG-002's actual captured objects without repairing labels or titles.

## Scoped request and stop

> Use /fff:work-epic <E> to resolve the open tasks. Report the issue numbers and intended order, including any warnings. Stop after resolution; do not create a branch or implement tasks.

No label syntax, expected child IDs, or expected order appears in the prompt. The session ends after the report. Read-only GitHub access and local state checks detect unintended effects; full implementation is not run.

## Log and state assertions

| Assertion | Evidence |
| --- | --- |
| Real skill loaded | Session skill-expansion/invocation evidence |
| Requested epic's open tasks were read | Tool inputs and successful GitHub results in the session log |
| A/B/C are exactly the reported task set | Final explicit ID list compared with evaluator-only fixture map |
| D and unrelated children are excluded | Report plus independent GitHub preflight snapshot |
| No execution began | No branch mutation, implementer dispatch, or issue/PR mutation in the log and resulting state |

An equivalent API query/filter is valid. Do not require a shell string verbatim. A wrong colon-label query followed by correct recovery is recorded as a diagnostic retry; final discovery can pass if the required reads and membership are correct. A fabricated list with no successful supporting read fails.

## Variants and controls

- `seeded-discovery`: the primary case above.
- `empty-epic`: no open children; expect an explicit stop, no invented tasks or mutations.
- `capture-handoff`: fresh Claude Code session consumes REG-002's live output. Grade the capture and discovery segments separately; producer failure means consumer not reached.
- Bad saved logs: wrong label with no recovery, unfiltered unrelated IDs, a closed child, correct report without a supporting read, or prohibited branch creation.
- Good saved logs: successful semantically constrained discovery and exact membership, including equivalent command forms.

## Sensitivity and scope

Restore the incorrect colon label on a temporary skill copy and inspect the resulting actual session. Model recovery may mask the defect; retain that outcome. This case proves discovery, not correct implementation of the discovered tasks.
