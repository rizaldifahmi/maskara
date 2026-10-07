# rust-api-deprecated (attic)

This directory is a frozen archive of the former Rust/Axum backend that previously
lived at `backend/` (before the team unified on Node/Express+Prisma+SQLite).

Archived on: 2026-10-07 (see Agora motion t_b2ed62a8 — "Unify backend on Node,
archive rust-api/").

This code is NOT part of the active workspace. It is kept for reference only:
- It is excluded from pnpm-workspace (no pnpm-workspace.yaml entry)
- It is excluded from CI (no Cargo build/test steps)
- Do NOT build, test, or depend on it

## Contents
- `Cargo.toml`, `Cargo.lock` — original manifest + lock
- `src/*.rs` — axum routes, docx/pdf generators, models, templates
- `templates/report_template.docx` — Word template the Rust code used
- `.gitignore` — original (was scoped to backend/; now vestigial)
