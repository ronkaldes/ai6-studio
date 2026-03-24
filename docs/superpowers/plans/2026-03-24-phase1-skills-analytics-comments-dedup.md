# Phase 1: SKILL.md Migration + Analytics + Commenting + Dedup

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate Claude prompts to SKILL.md files, enhance analytics, wire existing comments/votes into the workspace, and add duplicate detection on signal promotion.

**Architecture:** Skill prompts move from TypeScript string exports to markdown files. A new `skill-loader.ts` reads them at runtime and injects Studio Context. Analytics API already exists — we enhance it. Comments/votes Prisma models + API routes already exist — we wire them into the UI. Duplicate detection uses Claude comparison at promotion time.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Prisma 5, Anthropic SDK, Recharts

**Spec:** `docs/superpowers/specs/2026-03-24-studio-evolution-design.md` (Phase 1 section)

**Pre-existing state:**
- `Comment` + `IdeaVote` Prisma models EXIST
- `GET/POST /api/ideas/[id]/comments` route EXISTS and works
- `CommentsThread` component EXISTS and is already rendered in ContextPanel
- `GET /api/analytics` route EXISTS with funnel, avgDaysPerStage, ventureScoreDistribution, conversionRate, sprintSuccessRate
- Analytics page EXISTS at `src/app/(dashboard)/analytics/page.tsx` with FunnelChart, StageTimeChart, ScoreDistribution components
- `StudioAnalytics` TypeScript type EXISTS

---

### Task 1: Create skill-loader.ts and SKILL.md file structure

**Files:**
- Create: `src/lib/skill-loader.ts`
- Create: `skills/trend-scanner/SKILL.md`
- Create: `skills/validator/SKILL.md`
- Create: `skills/validator/market-analyst.md`
- Create: `skills/validator/technical-architect.md`
- Create: `skills/validator/vc-evaluator.md`
- Create: `skills/validator/distribution-strategist.md`
- Create: `skills/validator/customer-advocate.md`
- Create: `skills/validator/red-team.md`
- Create: `skills/opportunity-memo/SKILL.md`
- Create: `skills/boi-tools/SKILL.md`

- [ ] **Step 1: Create `src/lib/skill-loader.ts`**

This module reads SKILL.md files, parses YAML frontmatter, and returns the prompt body. It caches in-memory.

- [ ] **Step 2: Extract trend-scanner prompt to `skills/trend-scanner/SKILL.md`**

Copy the TREND_SCAN_SYSTEM string from `src/lib/skills/trend-scanner.ts` into a SKILL.md file with YAML frontmatter (name, description, version, tools, output_format, trigger). The prompt text becomes the markdown body.

- [ ] **Step 3: Extract validator agent prompts to individual `.md` files**

For each of the 6 agents in `src/lib/skills/validator.ts` AGENT_PROMPTS, create a separate `.md` file under `skills/validator/`. Each file has YAML frontmatter and the prompt text as body. Remove the `${context}` template literal — context will be appended by `assemblePrompt()`.

- [ ] **Step 4: Extract opportunity-memo prompt to `skills/opportunity-memo/SKILL.md`**

- [ ] **Step 5: Extract boi-tools prompts to `skills/boi-tools/SKILL.md`**

Since boi-tools has 7 sub-prompts in one object, put them all in one SKILL.md with section headers (## futureScenarios, ## personas, etc.) and update the loader to support loading specific sections.

- [ ] **Step 6: Refactor `src/lib/skills/trend-scanner.ts` to use skill-loader**

Replace the string export with a function that calls `loadSkill('trend-scanner')`. Keep the export name `TREND_SCAN_SYSTEM` for backward compatibility — make it a function that loads and returns.

- [ ] **Step 7: Refactor `src/lib/skills/validator.ts` to use skill-loader**

Replace AGENT_PROMPTS string values with functions that call `loadSkill('validator/market-analyst')` etc. The existing API route calls these as functions that take context — adjust to use `assemblePrompt()`.

- [ ] **Step 8: Refactor `src/lib/skills/opportunity-memo.ts` to use skill-loader**

- [ ] **Step 9: Verify build and scan still works**

```bash
cd ai6-studio && npm run build
```

- [ ] **Step 10: Commit**

```bash
git add skills/ src/lib/skill-loader.ts src/lib/skills/
git commit -m "feat: migrate Claude prompts to SKILL.md files with skill-loader"
```

---

### Task 2: Add vote API route and VoteButtons to DetailView

**Files:**
- Create: `src/app/api/ideas/[id]/vote/route.ts`
- Create: `src/components/workspace/VoteButtons.tsx`
- Modify: `src/components/workspace/DetailView.tsx`
- Modify: `src/app/(dashboard)/page.tsx`

- [ ] **Step 1: Create vote API route at `src/app/api/ideas/[id]/vote/route.ts`**

POST endpoint: upserts IdeaVote (by ideaId + userName unique constraint). Returns vote summary: `{ upvotes, downvotes, netVotes, userVote }`.

- [ ] **Step 2: Create `src/components/workspace/VoteButtons.tsx`**

Thumbs up/down buttons with net vote count. Uses localStorage `studio_user_name` for voter identity. Calls the vote API on click. Shows active state for the user's current vote.

- [ ] **Step 3: Wire VoteButtons into DetailView header**

Add VoteButtons next to the StageIndicator in the DetailView header for ideas.

- [ ] **Step 4: Verify build, commit**

```bash
git add src/app/api/ideas/\[id\]/vote/ src/components/workspace/VoteButtons.tsx src/components/workspace/DetailView.tsx
git commit -m "feat: add team voting on ideas with thumbs up/down"
```

---

### Task 3: Add duplicate detection at promotion time

**Files:**
- Create: `src/app/api/signals/check-similar/route.ts`
- Modify: `src/app/(dashboard)/page.tsx` (handlePromote)

- [ ] **Step 1: Create `src/app/api/signals/check-similar/route.ts`**

POST endpoint. Body: `{ title, summary }`. Fetches all existing idea titles + first 100 chars of opportunityMemo. Sends to Claude for semantic comparison. Returns `{ similar: boolean, matches: [{ ideaId, title, reason }] }`. Uses `maxDuration = 120`.

- [ ] **Step 2: Add duplicate check to handlePromote in page.tsx**

Before calling PATCH /api/signals to promote, call POST /api/signals/check-similar. If similar, show a window.confirm dialog listing matches. If user confirms or no matches, proceed with promotion.

- [ ] **Step 3: Verify build, commit**

```bash
git add src/app/api/signals/check-similar/ src/app/\(dashboard\)/page.tsx
git commit -m "feat: add duplicate detection on signal promotion via Claude comparison"
```

---

### Task 4: Enhance analytics with scan history and kill rate

**Files:**
- Modify: `src/app/api/analytics/route.ts`
- Modify: `src/app/(dashboard)/analytics/page.tsx`
- Modify: `src/types/index.ts` (update StudioAnalytics type)

The analytics API and page already exist. We enhance them with two additional metrics: scan history (signals grouped by runId over time) and kill rate by category.

- [ ] **Step 1: Add scanHistory and killRateByCategory to the analytics API**

In `src/app/api/analytics/route.ts`, add:
- `scanHistory`: Group TrendSignals by runId, compute count + avg score per run, include createdAt as date
- `killRateByCategory`: Ideas with boardDecision='kill', look up source signal's category via sourceSignalId

- [ ] **Step 2: Update StudioAnalytics type in `src/types/index.ts`**

Add the new fields to the interface.

- [ ] **Step 3: Add charts to the analytics page**

Add a scan history line chart and a kill rate pie chart to the page using Recharts.

- [ ] **Step 4: Verify build, commit**

```bash
git add src/app/api/analytics/route.ts src/app/\(dashboard\)/analytics/page.tsx src/types/index.ts
git commit -m "feat: add scan history and kill rate metrics to analytics dashboard"
```

---

## Summary

| Task | What it does | Files |
|---|---|---|
| 1 | SKILL.md migration — prompts move to markdown, skill-loader reads them | 12+ new files, 4 modified |
| 2 | Vote API + VoteButtons in DetailView | 2 new, 2 modified |
| 3 | Duplicate detection on promotion | 1 new, 1 modified |
| 4 | Enhanced analytics (scan history, kill rate) | 3 modified |

**Note:** Comments are already fully wired (CommentsThread in ContextPanel, API route exists, Prisma model exists). No work needed. The spec's Phase 1C (Inline Commenting) and 1D (Team Voting) are partially done — only voting needs the API route and UI component.
