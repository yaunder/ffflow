---
name: notetoself
description: Session-context handoff — /notetoself save persists current state to /tmp; /notetoself resume reads it back. Isolated by working directory.
---

# notetoself

## Purpose

Two halves of the same skill:

- **`save`** — capture the current working state to disk so a future session can pick up where you left off.
- **`resume`** — read that state back and brief the user before continuing.

Same skill, two modes. Files persist across sessions; isolation is by working directory (one note per project).

## When to invoke

- Before a `/clear` when the work isn't done.
- At the end of a long session when you're handing off to tomorrow-you.
- At the start of a new session in a project you haven't touched recently.
- Before context compaction is imminent and you want a durable record.

## File layout

One note per working directory, addressed by hash:

```bash
NOTETOSELF_FILE="/tmp/notetoself-$(pwd | sha256sum | cut -d' ' -f1 | head -c 16).md"
```

The hash means:
- Two different projects don't collide.
- The same project's notes always land at the same path.
- A note survives `/clear`, session boundaries, and process restarts — but not host `/tmp` cleanup.

**Never commit the note.** If you want it to survive `/tmp` cleanup, keep it out of version control: write it to a gitignored path (`.ffflow/notes/` is a reasonable choice **only** with `.ffflow/notes/` in `.gitignore` first), or somewhere outside the repo entirely.

The note is *your* session state, not the project's. Committing it hands one developer's half-finished train of thought to everyone else on the team, where it reads as project truth. On any repo past one developer it is actively harmful:

- Two people save notes for the same directory and overwrite each other's — the hashed path that prevents *project* collisions guarantees *person* collisions once the file is shared.
- Merge conflicts in a file nobody meant to co-author, on every branch, forever.
- A stale note becomes a confident, wrong briefing for a teammate who has no idea whose session it came from or when.

If a note contains something that genuinely belongs to the project, that's a signal it was written in the wrong place. Promote the *content* — into the spec, `<plan-dir>/`, an issue, or a module CLAUDE.md — and leave the note transient.

## Mode: save

```
/notetoself save
```

(Or just `/notetoself` — defaults to `save` if no note exists for this dir; `resume` if one does. The skill detects.)

### Flow

1. Read the current session for working state: open task, recent commits, files touched, decisions made.
2. Check whether a note already exists at the hashed path. If so, **update** rather than overwrite — preserve the user's edits but replace the auto-generated sections.
3. Write the file.

### Template

```markdown
# Working Context — <YYYY-MM-DD>

## Current Task
<one paragraph: what we're doing, why>

## Progress this session
- <accomplishment>
- <accomplishment>

## Current state
- **Directory:** <pwd>
- **Git branch:** <branch>
- **Git status:** <one-line summary>
- **Key files:**
  - <path:line> — <relevance>
  - <path:line> — <relevance>

## Next Steps
1. <immediate next action>
2. <following action>

## Open questions / blockers
- <item>

## Important Context
- <key decisions and rationale>
- <gotchas discovered>
- <patterns or conventions worth remembering>

## Resume Instructions
1. <step the resumer should take first>
2. <step two>
3. <step three>
```

### Rules

- **Keep under 200 lines.** Resume is supposed to be fast; the note is a briefing, not a chronicle.
- **Be concise.** Sentences over paragraphs. File paths over prose ("see `src/auth/signup.py:42`" beats "in the signup module's signup function").
- **Convert relative dates to absolute** (`"Thursday"` → `"2026-05-22"`). The reader is a future session, not you-now.
- **Don't dump full transcripts** unless one specific exchange is the load-bearing context.
- **Idempotent.** Re-running `save` mid-session updates the note; doesn't create duplicates.

## Mode: resume

```
/notetoself resume
```

### Flow

1. Compute the hashed path. If no file exists, report `No saved context for this directory.` and suggest `/plan-status` to see in-flight plans.
2. Read the file and display it to the user.
3. **Verify current state matches saved context:**
   - Branch still the same?
   - Referenced files still exist?
   - Recent commits consistent with the recorded state?
4. **Summarize for user:**
   ```
   📋 Resuming from <date>

   Task: <main task from note>
   Progress: <key accomplishments>
   Next: <immediate next steps>

   Current state verified: <branch ok, files exist, etc.>
   ```
5. Flag any divergence: "Note said branch `feature/X` but you're on `main`. Drift, or did you intentionally switch?"
6. Ask the user to confirm or update before continuing.

### Cleanup

After resuming, offer (don't auto-delete):

```
Delete saved context? (y/n)
```

Default: no. Users sometimes want to refer back; deletion is opt-in.

## Edge cases

- **Note from a far-past session** (weeks old): warn the user. The repo has moved; the note may be stale.
- **Branch from note no longer exists** (merged + deleted): mention it, but don't fail — the work is presumably in `main` now.
- **Files referenced no longer exist** (renamed or removed): list them and let the user reconcile.
- **Multiple notes from before the hash convention** (legacy `/tmp/notetoself-*.md`): list them and let the user pick.

## Friction addressed

- The 200-turn chat that ends without anything written to disk.
- "Where was I?" after a `/clear` or a few days away.
- Hand-typed resume briefings that lose nuance every time.

## Anti-patterns

- Saving every five minutes "just in case." The skill is for handoffs, not journaling.
- Writing the note in past tense (`"I did X"`). Use imperative for next steps so the resumer reads them as instructions.
- Including secrets, tokens, or `.env` contents. The file is plaintext in `/tmp`.
- **Committing the note, or advising anyone to.** Session state in version control trampling teammates is the single worst outcome this skill can produce. Durable ≠ shared: gitignore it, or promote its content to a real project artifact.
- Auto-deleting on resume. Manual control; archaeology has value.
- Treating `/notetoself` as a replacement for the project's plan/spec. The note is session-state; durable work-state belongs in `<plan-dir>/` or the spec.

## Relationship to other state

| Persisted thing | Where | Lifetime |
|---|---|---|
| FFFlow config | `.ffflow/config.yaml` | Project lifetime |
| Plan working dir | `<plan-dir>/` | Until captured + archived |
| Audit state | `.ffflow/audit.yaml` | Project lifetime |
| **Session handoff** | `/tmp/notetoself-<hash>.md` | Until you delete it or `/tmp` resets |

Note the split: every row above the last is **project state, shared and committed**; the last row is **personal session state, never committed**. That line is the whole distinction, and it's why the note lives in `/tmp` by default rather than in the tree.

`notetoself` is the *only* state of these scoped to a single session's continuity, not the project's durable record. Don't promote project decisions into the note; promote them into spec, config, or plan. And don't promote the *note itself* into the repo — see "File layout" above.
