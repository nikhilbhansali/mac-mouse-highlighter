# Mac - Mouse Highlighter
<!-- BEGIN claude-autosync -->
## 🔄 GitHub Auto-Sync

This folder is a **private GitHub repository** (`origin`) and is **automatically kept in sync** with GitHub by a Claude Code hook (`~/.claude/hooks/git-autosync.sh`).

- **On every session start and end**, the hook runs: `git add -A` → commit → `git pull --rebase` → `git push`.
- Local and GitHub therefore stay mirrored with no manual steps. Sync activity is logged to `~/.claude/hooks/autosync.log`.

### Guidelines
- **Secrets stay local.** `.env`, `credentials`, `client_secret*.json`, `*.key`, `*.pem` are git-ignored — never force-add them.
- **Large files (>95 MB)** go through **Git LFS**. Run `git lfs track "*.ext"` for new big/media files before committing.
- **Dependencies/junk** (`node_modules/`, `venv/`, `.venv/`, `__pycache__/`, `.DS_Store`) are git-ignored.
- The auto-sync uses rebase and **skips on conflict** rather than forcing — if `autosync.log` reports a conflict, resolve it manually.
<!-- END claude-autosync -->
