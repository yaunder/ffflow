# Changelog

All notable changes to FFFlow. Versions track `plugin/.claude-plugin/plugin.json`.

This file is for humans. Its machine-readable sibling — [`plugin/docs/migrations.md`](plugin/docs/migrations.md) — is what `/fff:upgrade-ffflow` actually reads: same releases, but each entry carries a detection heuristic and a remediation for repo-affecting changes. **When a release changes what a project's files should look like, it needs an entry in both.**

The format is loosely [Keep a Changelog](https://keepachangelog.com/); versioning is [semver as defined in the root `CLAUDE.md`](CLAUDE.md#how-we-version).

---

## [0.4.0] — 2026-08-23

### Added
- **Invariant §2.10 — Hierarchical CLAUDE.md is how the codebase explains itself.** Promotes per-module CLAUDE.md from an audit-cartridge coverage rule to a professed, first-class FFFlow belief. Explains the mechanism (proximity loading is the only context-routing that fires before the model chooses what to read) and the four consequences: locality beats volume, root stays a map, freshness becomes scopeable, and it's the spec's habitat at L0/L1.
- **Invariant §2.11 — Beliefs are stamped into the project, not just professed by the plugin.** A downstream session reads *that project's* CLAUDE.md, never the plugin's design docs. Beliefs now ship into the repo as a managed, versioned marker block.
- **`/fff:upgrade-ffflow`** — new skill. Reconciles a project against the current plugin version: reads the stamp, walks the migration ledger, duck-types unstamped repos, applies remediations with per-entry confirmation, re-stamps.
- **`ffflow_version` / `ffflow_upgraded`** in `.ffflow/config.yaml` — records which plugin version a repo was last reconciled against, distinct from the config's own schema `version`.
- **`plugin/docs/migrations.md`** — the migration ledger. Per-version, repo-affecting changes with detection heuristics and remediations.
- **`CHANGELOG.md`** — this file.
- **Managed beliefs block** written by `init-ffflow` into the project's root CLAUDE.md, delimited by `<!-- ffflow:beliefs ... -->` markers and refreshed by `upgrade-ffflow`.

### Changed
- `init-ffflow` now writes the beliefs block and the version stamp in addition to `.ffflow/config.yaml`. This is a deliberate narrowing of its long-standing "don't write project-level files outside `.ffflow/config.yaml`" anti-pattern — the beliefs block is the one exception, and it's confined to a marker-delimited region.
- `work-issue` gains a module-CLAUDE.md step: creating a new module means creating its CLAUDE.md in the same PR, the same way a behavior change ships its spec update.
- `stack-init` seeds CLAUDE.md for scaffolding directories it creates.
- The `claude-md` audit cartridge's root template now names hierarchical CLAUDE.md in its Conventions block, so the convention propagates into every generated root file.

### Fixed
- **`notetoself` no longer advises committing session notes.** The skill told users to copy notes into `.ffflow/notes/` for durability past `/tmp` cleanup, while its own state table two sections later classified the note as the one piece of state scoped to a single session rather than the project. On any team past one developer the advice is actively harmful: the working-directory hash that prevents *project* collisions guarantees *person* collisions once the file is shared, producing overwrites, merge conflicts in a file nobody meant to co-author, and stale notes that read to a teammate as project truth. Durability is now answered by gitignoring, not committing. Reported by a user who got bitten by it.
- **`/fff:autopilot --decision-log` carries the same warning.** Writing a per-session decision log to a repo path had the identical trampling failure mode with no gitignore guidance.
- New migration entry `uncommit-session-notes` untracks (never deletes) already-committed notes and logs, after confirmation, offering to promote genuinely project-level content first.

### Notes
- **Backward compatible.** A repo with no `ffflow_version` still works exactly as before; it duck-types on first `/fff:upgrade-ffflow` run.

---

## [0.3.0] — 2026-08

### Added
- **Invariant §2.9 — View-layer purity**, the frontend sibling of hexagonal: the component layer is the frontend's domain, dependencies point view ← app, decompose → story → test → *then* integrate.
- `component-driven-ui` rulebook skill.
- `typescript-ui` stack cartridge (Storybook + design tokens + component triple scaffolding), with a `ui_baseline` lane of `react` or `web-components`.
- `/audit --type ui` gate.
- `adopt-ffflow --ui` for retrofitting view-layer purity onto an already-adopted project.

---

## [0.2.3] — 2026-08

### Fixed
- Four `/fff:refactor` confusion points surfaced by a real run.

---

## [0.2.2] — 2026-08

### Changed
- Audit refactor cartridge defers tool commands to the stack cartridge rather than hardcoding them.

### Added
- Rust and polyglot support in the refactor cartridge.

---

## [0.2.1] — 2026-08

### Changed
- Justfile cartridges split into per-language files.

### Added
- Rust justfile cartridge.

---

## [0.2.0] — 2026-08

### Fixed
- **specdrive is language-agnostic** — npm is its install channel, not a language constraint. Unlocked L3 for Python, Java, and Rust; all stacks now declare `max_level: L3`. (#1)

---

## [0.1.0] — 2026-08

### Added
- Initial release: plan / work / audit lifecycle, the L0–L3 dial, stack cartridges for TypeScript / Python / Java, capture backends for GitHub Issues / Linear / Jira / markdown.
- Apache 2.0 license.
