# Phase 4 End to end outcomes and skill value

Kind: design slice. Depends on: phases 2 and 3. Status: proposed, not captured.

Once explicit skill obligations are covered, evaluate complete capture-to-implementation-to-PR flows against the real test repository. Add small tasks with independently executable acceptance tests before adding tasks whose quality requires judgment. Compare bounded contract scores with actual downstream execution: a correctly reported order does not prove tasks were implemented in that order.

Define subjective dimensions separately: requirement coverage, maintainability, scope control, review usefulness, and planning quality. Develop human-labeled examples and acceptable alternative solutions. Calibrate model judges against those labels, inspect false passes and false failures, and allow insufficient-evidence outcomes. A polished summary cannot compensate for a broken requirement or ownership violation.

Measure task completion, regressions, human correction effort, critical violations, and time/cost per successful task. Keep contract and quality scores separate. Add fanout/autopilot only with explicit approval states, independent reviews, worktree isolation, and resume fixtures.

For skill contribution, compare plugin versus no plugin on the same plain-language task with a common outcome rubric. FFFlow-specific naming is not a requirement of the no-plugin baseline. Distinguish incremental plugin value in an adopted project from the combined value of adoption instructions and plugin. Keep model/runtime/permissions fixed and use held-out task families.

Add natural-language selection cases and new stacks/backends according to actual usage. Accept more than one valid skill choice when the workflow is correct. Report loaded references to diagnose composition, not to reward loading more context.

Exit when evidence supports decisions to retain, simplify, split, or change skills, with human-calibrated quality assessment. Automatic optimization remains optional and requires a separate final holdout.
