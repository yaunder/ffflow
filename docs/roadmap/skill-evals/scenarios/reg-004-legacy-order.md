# REG 004 Legacy ordering fallback

Status: proposed. Runtime: Claude Code. Mode: scoped skill, read-only GitHub. Segment: `work-epic` compatibility decision.

## Contract

If any resolved task lacks a `T<N>` ordinal, use the umbrella checklist order for the entire open set and warn. Source: [work-epic legacy fallback](../../../../plugin/skills/work-epic/SKILL.md#issue-ordering).

## Real GitHub setup

Create real independent children A (`T1 — Add validator`), B (`Wire signup`), and C (`T3 — Add CLI output`) under umbrella E. Use checklist order C, A, B, with a completed item for a closed child. Record actual IDs. The correct result is C, A, B despite the two numbered titles.

Read the real service list during preflight and ensure the fixture distinguishes checklist order from the ordinary list order. If needed, adjust the checklist during setup, save the derived expectation, and freeze the fixture before execution. Never alter service responses during the trial.

## Scoped request and stop

> Use /fff:work-epic <E> to resolve the open tasks and report their intended order and any warnings. Stop after resolution; do not branch or implement tasks.

The prompt does not identify the missing ordinal or explain fallback. Collect the complete report; do not truncate it at the first correct list before any following warning.

## Log and state assertions

- Claude Code loads the skill and reads the real task titles and umbrella checklist.
- The entire reported open-task set follows checklist order, with closed items excluded.
- A user-visible warning explains that missing task ordinals caused checklist fallback for the whole set.
- No branch, implementation, or remote mutation occurs.

The order is a deterministic ID comparison. The warning has a concrete meaning, not a style score: accept clear equivalents, reject no warning or a contradictory one, and route ambiguous phrasing to human review. Do not introduce a general LLM judge for this pilot.

## Variants and controls

- `mixed`: one unnumbered title among numbered titles.
- `mixed-late`: choose the unnumbered task late in the observed preflight list; record the actual order and check again before the run. If a different query changes returned order, retain it rather than faking the response.
- `all-legacy`: all titles lack ordinals; checklist still controls.
- `all-numbered-control`: restore all prefixes; expect numeric order and no missing-ordinal fallback warning.
- Bad saved logs: numbered-first plus unnumbered-last sorting, listing order, only inspecting the first title, omitted warning, or closed-task inclusion.
- Good saved logs: actual source reads, whole-set checklist order, and clear warning.

## Sensitivity and scope

Restore an incorrect rule that falls back only when all titles lack ordinals. The mixed cases target that difference. Missing checklist entries and contradictory dependencies need separately specified expectations; they are not part of this pilot.
