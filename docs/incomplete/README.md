<!-- personal-config v0.6.0 · 2026-09-29 · config 30fe5a00 · standard v1.2.0 -->
# docs/incomplete: open efforts

This folder holds work that is still open. Each effort gets its own folder, `docs/incomplete/<slug>/`, from the first keystroke. When the effort closes, the folder moves to `~/Projects/archive/swamp-magazine/<slug>/` and gets one line in that archive's `INDEX.md`.

## Stages

| Stage | Artifact | Who decides | Exit condition |
|---|---|---|---|
| 0 · Intake | none | none | You know what tree and what data to read |
| 1 · Ground truth | (feeds 2) | none | Every claim carries a citation, dated |
| 2 · Scope | `SCOPE.md` | agent proposes | Options with defenses; nothing decided |
| **GATE 1** | none | **the owner** | Decisions ratified |
| 3 · Design | `DESIGN.md` | owner decides, agent records | `D1…Dn` frozen, with supersessions |
| 4 · Plan | `PLAN.md` | agent proposes | Phases, lanes, done-when, dials |
| **GATE 2** | none | **the owner** | Plan approved |
| 5 · Build | `PLAN.md` per phase | agent | Gates green; header says BUILT + hash |
| 6 · As-built | `DESIGN.md` amended | agent | Every deviation recorded under its decision |
| 7 · Runtime pass | `RUNTIME-PASS.md` | the owner walks it | Findings folded back |
| 8 · Close-out | archive + index + memory | agent | Folder out of the repo, referrers checked |

The full flow, with what goes in each file and why, is `docs/AGENT-PRACTICES.md`, Part 2.2. Do not ask how it works; it is written down. The archiving checklist is the "Archiving (Profile P)" section of the same file. Its first step is to grep for referrers before anything moves.

Status vocabulary, and no other words (Part 2.3): `SCOPING` · `RATIFIED` · `PLANNED` · `IN FLIGHT` · `BUILT` · `MERGED` · `HELD` · `SUPERSEDED` · `CLOSED`.

A folder may also hold hand-off briefs written for a session or a set of parallel lanes. They add detail and a division of labor, and they defer to `DESIGN.md` and `PLAN.md`, which stay the law.

## What is here

The list below was read from the status lines of each file on 2026-09-30. The file headers are the record. If a header and this list disagree, trust the header.

| Path | What it is | State in its own header |
|---|---|---|
| `foundation/` | Stack, services and v1 shape of the shop. Holds `DESIGN.md`, `PLAN.md`, `RUNTIME-PASS.md` and three hand-off briefs (`mvp-parallel-handoff.md`, `p2-handoff.md`, `p4-handoff.md`). | `DESIGN.md` is RATIFIED (2026-08-22) and has as-built notes through 2026-09-08. In `PLAN.md`, P1 and P2 are BUILT and closed, P3 is code complete with the phase still open, and P4 is closed on W1 to W6 with W7 owed. P5 (launch and drop mechanics) has no BUILT header. |
| `admin-completion/` | Scope for the admin work that follows P4. Holds `SCOPE.md` only. | SCOPING. It waits for P4 to close and for one founder question (`SCOPE.md` §8.9 and §8.10). |
| `direction-a-handoff.md` | Brief for the "Direction A" storefront redesign and the SWAMP WITH ZACH photos. A single file, not a folder. | Marked done, 2026-09-08. |
| `site-footer.md` | Site footer and placeholder pages. A single file, not a folder. | BUILT, 2026-09-21. |

For the shape of the whole project, read `foundation/DESIGN.md` first, then `foundation/PLAN.md`. Code rules are in `docs/conventions-typescript.md`, and the repo rules are in `CLAUDE.md`.
