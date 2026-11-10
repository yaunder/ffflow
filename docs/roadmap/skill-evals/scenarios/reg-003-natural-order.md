# REG 003 Natural task ordering

Status: proposed. Runtime: Claude Code. Mode: scoped skill, read-only GitHub. Segment: `work-epic` ordering decision.

## Contract

If every open task has an ordinal, use numeric `T<N>` order, including T10 after T2. Do not order by issue number or the umbrella checklist. Source: [work-epic issue ordering](../../../../plugin/skills/work-epic/SKILL.md#issue-ordering).

## Real GitHub setup

Create a real umbrella E and independent task issues in this sequence:

| Creation position | Fixture role | Title |
| --- | --- | --- |
| First | C | T10 — Add CLI output |
| Second | A | T1 — Add validator |
| Third | B | T2 — Wire signup |

Record actual issue numbers. Put checklist order B, C, A in the umbrella. Numeric title order must be A, B, C. Ascending creation/issue order is C, A, B; reverse order is B, A, C; lexical title order is A, C, B. All differ from the expected decision.

Use real `epic-E` labels and include a closed child. Gaps between T2 and T10 are legal for an open-task subset. Independently validate the fixture. Observe the actual API list order; never replace it with a manufactured response.

## Scoped request and stop

> Use /fff:work-epic <E> to resolve and report the intended execution order of the open tasks. Stop after resolution; do not create a branch or start implementation.

Do not mention numeric sorting or provide expected IDs. Grade the resulting decision before any implementation, dispatch, or branch change.

## Log and state assertions

- The real skill loads and Claude Code successfully reads the actual task titles.
- Its explicit reported ID order equals A, B, C after mapping fixture roles to real numbers.
- No task is missing or duplicated; closed children are excluded.
- It does not claim to be using the legacy fallback on fully numbered titles.
- It performs no implementation dispatch or local/remote mutation.

Use the harvested tool results and final report plus independent initial/final state. Sorting code in a Bash call is optional evidence; do not require the model to sort in any particular language. A reported order is evidence of this decision, not evidence of later execution order.

## Variants and controls

- `numeric`: T1, T2, T10 as above.
- `legacy-prefix`: use `E0.1 T1 — …`, `E0.1 T2 — …`, `E0.1 T10 — …`; same expected order.
- Bad saved logs: lexical order, ascending/descending issue order, checklist order, a fabricated answer without reading titles, or continuing to implementation.
- Good saved logs: supported numeric order with equivalent query/sorting methods.

## Sensitivity and scope

Change the temporary skill to order by issue number or lexical title and observe whether Claude Code follows the defective rule. No full epic run is required for this assertion. Actual execution-order checks belong to the later end-to-end suite.
