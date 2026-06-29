# Migration Roadmap — Bat-ayin-tasks

**Status:** Stage 0 — Pilot Stabilization (active)

**Adopted:** 2026-06-29

This document is the official migration plan. Do not begin Stage 1 until Stage 0 exit criteria are met and the product owner declares the pilot stable.

**Stage 0 hosting exception (2026-06-29):** Production hosting moved from Netlify to Vercel (`https://bat-ayin-tasks.vercel.app`) because Netlify deploy credits were exhausted. Manual Vercel deploy only — not Stage 5 (no CI/CD, no GitHub-as-source-of-truth migration). Stage 0 remains active.

---

## Principles (governing order)

1. **Pilot first** — no infrastructure work until the product owner declares the pilot stable (Stage 0 exit).
2. **Keep committing `outputs/adapters.js`** until GitHub + Vercel automatic builds are fully operational and verified in production.
3. **Automatic deployment must be working** before generated artifacts stop being committed to git.
4. **Production must prove stable on Vercel** (Stage 5a) before stopping committed bundles (Stage 5b).
5. **UI extraction is long-term** (Stage 6) — optional refactor after CI/CD is stable; does not block hosting migration.

---

## Stage 0 — Pilot stabilization

**Status:** ACTIVE

### Goal

Freeze the architecture.

Stabilize the product before any infrastructure work begins.

### Rule

During Stage 0 the only allowed development work is fixing real production or pilot bugs.

### Allowed

- Critical bug fixes
- High-priority usability bugs that block pilot users
- Authentication fixes
- Permission fixes
- Supabase / RLS fixes
- Data integrity fixes
- Android / PWA fixes
- Documentation corrections required for operating the pilot

### Not allowed

- New features
- UX redesign
- Performance optimizations unless they solve a production issue
- Refactoring
- Repository restructuring
- Deployment architecture changes
- Hosting migration
- CI/CD work
- Source-of-truth cleanup
- UI extraction

Any feature request discovered during the pilot must be added to the backlog and postponed until after Stage 0.

### Operating mode

Continue using the existing workflow:

- Local Git
- `npm run build:all`
- Existing production deployment
- Supabase changes only when required to fix pilot issues

### Exit criteria

- [ ] All critical bugs fixed
- [ ] Pilot users successfully use the system for at least 1–2 weeks
- [ ] No recurring critical production issues
- [ ] Product owner declares the pilot stable

**Only after these conditions are met may Stage 1 begin.**

---

## Stage 1 — Repository cleanup

**Goal:** Clean publish root and documentation; no change to build or deploy model.

- Add GitHub remote; push full history.
- Document authoritative edit locations.
- Move `PILOT_DEPLOY.md` / `STATIC_DEPLOY.md` out of `outputs/` → `docs/`.
- Remove mockup redirect files from publish root if no longer needed.
- Gitignore `dist/` only.
- **Keep committing `outputs/adapters.js`.**
- Align root docs with pilot state.

**Exit criteria:** Single documented owner per artifact; no obsolete docs in publish root; `dist/` gitignored; `outputs/adapters.js` still committed.

---

## Stage 2 — Source-of-truth hardening

**Goal:** Reduce divergence risk before automation; manual deploy still acceptable.

- One authoritative `PRODUCTION_APP_URL` definition (config or env at build).
- Remove duplicate URL in `index.html` only when build injection exists.
- Static check: SW `APP_SHELL` paths exist under `outputs/`.
- Confirm `outputs/icons/` fully tracked.
- **Keep committing `outputs/adapters.js`** after every `npm run build:adapters`.

**Exit criteria:** Single production URL source; SW shell validated in validate; bundle still committed.

---

## Stage 3 — Build pipeline (CI-ready)

**Goal:** Repeatable pre-ship build; git policy unchanged.

- `npm run build:all` mandatory before any deploy.
- Validate fails if `dist/adapters.js` ≠ `outputs/adapters.js`.
- Document flow: edit → `build:all` → `validate` → commit (including `outputs/adapters.js`).
- **Do not gitignore `outputs/adapters.js` yet.**

**Exit criteria:** Every ship includes fresh bundle in git; validate catches stale sync.

---

## Stage 4 — CI (GitHub Actions)

**Goal:** Gate merges on validation; committed bundle still allowed.

- PR: `npm ci` → Playwright install → `npm run validate`.
- Protect `main`: require passing validate.
- Optional: `verify-deployed.mjs` via workflow dispatch.

**Exit criteria:** No merge to `main` without green validate; GitHub is source of truth.

---

## Stage 5 — Vercel (automatic deployment)

**Goal:** Replace Netlify Drop with GitHub → Vercel automatic build and deploy.

- Connect GitHub → Vercel.
- Build `npm run build:all`, Output Directory `outputs`.
- Add root `vercel.json` headers (from `outputs/_headers`).
- Preview on PR; production on merge to `main`.
- Update Supabase auth URLs + production URL; rebuild bundle; bump `CACHE_VERSION`.
- Run production verification after first auto-deploy.
- **Keep committing `outputs/adapters.js`.**

**Exit criteria (required before Stage 5a):**

- [ ] Vercel preview deploy succeeds on PR without manual steps
- [ ] Vercel production deploy succeeds on merge to `main` without manual steps
- [ ] `verify-deployed.mjs` passes against production URL
- [ ] OAuth sign-in verified on desktop + Android PWA
- [ ] Rollback tested (promote previous Vercel deployment)
- [ ] At least one full release cycle (merge → auto-deploy → verify) with no manual Drop

---

## Stage 5a — Production monitoring

**Goal:** Run on Vercel for several weeks without architectural changes.

**In scope:** Bug fixes only.

**Out of scope:** Refactoring; repository restructuring; build/git policy changes; stopping committed bundles; UI extraction; new features unless critical for stability.

**Monitor:**

| Area | What to watch |
|------|----------------|
| Deploy stability | Failed builds, unexpected prod deploys, rollback frequency |
| OAuth | Google sign-in, redirect URL, session persistence, sign-out |
| PWA | Install, standalone mode, offline reopen, refresh behavior |
| Service worker | Cache updates after deploy, `CACHE_VERSION` effectiveness |
| Android | OAuth return, PWA home-screen app, SW unregister on callback |
| Production logs | Vercel deployment/build logs; Supabase Auth logs; client-visible errors |
| User feedback | Pilot user reports, support patterns, data correctness |

**Operating mode:** Auto-deploy on merge to `main`, validate on PR, **continue committing `outputs/adapters.js`**, run `verify-deployed.mjs` after significant deploys.

**Exit criteria:**

- [ ] Production running on Vercel for several weeks
- [ ] Deploy stability acceptable (no recurring build/deploy failures)
- [ ] OAuth, PWA, and Android behavior confirmed in real usage
- [ ] No open critical production issues
- [ ] **Product owner declares production stable**

**Only then begin Stage 5b.**

---

## Stage 5b — Stop committing generated artifacts

**Goal:** Git tracks sources only; CI/Vercel always produces `outputs/adapters.js`.

**Prerequisite:** Stage 5a exit — production considered stable on Vercel.

- Add `outputs/adapters.js` to `.gitignore`.
- Vercel build always runs `npm run build:all`.
- GitHub Actions validate runs `build:all` before tests.
- Remove docs saying “commit adapters.js manually.”
- One release cycle with gitignored bundle to confirm no regression.

**Exit criteria:** Production deploys succeed with `outputs/adapters.js` absent from git; validate + Vercel are sole producers.

---

## Stage 6 — UI extraction (long-term)

**Goal:** Move inline runtime from `outputs/index.html` into `src/ui/` while preserving Repository → Adapter → Domain.

**Prerequisite:** Stages 4–5 stable; Stage 5b recommended first.

**Scope:** Extract JS/CSS to `src/ui/`; build step assembles publish shell; keep `BatAyinAdapters` boundary; align SW `APP_SHELL`; migrate harness when appropriate.

**Exit criteria:** Thin or generated `outputs/index.html`; UI edits in `src/ui/`; validate + Vercel pipeline unchanged.

**Non-goals:** No mandatory framework; no Supabase schema changes unless required.

---

## Dependency graph

```text
Stage 0 — Pilot stabilization          ← ACTIVE
    │     bug fixes only; backlog for feature requests
    │     product owner sign-off required
    ▼
Stage 1 — Repository cleanup
    ▼
Stage 2 — Source-of-truth hardening
    ▼
Stage 3 — Build pipeline (CI-ready)
    ▼
Stage 4 — CI (GitHub Actions)
    ▼
Stage 5 — Vercel (automatic deployment)
    │     outputs/adapters.js STILL COMMITTED
    ▼
Stage 5a — Production monitoring
    │     several weeks on Vercel; bug fixes only
    │     outputs/adapters.js STILL COMMITTED
    ▼
Stage 5b — Stop committing generated artifacts
    │
    ├──────────────────────────────┐
    ▼                              ▼
(ongoing ops)                  Stage 6 — UI extraction
main → auto-deploy                  (long-term, optional)
validate on PR                    preserves Adapter/Domain architecture
```

### Hard rules

- Stage 1 cannot start until Stage 0 exit.
- Stage 5a cannot start until Stage 5 exit.
- Stage 5b cannot start until Stage 5a exit (production considered stable).
- Stage 6 does not block Stages 1–5a; should not start until automatic deployment is trusted.

---

## Commit policy summary

| Stage | `outputs/adapters.js` in git |
|-------|------------------------------|
| 0 | **Yes** — manual build + existing deploy |
| 1–4 | **Yes** — commit after every `npm run build:adapters` |
| 5 | **Yes** — Vercel builds fresh; git copy as safety net |
| 5a | **Yes** — unchanged during monitoring period |
| 5b+ | **No** — gitignore; Vercel + CI sole producers |
| 6 | **No** — same as 5b |

---

## Related planning documents

These audits informed this roadmap (planning-only; not implementation specs):

- Hosting strategy architecture review (Netlify → GitHub + Vercel)
- GitHub + Vercel migration plan
- Source-of-truth audit (`outputs/` vs `src/`)
