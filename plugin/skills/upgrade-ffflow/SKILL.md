---
name: upgrade-ffflow
description: Reconcile this project against the current FFFlow version. Reads the stamped ffflow_version, walks the migration ledger, duck-types unstamped repos by evidence, applies the gaps, re-stamps. Run after updating the plugin.
---

# upgrade-ffflow

## Purpose

Updating the plugin changes what FFFlow *believes*. It does not change what your repo *contains*. This skill closes that gap.

It answers one question — **"what does this repo still need in order to be a current FFFlow project?"** — and then does something about it.

## Plan Mode

This skill does NOT invoke Plan Mode. It presents a findings table and applies confirmed remediations directly. Anything large enough to want a plan gets delegated to a skill that makes its own planning decision (`audit --plan`, `adopt-ffflow --ui`).

## When to invoke

- Right after `/plugin update fff` — the primary case.
- On a repo that has been on FFFlow a while and feels out of step with the methodology.
- Periodically, the way you'd run `/fff:audit`. It is idempotent and cheap when there's nothing to do.

**Not** for adopting FFFlow on a new project — that's `/fff:adopt-ffflow`. If there's no `.ffflow/config.yaml`, this skill stops and says so.

## Inputs

- Project root (cwd).
- `.ffflow/config.yaml` — for `ffflow_version` (may be absent) and for `applies_when` conditions.
- `${CLAUDE_PLUGIN_ROOT}/docs/migrations.md` — the ledger.
- `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` — the current version.
- Optional `--dry-run` — report only, change nothing, don't stamp.
- Optional `--from <version>` — override the inferred starting version. Escape hatch for a wrong duck-type.
- Optional `--only <id>[,<id>]` — apply specific ledger entries.

## Outputs

- A findings table (what's missing, why, what would fix it).
- Applied remediations, each confirmed unless `autonomous: true`.
- Updated `ffflow_version` + `ffflow_upgraded` in `.ffflow/config.yaml`.
- A summary naming anything **declined or deferred** — declining is a valid outcome, but a silent decline is not.

## Dependencies

Delegates rather than reimplements:

- `audit` (`--type claude-md --fix`) — CLAUDE.md coverage and generation.
- `stack-init` — justfile, hooks, CI.
- `adopt-ffflow --ui` — view-layer-purity retrofit.
- `init-ffflow` — the canonical beliefs-block text lives there; this skill re-uses it.

## Flow

### 1. Establish both endpoints

**Target** = `version` from the plugin manifest.

**Current** = `ffflow_version` from `.ffflow/config.yaml`, if present.

No `.ffflow/config.yaml` at all → stop:

```
This project isn't on FFFlow — no .ffflow/config.yaml found.
Run /fff:adopt-ffflow to onboard it. upgrade-ffflow reconciles adopted
projects; it doesn't adopt them.
```

`ffflow_version` absent → **pre-0.4.0, exact version unknown.** Expected, supported, and handled in step 2. Say so plainly rather than treating it as a fault:

```
No version stamp found — this repo predates version stamping (0.4.0).
Inferring its effective version from what's actually in the tree...
```

Current == target and no `--only` → report "already current," run the detection sweep anyway (cheap, and catches hand-edits that regressed something), and exit without stamping if nothing is found.

### 2. Duck-type when unstamped

The stamp is a **hint, never an authority.** Detection is always evidence-based — every ledger `detect` block reads the repo, not the config. This matters twice: it's what makes unstamped repos work, and it's what catches a stamped repo where someone deleted a file by hand.

For an unstamped repo, run **every** ledger entry's detection from 0.1.0 forward. Then infer:

- All entries for versions ≤ V detect as present, and at least one entry above V is missing → effective version ≈ V.
- Mixed results within a version → report the mix honestly. Partial adoption is a real state (someone ran `adopt-ffflow --ui` but never touched their justfile), and it's more useful to say that than to force a single number.

Show the inference and its evidence before acting:

```
Duck-typed effective version: ~0.3.0

  ✓ 0.1.0  ffflow-config          .ffflow/config.yaml present (level: L3)
  ✓ 0.2.0  l3-unlocked            level already L3
  ✓ 0.2.1  justfile-baseline      justfile has all baseline recipes
  ✓ 0.3.0  ui-view-layer-purity   .storybook/ + tokens + stack.yaml lane present
  ✗ 0.4.0  version-stamp          no ffflow_version key
  ✗ 0.4.0  beliefs-block          no ffflow:beliefs markers in CLAUDE.md
  ✗ 0.4.0  hierarchical-claude-md 1 CLAUDE.md found; 7 significant modules

Proceed on this reading? (y / adjust with --from)
```

The ledger is short and detection is cheap. Sweeping all of it, always, costs little and removes a whole class of "the stamp lied" failures.

### 3. Select applicable entries

For each entry between current and target:

- Evaluate `applies_when` against config + repo state. Not applicable → skip silently (don't clutter the report with UI entries on a backend project).
- Evaluate `detect`. Present → skip, note as satisfied.
- Missing → add to the work list.

Order by severity (high → low), then by version.

### 4. Report before acting

Always show the full table first, even with `--only`:

```
FFFlow upgrade: ~0.3.0 → 0.4.0

  HIGH  beliefs-block           Root CLAUDE.md has no managed beliefs block
                                → write block (auto)
  HIGH  hierarchical-claude-md  7 significant modules, 1 CLAUDE.md
                                → /fff:audit --type claude-md --fix
  HIGH  version-stamp           No ffflow_version in config
                                → stamp 0.4.0 (auto, runs last)

Apply all (a), select (s), dry-run detail (d), abort (x)?
```

### 5. Apply

In severity order. Per entry:

- `autonomous: true` → apply, report.
- `autonomous: false` → confirm, then apply or record the decline.
- Delegating entries → invoke the owning skill via the Skill tool and let it run its own flow, including its own confirmations. Do not re-implement or second-guess it. If the user aborts inside a delegated skill, that entry is **declined**, not failed — carry on with the rest.

### 6. Stamp — last, always

Only after every selected entry is applied or explicitly declined:

```yaml
ffflow_version: 0.4.0
ffflow_upgraded: 2026-08-23
```

**Stamp even when entries were declined**, and name them in the summary. The stamp means *"this repo has been reconciled against 0.4.0"* — reconciliation includes an informed "no." A repo that declined an entry and didn't get stamped would re-surface that same prompt on every future run, which trains the user to ignore the tool.

`--dry-run` never stamps.

### 7. Summary

```
✓ Upgraded to 0.4.0

  Applied:
    beliefs-block           wrote managed block to CLAUDE.md (18 lines)
    hierarchical-claude-md  generated 7 module CLAUDE.md via audit --fix
    version-stamp           .ffflow/config.yaml → ffflow_version: 0.4.0

  Declined:
    (none)

Next: review the generated module CLAUDE.md files — they're seeded from
real file content, but a human eye catches what a template can't.
```

## Idempotency rules

- Re-running with nothing to do is a no-op that reports "already current."
- Detection never mutates. Only remediation writes.
- The beliefs block is rewritten in place between its markers. Bytes outside the markers are never touched — this is an invariant of the skill, not a best effort.
- Never downgrade `ffflow_version`.

## Principles

- **Detect from evidence, not from the stamp.** The stamp orders the work; the repo decides what's actually needed.
- **Missing stamp is expected, not broken.** Every repo hits it exactly once.
- **Delegate to the artifact's owner.** This skill orchestrates; it does not own CLAUDE.md, justfiles, or UI scaffolding.
- **A decline is an outcome.** Record it, stamp anyway, don't nag.
- **The ledger is the contract.** New repo-affecting release ⇒ new ledger entry, or the upgrade path silently rots — the exact failure this skill exists to fix.

## Anti-patterns

- Trusting `ffflow_version` instead of detecting. The stamp can be stale, hand-edited, or from a repo copied out of another.
- Stamping before remediation. A crashed run would leave the repo claiming a version it never reached.
- Re-implementing a delegated skill's logic because it's "just a couple of files."
- Auto-applying `autonomous: false` entries under `--only`. The flag selects entries; it does not grant consent.
- Treating a partially-adopted repo as an error. Partial adoption is normal and the report should say so.

## Friction addressed

- "I updated the plugin — is my project still current?" was unanswerable.
- Methodology changes reached new projects and never reached existing ones.
- Beliefs stated in the plugin were invisible to sessions working downstream.
- No way to tell which FFFlow a given repo was built against.
