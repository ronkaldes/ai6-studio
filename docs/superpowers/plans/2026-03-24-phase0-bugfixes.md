# Phase 0: Bug Fixes & Cleanup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all open bugs and cleanup dead code so the codebase is a clean foundation for Phase 1 features.

**Architecture:** The workspace page (`page.tsx`) currently owns all data fetching and state. We extract shared data into a `WorkspaceDataProvider` context so Navigator and DetailView stop fetching independently. Scan loading state then attaches to this provider. The mobile ContextPanel fix is a one-line trigger on an existing overlay.

**Tech Stack:** React 19 context API, Next.js 16 App Router, TypeScript 5, lucide-react icons

**Spec:** `docs/superpowers/specs/2026-03-24-studio-evolution-design.md` (Phase 0 section)

**Pre-existing state discovered during planning:**
- Analytics page + API + chart components ALREADY EXIST at `src/app/(dashboard)/analytics/page.tsx`, `src/app/api/analytics/route.ts`, `src/components/analytics/`
- Comment model + API route + CommentsThread component ALREADY EXIST
- IdeaVote model ALREADY EXISTS in Prisma schema
- Empty route dirs: `trends/`, `pipeline/`, `board/`, `settings/`, `settings/context/` confirmed empty
- Empty component dirs: `components/pipeline/`, `components/layout/` confirmed empty and unused

---

### Task 1: Create WorkspaceDataProvider (fixes double data fetching)

**Files:**
- Create: `src/components/workspace/WorkspaceDataProvider.tsx`
- Modify: `src/app/(dashboard)/page.tsx`

- [ ] **Step 1: Create the provider file**

Create `src/components/workspace/WorkspaceDataProvider.tsx`:

```tsx
'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Idea, TrendSignal } from '@/types'

type ScanState = 'idle' | 'loading' | 'error'

interface WorkspaceData {
  signals: TrendSignal[]
  ideas: Idea[]
  loading: boolean
  error: string | null
  scanState: ScanState
  scanMessage: string | null
  refresh: () => Promise<void>
  triggerScan: () => Promise<void>
}

const WorkspaceDataContext = createContext<WorkspaceData>({
  signals: [],
  ideas: [],
  loading: true,
  error: null,
  scanState: 'idle',
  scanMessage: null,
  refresh: async () => {},
  triggerScan: async () => {},
})

export function useWorkspaceData() {
  return useContext(WorkspaceDataContext)
}

const SCAN_MESSAGES = [
  'Searching GitHub Trending...',
  'Scanning Reddit threads...',
  'Checking Product Hunt...',
  'Reviewing arXiv papers...',
  'Browsing Hacker News...',
  'Scoring signals with Claude...',
  'Generating opportunity cards...',
]

export function WorkspaceDataProvider({ children }: { children: ReactNode }) {
  const [signals, setSignals] = useState<TrendSignal[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [scanMessage, setScanMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [sigRes, ideaRes] = await Promise.all([
        fetch('/api/signals'),
        fetch('/api/ideas'),
      ])
      if (!sigRes.ok || !ideaRes.ok) throw new Error('Failed to fetch data')
      const sigData = await sigRes.json()
      const ideaData = await ideaRes.json()
      setSignals(sigData.signals || [])
      setIdeas(ideaData.ideas || [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch data')
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  const triggerScan = useCallback(async () => {
    setScanState('loading')
    setScanMessage(SCAN_MESSAGES[0])
    let msgIndex = 0
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % SCAN_MESSAGES.length
      setScanMessage(SCAN_MESSAGES[msgIndex])
    }, 5000)

    try {
      const res = await fetch('/api/scan', { method: 'POST' })
      clearInterval(interval)
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Scan failed')
      }
      const data = await res.json()
      setScanState('idle')
      setScanMessage(`Scan complete: ${data.signals_found ?? 0} signals found`)
      // Clear the success message after 5s
      setTimeout(() => setScanMessage(null), 5000)
      await fetchData()
    } catch (e) {
      clearInterval(interval)
      setScanState('error')
      setScanMessage(e instanceof Error ? e.message : 'Scan failed')
    }
  }, [fetchData])

  // Initial fetch
  useEffect(() => {
    setLoading(true)
    fetchData().finally(() => setLoading(false))
  }, [fetchData])

  return (
    <WorkspaceDataContext.Provider value={{
      signals, ideas, loading, error, scanState, scanMessage, refresh, triggerScan,
    }}>
      {children}
    </WorkspaceDataContext.Provider>
  )
}
```

- [ ] **Step 2: Split page.tsx into wrapper + inner component, wire provider**

**CRITICAL:** React context hooks only read from providers **above them in the component tree**. You cannot call `useWorkspaceData()` in the same component that renders `<WorkspaceDataProvider>`. Split the page into two components.

Modify `src/app/(dashboard)/page.tsx`:

**Option A (recommended):** Move the provider to the layout file `src/app/(dashboard)/layout.tsx`:

```tsx
// src/app/(dashboard)/layout.tsx
import { WorkspaceDataProvider } from '@/components/workspace/WorkspaceDataProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceDataProvider>{children}</WorkspaceDataProvider>
}
```

Then in `page.tsx`, just call `useWorkspaceData()` at the top — no wrapping needed.

**In `page.tsx`, make these changes:**

1. Add import: `import { useWorkspaceData } from '@/components/workspace/WorkspaceDataProvider'`
2. Add at top of component body: `const { signals, ideas, loading, scanState, scanMessage, refresh, triggerScan } = useWorkspaceData()`
3. Remove: `allSignals`, `allIdeas`, `loadingData`, `scanning` state declarations (lines 30-35)
4. Remove: `fetchAllData` callback (lines 38-54) and its `useEffect` (line 56)
5. Remove: `handleTriggerScan` function (lines 155-166)
6. Replace `allSignals` → `signals` everywhere (used in: `fetchSelectedItem` line 68, `handleSelectItem` line 96, `renderTabContent` line 199, Navigator props line 229, CommandPalette props line 268)
7. Replace `allIdeas` → `ideas` everywhere (used in: `fetchSelectedItem` line 70, `handleSelectItem` line 96, `renderTabContent` line 197/199, Navigator props line 230, CommandPalette props line 267)
8. Replace `loadingData` → `loading` (used in: Navigator props line 231)
9. Replace `fetchAllData()` calls in `handlePromote` (line 117), `handleArchive` (line 131), `handleSubmitToBoard` (line 148) with `refresh()`
10. Pass `triggerScan` to `CommandPalette` as `onTriggerScan` prop
11. Pass `scanState !== 'idle'` as `scanning` prop to `CommandPalette`
12. The `refreshData` function (line 105) becomes: `const refreshData = () => { refresh() }`

- [ ] **Step 3: Verify the app builds and runs**

```bash
cd ai6-studio && npm run build
```

Expected: Build succeeds. If there are type errors, fix them — the provider types should match what `Navigator` and `CommandPalette` expect.

- [ ] **Step 4: Commit**

```bash
git add src/components/workspace/WorkspaceDataProvider.tsx src/app/\(dashboard\)/page.tsx
git commit -m "refactor: extract WorkspaceDataProvider, fix double data fetching"
```

---

### Task 2: Add scan loading state UI

**Files:**
- Modify: `src/app/(dashboard)/page.tsx` (pass scanMessage down)
- Modify: `src/components/workspace/Navigator.tsx` (show scan banner)

- [ ] **Step 1: Pass scan state to Navigator**

In `page.tsx`, add `scanState`, `scanMessage`, and `onRetryScan` props to the `<Navigator>` component:

```tsx
<Navigator
  ...existingProps
  scanState={scanState}
  scanMessage={scanMessage}
  onRetryScan={triggerScan}
/>
```

Update the `NavigatorProps` interface in `Navigator.tsx` to add:
```tsx
scanState?: 'idle' | 'loading' | 'error'
scanMessage?: string | null
onRetryScan?: () => void
```

Update the function signature to destructure these new props.

- [ ] **Step 2: Show scan banner in Navigator**

In `Navigator.tsx`, add a scan status banner between the search input and the item list (around line 93). Only render when `scanState` is `'loading'` or when `scanMessage` is set:

```tsx
{scanState === 'loading' && scanMessage && (
  <div className="mx-2 my-1 px-3 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-dim)]">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-[var(--accent-highlight)] animate-pulse" />
      <span className="text-[11px] text-[var(--text-secondary)]">{scanMessage}</span>
    </div>
  </div>
)}
{scanState === 'error' && scanMessage && (
  <div className="mx-2 my-1 px-3 py-2 rounded-md bg-red-50 border border-red-200">
    <span className="text-[11px] text-red-600">{scanMessage}</span>
    {onRetryScan && (
      <button onClick={onRetryScan} className="text-[11px] underline text-red-600 ml-1">
        Try again
      </button>
    )}
  </div>
)}
{scanState === 'idle' && scanMessage && (
  <div className="mx-2 my-1 px-3 py-2 rounded-md bg-green-50 border border-green-200">
    <span className="text-[11px] text-green-700">{scanMessage}</span>
  </div>
)}
```

- [ ] **Step 3: Verify scan loading shows in UI**

```bash
cd ai6-studio && npm run dev
```

Open http://localhost:3000, trigger a scan via Cmd+K → "Trigger Scan". Verify rotating messages appear in the Navigator. (The scan will fail without ANTHROPIC_API_KEY — that's fine, the error state should also display.)

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/page.tsx src/components/workspace/Navigator.tsx
git commit -m "feat: add scan loading state with rotating status messages"
```

---

### Task 3: Fix mobile ContextPanel access

**Files:**
- Modify: `src/components/workspace/WorkspaceLayout.tsx`

- [ ] **Step 1: Add the floating action button**

In `WorkspaceLayout.tsx`, the `mobileRightOpen` state exists (line 40) and the overlay renders (lines 88-98), but nothing calls `setMobileRightOpen(true)`.

Add a floating action button inside the main `<div>`, just before the closing `</div>` of the layout (before line 162). Only show on mobile:

```tsx
{/* Mobile FAB for right panel */}
{breakpoint === 'mobile' && !mobileRightOpen && !mobileNavOpen && (
  <button
    onClick={() => setMobileRightOpen(true)}
    className="fixed bottom-5 right-5 z-30 w-12 h-12 rounded-full bg-[var(--accent)] text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
    aria-label="Open context panel"
  >
    <MessageCircle size={20} />
  </button>
)}
```

Add `MessageCircle` to the lucide-react import at the top (line 4):
```tsx
import { Menu, PanelRight, MessageCircle } from 'lucide-react'
```

- [ ] **Step 2: Verify on mobile viewport**

```bash
cd ai6-studio && npm run dev
```

Open Chrome DevTools, toggle device toolbar to mobile (375px). Verify the floating button appears bottom-right. Tap it → right panel slides in. Tap backdrop → panel closes. Verify the FAB does not appear when the nav overlay or right overlay is already open.

- [ ] **Step 3: Commit**

```bash
git add src/components/workspace/WorkspaceLayout.tsx
git commit -m "fix: add mobile FAB to trigger ContextPanel slide-over"
```

---

### Task 4: Dead code cleanup

**Files:**
- Delete: `src/app/(dashboard)/trends/` (empty directory)
- Delete: `src/app/(dashboard)/pipeline/` (empty directory)
- Delete: `src/app/(dashboard)/board/` (empty directory)
- Delete: `src/app/(dashboard)/settings/` (empty directory tree)
- Delete: `src/components/pipeline/` (empty directory)
- Delete: `src/components/layout/` (empty directory)
- Keep: `src/components/validate/` (imported by workspace tabs)
- Keep: `src/components/analytics/` (imported by analytics page)
- Keep: `src/components/tools/` (imported by ContextPanel)

- [ ] **Step 1: Delete empty directories**

```bash
cd ai6-studio
rm -rf src/app/\(dashboard\)/trends
rm -rf src/app/\(dashboard\)/pipeline
rm -rf src/app/\(dashboard\)/board
rm -rf src/app/\(dashboard\)/settings
rm -rf src/components/pipeline
rm -rf src/components/layout
```

- [ ] **Step 2: Verify build still passes**

```bash
cd ai6-studio && npm run build
```

Expected: Build succeeds. If any import errors appear, it means something was referencing a deleted path — investigate and fix.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove empty route directories and unused component directories"
```

---

### Task 5: Fix Submit to Board gating

**Files:**
- Modify: `src/components/workspace/DetailView.tsx:80`

- [ ] **Step 1: Change the condition**

In `DetailView.tsx`, line 80 currently reads:
```tsx
{isIdea && (item as Idea).stage === 'validating' && onSubmitToBoard && (
```

Replace with:
```tsx
{isIdea && onSubmitToBoard && (item as Idea).dvfScores && (item as Idea).dvfScores!.length > 0 && (item as Idea).opportunityMemo && (item as Idea).stage !== 'decision_gate' && (item as Idea).stage !== 'graduated' && (
```

Also remove `ml-auto` from this button's className (line 83) since the `StageIndicator` on line 55 already has `className="ml-auto"` which pushes everything right. The button should not also use `ml-auto`.

Change `"ml-auto text-[12px]..."` to `"text-[12px]..."` on the button.

This shows the button when:
- DVF scores exist (validation scoring complete)
- Opportunity memo exists (step 2 complete)
- The idea isn't already at decision_gate or graduated

- [ ] **Step 2: Verify the button appears for validated ideas**

Open the app, select an idea that has completed validation (has dvfScores and opportunityMemo). The "Submit to Board" button should appear regardless of whether the stage is exactly 'validating'.

- [ ] **Step 3: Commit**

```bash
git add src/components/workspace/DetailView.tsx
git commit -m "fix: show Submit to Board when validation is complete, not just 'validating' stage"
```

---

### Task 6: Activity feed in ContextPanel

**Files:**
- Modify: `src/components/workspace/ContextPanel.tsx:81-93`

- [ ] **Step 1: Replace static activity text with computed events**

In `ContextPanel.tsx`, replace the Activity Feed section (lines 81-93) with:

```tsx
{/* Activity Feed */}
<div className="px-3 py-3 border-t panel-border shrink-0">
  <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
    Activity
  </div>
  <div className="text-[10px] text-[var(--text-muted)] space-y-1 leading-relaxed">
    {computeActivityEvents(item, isIdea).map((event, i) => (
      <div key={i} className="flex items-start gap-1.5">
        <span className="text-[var(--text-muted)] mt-0.5">·</span>
        <span>{event}</span>
      </div>
    ))}
  </div>
</div>
```

Add this function at the bottom of the file:

```tsx
function computeActivityEvents(item: Idea | TrendSignal | null, isIdea: boolean): string[] {
  if (!item) return ['No item selected']
  if (!isIdea) return ['Signal discovered']

  const idea = item as Idea
  const events: string[] = []

  if (idea.boardDecision) {
    const color = { go: '✓', conditional: '~', pivot: '↻', kill: '✕' }[idea.boardDecision] || ''
    events.push(`Board decision: ${color} ${idea.boardDecision}`)
  }
  if (idea.ventureScore != null) events.push(`Venture score: ${idea.ventureScore}/100`)
  if (idea.dvfScores && idea.dvfScores.length > 0) events.push('DVF scoring complete')
  if (idea.opportunityMemo) events.push('Opportunity memo generated')
  if (idea.sourceSignalId) events.push('Promoted from signal')
  events.push(`Day ${idea.daysInStage} in ${idea.stage.replace('_', ' ')}`)

  return events
}
```

- [ ] **Step 2: Verify events render correctly**

Open the app, select an idea. The Activity section in the right panel should show computed events based on the idea's state, not just static text.

- [ ] **Step 3: Commit**

```bash
git add src/components/workspace/ContextPanel.tsx
git commit -m "feat: compute activity feed from idea state instead of static text"
```

---

### Task 7: Archive view verdict labels

**Files:**
- Modify: `src/components/workspace/IdeaListItem.tsx`

- [ ] **Step 1: Add verdict badge to archived ideas**

In `IdeaListItem.tsx`, after the `ScorePill` block (after line 45's closing `)}`, before the `</div>` at line 46), add a verdict badge for ideas with a `boardDecision`:

```tsx
{!isSignal && (item as Idea).boardDecision && (
  <span
    className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ml-1.5"
    style={{
      color: verdictColor((item as Idea).boardDecision!),
      backgroundColor: `${verdictColor((item as Idea).boardDecision!)}15`,
    }}
  >
    {(item as Idea).boardDecision}
  </span>
)}
```

Note: Uses `ml-1.5` not `ml-auto` because the `ScorePill` already has `ml-auto` (line 44). The verdict badge sits to the right of the score pill with a small gap.

Add the color helper after the component function, at the bottom of the file:

```tsx
function verdictColor(verdict: string): string {
  switch (verdict) {
    case 'go': return '#22C55E'
    case 'conditional': return '#F59E0B'
    case 'pivot': return '#6366F1'
    case 'kill': return '#EF4444'
    default: return '#999999'
  }
}
```

- [ ] **Step 2: Verify badges show in Archive tab**

Navigate to Archive tab. Ideas with board decisions should show colored verdict badges (green for go, red for kill, etc.).

- [ ] **Step 3: Commit**

```bash
git add src/components/workspace/IdeaListItem.tsx
git commit -m "feat: show verdict badge on archived ideas in Navigator"
```

---

### Task 8: Update progress.md and close CLAUDE.md item

**Files:**
- Modify: `progress.md` (at repo root)
- Modify: `task_plan.md` (at repo root)

- [ ] **Step 1: Update progress.md**

Replace the contents of `progress.md` (repo root) with:

```markdown
# System Operation Log

- **Phase 1: Initialization.** Extracted data schemas, Prisma definitions, and application specs.
- **Phase 2: Core Pipeline.** Built Next.js scaffold, Prisma + PostgreSQL, Claude API integration, all API routes (scan, signals, validate, board, ideas, context, analytics), auth middleware.
- **Phase 3: Workspace Redesign (2026-03-24).** Three-panel layout, light monochrome theme, mobile/tablet responsive, unified `/` route, command palette, AI chat, voting card, comments thread, analytics page.
- **Phase 0: Bug Fixes (2026-03-24).** WorkspaceDataProvider, scan loading state, mobile ContextPanel, dead code cleanup, board gating fix, activity feed, archive labels.
```

- [ ] **Step 2: Mark CLAUDE.md item as done in task_plan.md**

In `task_plan.md`, change the CLAUDE.md line from `- [ ]` to `- [x]`:
```
- [x] **CLAUDE.md stale constraint** — Verified 2026-03-24: root claude.md is accurate. Closed.
```

- [ ] **Step 3: Commit**

```bash
git add progress.md task_plan.md
git commit -m "docs: update progress.md and close CLAUDE.md task"
```

---

## Summary

| Task | Files | What it fixes |
|---|---|---|
| 1 | Create `WorkspaceDataProvider.tsx`, modify `page.tsx` | Double data fetching |
| 2 | Modify `page.tsx`, `Navigator.tsx` | Scan loading state |
| 3 | Modify `WorkspaceLayout.tsx` | Mobile ContextPanel access |
| 4 | Delete 6 empty directories | Dead code |
| 5 | Modify `DetailView.tsx` | Submit to Board gating |
| 6 | Modify `ContextPanel.tsx` | Static activity feed |
| 7 | Modify `IdeaListItem.tsx` | Archive verdict labels |
| 8 | Modify `progress.md`, `task_plan.md` | Stale docs |

**After Phase 0:** All open bugs from `task_plan.md` are resolved. The codebase has a clean data provider pattern. Ready for Phase 1 (SKILL.md migration + new features).
