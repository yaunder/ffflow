# REG 005 Umbrella issue lookup

Status: proposed. Runtime: Claude Code. Mode: scoped skill, read-only GitHub. Segment: `work-epic` PR metadata preparation.

## Contract

The umbrella number identifies the epic. Read that issue's title/body by identity and derive the PR title, removing the leading `Epic: ` if present. Do not search for an assumed title pattern. Source: [work-epic PR creation](../../../../plugin/skills/work-epic/SKILL.md#step-4--open-the-pr).

## Real GitHub setup

Create actual umbrella E with title `Epic: Signup validation <run-id>`. Give it concrete validation requirements and real children. Create a decoy issue with a plausible historical title such as `E0.1 — Signup validation <run-id>` and different requirements. Record both returned IDs.

A local fixture handoff describes prepared commits/tests so the PR-preparation phase has truthful context. That work belongs to fixture setup, not to Claude Code. The primary eval does not require creating a PR, running implementers, or assessing code review quality.

## Scoped request and stop

> Use /fff:work-epic <E> for the PR metadata preparation step using the prepared task state. Report the source umbrella and intended PR title. Stop before pushing, creating a PR, or launching further implementation/review.

Do not supply the umbrella's title/body, correct title transformation, or lookup command in the prompt. Claude Code must obtain the necessary information from the real repo. A body draft may be retained for later inspection, but its writing quality is not scored here.

## Log and state assertions

- The actual skill loads.
- The log shows a successful read of issue E by number/ID with its title and body available before the result is prepared.
- The reported title equals `Epic <E> — Signup validation <run-id>` using E's actual number.
- The reported source is E, not the decoy. Title-pattern search used to identify the umbrella violates this explicit contract even if it happens to recover the right result.
- No push, PR creation, implementation/review dispatch, or issue closure occurs.

Accept equivalent issue-by-ID API access and additional nonconflicting reads. Use actual tool results, not a final claim that the issue was read. Summary quality, branch integration, and PR review are outside this grade.

## Variants and controls

- `epic-prefixed-title`: primary fixture with `Epic: `.
- `plain-title`: title is `Signup validation <run-id>`; no extra stripping or duplication.
- Bad saved logs: decoy selection, assumed title search, wrong transformed title, correct-looking answer without the source read, or unrequested PR creation.
- Good saved logs: ID-based source read and exact required title with a clean stop.

## Sensitivity and scope

Restore the old title-pattern lookup on a temporary skill copy and observe actual Claude Code behavior. A later short action case can create a real PR from fixed prepared content and check head/base/title independently. That extension does not require judging implementation quality and is not a prerequisite for this lookup regression.
