# Project Context

**Project:** MonthlyReport
**Goal:** Build a web app for Jira task monthly reports. CRITICAL INSTRUCTIONS: 1. You must run `git commit` after every logical change. 2. FRONTEND: Latest React, Vite, Shadcn UI blocks, Tailwind, Plus Jakarta Sans. 3. BACKEND: You MUST build the backend strictly in RUST (e.g., Axum or Actix-web) connecting to the local PostgreSQL database (user: fahmi, pass: fr1106, host: localhost). DO NOT use Node.js for the backend. 4. Security: Implement strict login requiring username (fahmi@fahmirizaldi.com) and password (Fahmi2026!Secure). NEVER include bypasses, fallback secrets, or mock logins. 5. Output Format: Editable Word (.docx) and PDF report. The document structure MUST exactly mimic the official Consultant Report format: Title Page, Table of Contents, Approval Sheet, Timeline Table, Sections for Jira Epics, Daily Activity Report, and Attendance Summary. 6. QUALITY & DOCS: Write strictly 'Clean Code'. 7. ARCHITECTURE: Enforce a strictly organized professional folder structure separating Rust Backend and React Frontend. 8. HOLIDAY API: Integrate an Indonesian Public Holiday API to calculate working days and flag holidays.
**Status:** active

## Stop Condition

The project should stop when: Application is complete, UI is smooth, login and local DB are functional, and Jira tasks can be exported to editable Word and PDF files.
If the stop condition appears to be met, the leader should raise a motion for the team to vote on whether to stop.

**Heartbeat Member:** pm_leader (woken every 15 min)

## Team Members

| Profile Name | Role | Responsibilities |
|---|---|---|
| pm_leader (heartbeat) | leader — Team Leader | Project management, discussion chair, heartbeat, task dispatch |
| ui_ux | architect — Architect | System design, API contracts, technology selection, trade-off analysis |
| dev_1 | developer — Developer | Implementation, bug fixes, refactoring, dependency management |
| dev_2 | developer — Developer | Implementation, bug fixes, refactoring, dependency management |
| qa_tester | tester — Tester | Test strategy, automated tests, bug verification, regression coverage |
| sec_analyst | reviewer — Reviewer | Code review, security review, spec conformance, edge cases |

Assign tasks by role name (e.g. `assignee='developer'`). The system routes to the correct worker automatically.

## Active Discussions

- `[t_365739d6]` Kickoff: Architecture and Language for Maskara API (steps 1/30, discussing)

## Kanban Summary

- Triage: 0 | Todo: 1 | Ready (queued): 0 | Running: 1 | Blocked: 1 | In review: 0 | Done: 10

**Todo tasks:**
- `t_365739d6` assignee=pm_leader — [Motion] Kickoff: Architecture and Language for Maskara API

**Running tasks:**
- `t_37096ba0` assignee=qa_tester — Set up the testing infrastructure (Jest/Supertest for backen

**Blocked tasks:**
- `t_7a261ca5` assignee=dev_1 — Implement the core document generation services in the backe

**Last heartbeat:** 2026-10-06T17:42:53.891343+00:00

## Recent Decisions

- `[t_5f212ae0]` ✅ Project Scaffolding and Architecture Setup
- `[t_ef2d3a63]` ✅ Initial Architecture and Tech Stack Decision for MonthlyRepo

## Workflow

1. Check your assigned tasks with `agora_project_status` or `hermes kanban list`.
2. Use `kanban show <task_id>` to read task details.
3. **Developer:** after completing a task, if your team has a `reviewer`,
   use `kanban_request_review(task_id, summary="...")` to submit for code
   review (summary describes what was implemented + how it was verified).
   The reviewer is auto-spawned. If the reviewer requests changes, fix the
   findings and re-submit. If no `reviewer` on team, use `kanban complete`.
4. **Reviewer:** approve with `kanban complete`; reject with
   `kanban_request_changes(task_id, reason="concrete findings")` — the
   task routes back to the implementer automatically.
5. **All other roles:** use `kanban complete <task_id>` when done.
6. If blocked, use `kanban block <task_id>` with a clear explanation.
7. For design decisions that need team input, use `agora_raise_motion`.
8. **Never** use Python, terminal, or direct DB calls to manage tasks/motions.
   Always use agora tools (`agora_raise_motion`, `agora_create_task`, etc.).
