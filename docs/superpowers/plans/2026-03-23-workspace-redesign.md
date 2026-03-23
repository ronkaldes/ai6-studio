# Workspace Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current 5-page sidebar layout with a three-panel workspace (Navigator, Detail, Context) inspired by Linear/Superhuman, with a monochrome design system.

**Architecture:** Three-panel client-side layout rendered within the existing `(dashboard)` route group. The Navigator panel replaces the sidebar and page-per-module pattern. Center panel uses tabs instead of the validation wizard. Right panel provides contextual AI chat, activity, and voting. All data flows through existing API routes — no backend changes except expanding board verdict routing.

**Tech Stack:** Next.js 16 App Router, React 19, TailwindCSS 4, shadcn/ui, Framer Motion, Prisma/PostgreSQL, Anthropic SDK

**Spec:** `docs/superpowers/specs/2026-03-23-workspace-redesign-design.md`

**Important — Next.js 16:** This project uses Next.js 16 which has breaking changes from earlier versions. Before writing any code, read the relevant guide in `node_modules/next/dist/docs/` to check for API changes. Heed deprecation notices.

**Note on testing:** This codebase has no test infrastructure. Tasks focus on build verification (`npm run build`) and visual verification. Each task ends with a build check to catch type errors and broken imports.

---

## File Structure

### Files to Create

```
src/components/workspace/
├── WorkspaceLayout.tsx      # Three-panel shell with collapse/resize
├── Navigator.tsx            # Left panel: views, search, grouped idea list
├── IdeaListItem.tsx         # Compact list row for navigator
├── DetailView.tsx           # Center panel: header + tab bar + content
├── TabBar.tsx               # Horizontal tab navigation
├── ContextPanel.tsx         # Right panel: contextual AI/activity/voting
├── AIChatThread.tsx         # Conversational AI interface
├── VotingCard.tsx           # Inline verdict voting widget
├── StageIndicator.tsx       # Day counter with urgency color shifts
├── CommandPalette.tsx       # Cmd+K quick navigation
├── SkeletonLoader.tsx       # Shimmer loading placeholder

src/components/workspace/tabs/
├── OverviewTab.tsx          # Problem statement + opportunity memo
├── ScoringTab.tsx           # DVF scores as editable inline cards
├── AssumptionsTab.tsx       # 2x2 matrix (adapted from existing)
├── ExperimentsTab.tsx       # Experiment cards (adapted from existing)
├── BoardBriefTab.tsx        # Read-only summary + voting results
```

### Files to Modify

```
src/app/globals.css                          # New monochrome color palette
src/app/(dashboard)/layout.tsx               # Replace sidebar+topbar with WorkspaceLayout
src/app/(dashboard)/page.tsx                 # Workspace entry point (no redirect)
src/app/api/board/route.ts                   # Expand verdict routing (4 outcomes)
src/app/api/ideas/[id]/route.ts              # Add dvfScores to PATCH handler
src/components/ui/ScorePill.tsx              # Monochrome base styling
src/components/ui/VentureMeter.tsx           # Radar chart → horizontal bars
src/components/ui/SourceBadge.tsx            # Reduce size
```

### Files to Remove (Task 12 — after everything works)

```
src/components/layout/Sidebar.tsx
src/components/layout/TopBar.tsx
src/components/trends/SignalGrid.tsx
src/components/trends/SignalCard.tsx
src/components/trends/FilterBar.tsx
src/components/trends/ScanButton.tsx
src/components/pipeline/KanbanBoard.tsx
src/components/pipeline/KanbanColumn.tsx
src/components/pipeline/IdeaCard.tsx
src/components/validate/ValidationStepper.tsx
src/components/validate/ProblemRefinement.tsx
src/components/validate/OpportunityMemo.tsx
src/components/validate/AgentPanel.tsx
src/components/validate/BoardSubmission.tsx
src/components/board/BoardDashboard.tsx
src/components/board/ReviewSession.tsx
src/app/(dashboard)/trends/page.tsx
src/app/(dashboard)/pipeline/page.tsx
src/app/(dashboard)/validate/[id]/page.tsx
src/app/(dashboard)/board/page.tsx
src/app/(dashboard)/settings/context/page.tsx
```

### Files to Keep Unchanged

```
src/app/api/*                    # All API routes (except board)
src/app/login/page.tsx           # Auth flow unchanged
src/lib/*                        # All lib files unchanged
src/types/index.ts               # Types unchanged
src/components/ui/badge.tsx      # shadcn primitives unchanged
src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/dialog.tsx
src/components/ui/input.tsx
src/components/ui/progress.tsx
src/components/ui/select.tsx
src/components/ui/separator.tsx
src/components/ui/sheet.tsx
src/components/ui/slider.tsx
src/components/ui/tabs.tsx
src/components/ui/textarea.tsx
src/components/trends/OpportunityCard.tsx    # Reused in OverviewTab
src/components/validate/AssumptionMap.tsx    # Reused in AssumptionsTab
src/components/validate/ExperimentCards.tsx  # Reused in ExperimentsTab
src/components/board/VotingInterface.tsx     # Adapted into VotingCard
src/components/board/DecisionLog.tsx         # Reused in BoardBriefTab
src/components/settings/ContextEditor.tsx    # Reused in settings view
prisma/schema.prisma                         # No schema changes
```

---

## Task 1: Update Design System (globals.css)

**Files:**
- Modify: `src/app/globals.css`

This is the foundation — every subsequent task depends on these CSS variables.

- [ ] **Step 1: Update color palette to monochrome**

Replace the navy-based palette with neutral monochrome values in `src/app/globals.css`. Update these CSS custom properties:

```css
/* Replace existing color values in @theme section */
--bg-base:       #0A0A0A;    /* was #0A0F1C */
--bg-surface:    #141414;    /* was #111827 */
--bg-elevated:   #1C1C1C;    /* was #1A2235 */
--bg-subtle:     #181818;    /* was #1E293B */
--border-dim:    #1E1E1E;    /* was #1F2D45 */
--border-base:   #262626;    /* was #2D3F5A */
--border-active: #EBEBEB;    /* was #3B82F6 */
--accent:        #EBEBEB;    /* was #3B82F6 — white as primary action */
--accent-dim:    #888888;    /* was #1D4ED8 */
--accent-glow:   rgba(235,235,235,0.08); /* was rgba(59,130,246,0.15) */
--text-primary:  #EDEDED;    /* was #F1F5F9 */
--text-secondary:#888888;    /* was #94A3B8 */
--text-muted:    #555555;    /* was #475569 */
```

Add new variable:
```css
--accent-highlight: #3B82F6; /* blue reserved for interactive highlights only */
```

Verdict colors (`--score-go`, `--score-cond`, `--score-pivot`, `--score-kill`) and source colors stay unchanged.

- [ ] **Step 2: Update typography defaults**

In the same file, update the body/base typography to use tighter spacing:

```css
body {
  font-family: var(--font-sans);
  font-size: 13px;
  letter-spacing: -0.01em;
}
```

- [ ] **Step 3: Update Tailwind theme mappings**

Ensure the `@theme` block maps the new CSS variables to Tailwind tokens correctly. Update `--color-card` to map to `--bg-surface`, `--color-border` to `--border-base`, etc. Check that existing Tailwind utility classes (`bg-card`, `border-border`, `text-foreground`) resolve to the new values.

- [ ] **Step 4: Add workspace-specific utility classes**

Add these utility classes to globals.css for the three-panel layout:

```css
.panel-border {
  border-color: var(--border-dim);
}

.hover-surface {
  transition: background-color 150ms ease-out;
}
.hover-surface:hover {
  background-color: var(--bg-elevated);
}

.selected-indicator {
  border-left: 2px solid var(--accent);
}

/* Skeleton shimmer animation */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-elevated) 50%, var(--bg-surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
```

- [ ] **Step 5: Verify build**

```bash
cd /Users/ronkaldes/Projects-WLDS/ai6\ Labs\ Studio/ai6-studio && npm run build
```

Expected: Build succeeds. Existing components may look different (monochrome instead of blue) but should not break.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: update design system to monochrome palette (Linear-inspired)"
```

---

## Task 2: Create SkeletonLoader and StageIndicator

**Files:**
- Create: `src/components/workspace/SkeletonLoader.tsx`
- Create: `src/components/workspace/StageIndicator.tsx`

Small utility components used across the workspace. Build these first so later tasks can reference them.

- [ ] **Step 1: Create SkeletonLoader component**

Create `src/components/workspace/SkeletonLoader.tsx`:

```tsx
'use client'

import { cn } from '@/lib/utils'

interface SkeletonLoaderProps {
  className?: string
  lines?: number
}

export function SkeletonLoader({ className, lines = 3 }: SkeletonLoaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-3 rounded-md border border-[var(--border-dim)]', className)}>
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  )
}
```

- [ ] **Step 2: Create StageIndicator component**

Create `src/components/workspace/StageIndicator.tsx`:

```tsx
'use client'

import { cn } from '@/lib/utils'

interface StageIndicatorProps {
  daysInStage: number
  className?: string
}

export function StageIndicator({ daysInStage, className }: StageIndicatorProps) {
  const color =
    daysInStage >= 7 ? 'text-[var(--score-kill)]' :
    daysInStage >= 5 ? 'text-[var(--score-cond)]' :
    'text-[var(--text-muted)]'

  return (
    <span className={cn('font-mono text-[10px]', color, className)}>
      Day {daysInStage}
    </span>
  )
}

export function staleBorder(daysInStage: number): string {
  if (daysInStage > 5) return 'border-l-2 border-l-[var(--score-cond)]'
  return ''
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/ronkaldes/Projects-WLDS/ai6\ Labs\ Studio/ai6-studio && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/workspace/
git commit -m "feat: add SkeletonLoader and StageIndicator components"
```

---

## Task 3: Create WorkspaceLayout Shell

**Files:**
- Create: `src/components/workspace/WorkspaceLayout.tsx`

The three-panel container. Uses CSS Grid. Left and right panels are collapsible.

- [ ] **Step 1: Create WorkspaceLayout component**

Create `src/components/workspace/WorkspaceLayout.tsx`:

```tsx
'use client'

import { useState, createContext, useContext, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface WorkspaceContextType {
  leftCollapsed: boolean
  rightCollapsed: boolean
  toggleLeft: () => void
  toggleRight: () => void
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  leftCollapsed: false,
  rightCollapsed: false,
  toggleLeft: () => {},
  toggleRight: () => {},
})

export function useWorkspace() {
  return useContext(WorkspaceContext)
}

interface WorkspaceLayoutProps {
  left: ReactNode
  center: ReactNode
  right: ReactNode
}

export function WorkspaceLayout({ left, center, right }: WorkspaceLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)

  const toggleLeft = () => setLeftCollapsed(prev => !prev)
  const toggleRight = () => setRightCollapsed(prev => !prev)

  return (
    <WorkspaceContext.Provider value={{ leftCollapsed, rightCollapsed, toggleLeft, toggleRight }}>
      <div className="flex h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
        {/* Left Panel — Navigator */}
        <div
          className={cn(
            'flex-shrink-0 border-r panel-border overflow-hidden transition-[width] duration-150 ease-out',
            leftCollapsed ? 'w-12' : 'w-60'
          )}
        >
          {left}
        </div>

        {/* Center Panel — Detail */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {center}
        </div>

        {/* Right Panel — Context */}
        <div
          className={cn(
            'flex-shrink-0 border-l panel-border overflow-hidden transition-[width] duration-150 ease-out',
            rightCollapsed ? 'w-0' : 'w-80'
          )}
        >
          {right}
        </div>
      </div>
    </WorkspaceContext.Provider>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/ronkaldes/Projects-WLDS/ai6\ Labs\ Studio/ai6-studio && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/workspace/WorkspaceLayout.tsx
git commit -m "feat: add WorkspaceLayout three-panel shell"
```

---

## Task 4: Create Navigator Panel (Left)

**Files:**
- Create: `src/components/workspace/Navigator.tsx`
- Create: `src/components/workspace/IdeaListItem.tsx`

The left panel with view switching, search, and idea list grouped by stage.

- [ ] **Step 1: Create IdeaListItem component**

Create `src/components/workspace/IdeaListItem.tsx`:

```tsx
'use client'

import { cn } from '@/lib/utils'
import { StageIndicator, staleBorder } from './StageIndicator'
import { ScorePill } from '@/components/ui/ScorePill'
import type { Idea, TrendSignal } from '@/types'

interface IdeaListItemProps {
  item: Idea | TrendSignal
  isSelected: boolean
  onClick: () => void
}

export function IdeaListItem({ item, isSelected, onClick }: IdeaListItemProps) {
  const isSignal = 'opportunityScore' in item && !('stage' in item)
  const title = item.title
  const score = isSignal
    ? (item as TrendSignal).opportunityScore
    : (item as Idea).ventureScore

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2 rounded-md hover-surface cursor-pointer',
        'transition-all duration-150',
        isSelected && 'selected-indicator bg-[var(--bg-elevated)]',
        !isSignal && staleBorder((item as Idea).daysInStage)
      )}
    >
      <div className="text-[12px] font-medium truncate">
        {title}
      </div>
      <div className="flex items-center gap-2 mt-1">
        {isSignal && (item as TrendSignal).velocitySignal && (
          <span className="text-[10px] text-[var(--text-muted)] truncate">
            {(item as TrendSignal).velocitySignal}
          </span>
        )}
        {!isSignal && (
          <StageIndicator daysInStage={(item as Idea).daysInStage} />
        )}
        {score != null && (
          <ScorePill score={score} className="ml-auto" />
        )}
      </div>
    </button>
  )
}
```

- [ ] **Step 2: Create Navigator component**

Create `src/components/workspace/Navigator.tsx`. This is the main left panel with view tabs, search, and the grouped idea list. It fetches data from existing API routes.

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useWorkspace } from './WorkspaceLayout'
import { IdeaListItem } from './IdeaListItem'
import { SkeletonLoader } from './SkeletonLoader'
import type { Idea, TrendSignal } from '@/types'

export type ViewType = 'inbox' | 'pipeline' | 'board' | 'archive'

interface NavigatorProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  selectedId: string | null
  onSelectItem: (id: string, type: 'signal' | 'idea') => void
}

const VIEWS: { key: ViewType; label: string; icon: string }[] = [
  { key: 'inbox', label: 'Inbox', icon: '◆' },
  { key: 'pipeline', label: 'Pipeline', icon: '▦' },
  { key: 'board', label: 'Board', icon: '◎' },
  { key: 'archive', label: 'Archive', icon: '◇' },
]

export function Navigator({ activeView, onViewChange, selectedId, onSelectItem }: NavigatorProps) {
  const { leftCollapsed } = useWorkspace()
  const [signals, setSignals] = useState<TrendSignal[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [sigRes, ideaRes] = await Promise.all([
        fetch('/api/signals'),
        fetch('/api/ideas'),
      ])
      const sigData = await sigRes.json()
      const ideaData = await ideaRes.json()
      setSignals(sigData.signals || [])
      setIdeas(ideaData.ideas || [])
    } catch (e) {
      console.error('Navigator fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Filter items based on active view
  const filteredItems = getViewItems(activeView, signals, ideas, search)

  // Badge counts
  const inboxCount = signals.filter(s => s.pipelineStatus === 'new').length
  const boardCount = ideas.filter(i => i.stage === 'decision_gate').length

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)]">
      {/* Logo */}
      <div className="px-4 py-3 border-b panel-border">
        <div className="font-semibold text-[13px] tracking-tight">
          {leftCollapsed ? 'a6' : 'ai6 Labs'}
        </div>
        {!leftCollapsed && (
          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Studio</div>
        )}
      </div>

      {/* View Tabs */}
      <div className="px-2 py-2 space-y-0.5">
        {VIEWS.map(v => (
          <button
            key={v.key}
            onClick={() => onViewChange(v.key)}
            className={cn(
              'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] font-medium hover-surface',
              activeView === v.key ? 'bg-[var(--bg-elevated)]' : 'text-[var(--text-secondary)]'
            )}
          >
            <span className="text-[var(--text-muted)] w-4 text-center">{v.icon}</span>
            {!leftCollapsed && (
              <>
                <span>{v.label}</span>
                {v.key === 'inbox' && inboxCount > 0 && (
                  <span className="ml-auto bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded-full text-[10px]">
                    {inboxCount}
                  </span>
                )}
                {v.key === 'board' && boardCount > 0 && (
                  <span className="ml-auto bg-[rgba(239,68,68,0.2)] text-[var(--score-kill)] px-1.5 py-0.5 rounded-full text-[10px]">
                    {boardCount}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      {!leftCollapsed && (
        <div className="px-2 py-1">
          <input
            type="text"
            placeholder="Search ideas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-base)] border border-[var(--border-dim)] rounded-md px-2.5 py-1.5 text-[11px] text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)]"
          />
        </div>
      )}

      {/* Item List */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {loading ? (
          <SkeletonLoader lines={5} className="px-2" />
        ) : (
          filteredItems.map(group => (
            <div key={group.label}>
              {!leftCollapsed && group.label && (
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] px-2 pt-3 pb-1">
                  {group.label}
                </div>
              )}
              {group.items.map(item => (
                <IdeaListItem
                  key={item.id}
                  item={item}
                  isSelected={selectedId === item.id}
                  onClick={() => onSelectItem(
                    item.id,
                    'opportunityScore' in item && !('stage' in item) ? 'signal' : 'idea'
                  )}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* User */}
      {!leftCollapsed && (
        <div className="px-3 py-3 border-t panel-border flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[var(--bg-elevated)]" />
          <span className="text-[11px] text-[var(--text-secondary)]">Ron K.</span>
        </div>
      )}
    </div>
  )
}

interface ItemGroup {
  label: string
  items: (Idea | TrendSignal)[]
}

function getViewItems(
  view: ViewType,
  signals: TrendSignal[],
  ideas: Idea[],
  search: string
): ItemGroup[] {
  const q = search.toLowerCase()
  const matchSearch = (title: string) => !q || title.toLowerCase().includes(q)

  switch (view) {
    case 'inbox':
      return [{
        label: '',
        items: signals
          .filter(s => s.pipelineStatus === 'new' && matchSearch(s.title))
          .sort((a, b) => b.opportunityScore - a.opportunityScore)
      }]
    case 'pipeline': {
      const stages = ['refining', 'validating', 'active_sprint'] as const
      return stages.map(stage => ({
        label: stage.replace('_', ' '),
        items: ideas.filter(i => i.stage === stage && matchSearch(i.title))
      })).filter(g => g.items.length > 0)
    }
    case 'board':
      return [{
        label: '',
        items: ideas.filter(i => i.stage === 'decision_gate' && matchSearch(i.title))
      }]
    case 'archive':
      return [
        {
          label: 'Graduated',
          items: ideas.filter(i => i.stage === 'graduated' && i.boardDecision !== 'kill' && matchSearch(i.title))
        },
        {
          label: 'Killed',
          items: ideas.filter(i => i.stage === 'graduated' && i.boardDecision === 'kill' && matchSearch(i.title))
        },
      ].filter(g => g.items.length > 0)
    default:
      return []
  }
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/ronkaldes/Projects-WLDS/ai6\ Labs\ Studio/ai6-studio && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/workspace/Navigator.tsx src/components/workspace/IdeaListItem.tsx
git commit -m "feat: add Navigator panel with view switching and grouped idea list"
```

---

## Task 5: Create TabBar and DetailView (Center Panel)

**Files:**
- Create: `src/components/workspace/TabBar.tsx`
- Create: `src/components/workspace/DetailView.tsx`

The center panel with idea header, tab navigation, and content area.

- [ ] **Step 1: Create TabBar component**

Create `src/components/workspace/TabBar.tsx`:

```tsx
'use client'

import { cn } from '@/lib/utils'

export type TabId = 'overview' | 'scoring' | 'assumptions' | 'experiments' | 'board-brief'

interface Tab {
  id: TabId
  label: string
  completeness: 'empty' | 'partial' | 'complete'
}

interface TabBarProps {
  tabs: Tab[]
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex border-b panel-border px-5">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-3.5 py-2.5 text-[12px] font-medium transition-colors duration-150 relative',
            activeTab === tab.id
              ? 'text-[var(--text-primary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          )}
        >
          <span className="flex items-center gap-1.5">
            <CompletenessIndicator state={tab.completeness} />
            {tab.label}
          </span>
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)]" />
          )}
        </button>
      ))}
    </div>
  )
}

function CompletenessIndicator({ state }: { state: 'empty' | 'partial' | 'complete' }) {
  const colors = {
    empty: 'bg-[var(--border-base)]',
    partial: 'bg-[var(--score-cond)]',
    complete: 'bg-[var(--score-go)]',
  }
  return <div className={cn('w-1.5 h-1.5 rounded-full', colors[state])} />
}
```

- [ ] **Step 2: Create DetailView component**

Create `src/components/workspace/DetailView.tsx`. This is the center panel shell — it renders the idea header, tab bar, and delegates to tab content components.

```tsx
'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { TabBar, type TabId } from './TabBar'
import { StageIndicator } from './StageIndicator'
import { useWorkspace } from './WorkspaceLayout'
import type { Idea, TrendSignal } from '@/types'

interface DetailViewProps {
  item: Idea | TrendSignal | null
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onPromote?: (signalId: string) => void
  onArchive?: (signalId: string) => void
  onSubmitToBoard?: (ideaId: string) => void
  children: React.ReactNode  // Tab content rendered by parent
}

export function DetailView({
  item,
  activeTab,
  onTabChange,
  onPromote,
  onArchive,
  onSubmitToBoard,
  children,
}: DetailViewProps) {
  const { toggleRight, rightCollapsed } = useWorkspace()
  const isSignal = item && 'opportunityScore' in item && !('stage' in item)
  const isIdea = item && 'stage' in item

  if (!item) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-[13px]">
        Select an item from the list
      </div>
    )
  }

  const tabs = isIdea ? getIdeaTabs(item as Idea) : []

  return (
    <div className="flex flex-col h-full">
      {/* Header Bar */}
      <div className="px-5 py-3 border-b panel-border flex items-center gap-3">
        <h1 className="text-[15px] font-semibold tracking-tight truncate">
          {item.title}
        </h1>

        {isIdea && (
          <>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
              {(item as Idea).stage.replace('_', ' ')}
            </span>
            <StageIndicator daysInStage={(item as Idea).daysInStage} className="ml-auto" />
          </>
        )}

        {isSignal && (
          <div className="flex items-center gap-2 ml-auto">
            {onPromote && (
              <button
                onClick={() => onPromote(item.id)}
                className="text-[12px] font-medium px-3 py-1.5 rounded-md bg-[var(--bg-elevated)] hover-surface"
              >
                Promote to Pipeline →
              </button>
            )}
            {onArchive && (
              <button
                onClick={() => onArchive(item.id)}
                className="text-[12px] text-[var(--text-muted)] px-3 py-1.5 rounded-md border border-[var(--border-dim)] hover-surface"
              >
                Archive
              </button>
            )}
          </div>
        )}

        {isIdea && (item as Idea).stage === 'validating' && onSubmitToBoard && (
          <button
            onClick={() => onSubmitToBoard(item.id)}
            className="ml-auto text-[12px] font-medium px-3 py-1.5 rounded-md bg-[var(--bg-elevated)] hover-surface"
          >
            Submit to Board →
          </button>
        )}

        <button
          onClick={toggleRight}
          className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-[11px] ml-2"
        >
          {rightCollapsed ? '⊞' : '⊟'}
        </button>
      </div>

      {/* Tab Bar (ideas only) */}
      {isIdea && tabs.length > 0 && (
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {children}
      </div>
    </div>
  )
}

function getIdeaTabs(idea: Idea) {
  return [
    {
      id: 'overview' as TabId,
      label: 'Overview',
      completeness: idea.opportunityMemo ? 'complete' as const : 'empty' as const,
    },
    {
      id: 'scoring' as TabId,
      label: 'Scoring',
      completeness: idea.dvfScores && idea.dvfScores.length > 0 ? 'complete' as const : 'empty' as const,
    },
    {
      id: 'assumptions' as TabId,
      label: 'Assumptions',
      completeness: idea.assumptionMap && idea.assumptionMap.length > 0
        ? 'complete' as const
        : 'empty' as const,
    },
    {
      id: 'experiments' as TabId,
      label: 'Experiments',
      completeness: idea.experiments && idea.experiments.length > 0
        ? 'complete' as const
        : 'empty' as const,
    },
    {
      id: 'board-brief' as TabId,
      label: 'Board Brief',
      completeness: idea.boardDecision ? 'complete' as const
        : idea.ventureScore ? 'partial' as const
        : 'empty' as const,
    },
  ]
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/ronkaldes/Projects-WLDS/ai6\ Labs\ Studio/ai6-studio && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/workspace/TabBar.tsx src/components/workspace/DetailView.tsx
git commit -m "feat: add DetailView center panel with TabBar navigation"
```

---

## Task 6: Create Tab Content Components

**Files:**
- Create: `src/components/workspace/tabs/OverviewTab.tsx`
- Create: `src/components/workspace/tabs/ScoringTab.tsx`
- Create: `src/components/workspace/tabs/AssumptionsTab.tsx`
- Create: `src/components/workspace/tabs/ExperimentsTab.tsx`
- Create: `src/components/workspace/tabs/BoardBriefTab.tsx`

Each tab adapts existing component logic into the new monochrome workspace style. Tabs for ideas; for signals, the center panel shows signal detail directly.

- [ ] **Step 1: Create OverviewTab**

Create `src/components/workspace/tabs/OverviewTab.tsx`. Combines the problem statement, opportunity memo display, and source signal info. References existing `OpportunityCard` component for structured data.

```tsx
'use client'

import { useState } from 'react'
import { SkeletonLoader } from '../SkeletonLoader'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { ScorePill } from '@/components/ui/ScorePill'
import type { Idea, TrendSignal } from '@/types'

interface OverviewTabProps {
  idea: Idea
  sourceSignal?: TrendSignal | null
  onRefreshIdea: () => void
}

export function OverviewTab({ idea, sourceSignal, onRefreshIdea }: OverviewTabProps) {
  const [problemText, setProblemText] = useState(idea.opportunityMemo?.problem || '')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const generateMemo = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id, step: 2, data: { validated_problem: problemText } }),
      })
      if (!res.ok) throw new Error('Failed to generate memo')
      onRefreshIdea()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const memo = idea.opportunityMemo

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Source Signal */}
      {sourceSignal && (
        <section>
          <SectionLabel>Source Signal</SectionLabel>
          <div className="flex items-center gap-2">
            <SourceBadge source={sourceSignal.source} />
            {sourceSignal.velocitySignal && (
              <span className="text-[12px] text-[var(--text-secondary)]">
                {sourceSignal.velocitySignal}
              </span>
            )}
            <ScorePill score={sourceSignal.opportunityScore} className="ml-1" />
          </div>
        </section>
      )}

      {/* Problem Statement */}
      <section>
        <SectionLabel>Problem</SectionLabel>
        <textarea
          value={problemText}
          onChange={e => setProblemText(e.target.value)}
          placeholder="Describe the core problem this idea addresses..."
          className="w-full bg-transparent border border-[var(--border-dim)] rounded-md p-3 text-[13px] leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] resize-none min-h-[80px]"
        />
      </section>

      {/* Opportunity Memo */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <SectionLabel className="mb-0">Opportunity Memo</SectionLabel>
          {memo && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">
              AI Generated
            </span>
          )}
        </div>

        {generating ? (
          <SkeletonLoader lines={6} />
        ) : memo ? (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-md p-4 space-y-2 text-[12px] leading-relaxed text-[var(--text-secondary)]">
            <MemoField label="Customer" value={memo.target_customer} />
            <MemoField label="Solution" value={memo.solution} />
            <MemoField label="Moat" value={memo.moat} />
            <MemoField label="Why Now" value={memo.why_now} />
            <MemoField label="Market" value={memo.market_size} />
            {memo.risks && memo.risks.length > 0 && (
              <div>
                <strong className="text-[var(--text-primary)]">Risks:</strong>{' '}
                {memo.risks.join(', ')}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={generateMemo}
            disabled={!problemText.trim()}
            className="px-4 py-2 rounded-md bg-[var(--bg-elevated)] text-[12px] font-medium hover-surface disabled:opacity-30"
          >
            Generate with AI
          </button>
        )}

        {error && (
          <div className="mt-2 text-[12px] text-[var(--score-kill)]">{error}</div>
        )}
      </section>
    </div>
  )
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ${className || ''}`}>
      {children}
    </div>
  )
}

function MemoField({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <strong className="text-[var(--text-primary)]">{label}:</strong> {value}
    </div>
  )
}
```

- [ ] **Step 2: Create ScoringTab**

Create `src/components/workspace/tabs/ScoringTab.tsx`. Displays DVF scores as editable inline cards. Users can generate scores via AI then manually override.

```tsx
'use client'

import { useState } from 'react'
import { SkeletonLoader } from '../SkeletonLoader'
import type { Idea, AgentScore } from '@/types'

const DIMENSIONS = [
  { key: 'desirability', label: 'Desirability', weight: '20%' },
  { key: 'strategic_fit', label: 'Strategic Fit', weight: '20%' },
  { key: 'market_size', label: 'Market Size', weight: '15%' },
  { key: 'technical_feasibility', label: 'Tech Feasibility', weight: '15%' },
  { key: 'revenue_path', label: 'Revenue Path', weight: '15%' },
  { key: 'distribution_leverage', label: 'Distribution', weight: '10%' },
  { key: 'why_now', label: 'Why Now', weight: '5%' },
]

interface ScoringTabProps {
  idea: Idea
  onRefreshIdea: () => void
}

export function ScoringTab({ idea, onRefreshIdea }: ScoringTabProps) {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const scores = idea.dvfScores || []

  const generateScores = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id, step: 3, data: {} }),
      })
      if (!res.ok) throw new Error('Failed to generate scores')
      onRefreshIdea()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  // NOTE: Score editing depends on Task 10 Step 3 (PATCH endpoint expansion).
  // Until that step is done, edited scores won't persist. AI generation works immediately.
  const updateScore = async (dimension: string, newValue: number) => {
    // Update score locally then persist
    const updatedScores = scores.map((s: AgentScore) => {
      if (s.dimension === dimension) {
        return { ...s, scores: { ...s.scores, [dimension]: newValue } }
      }
      return s
    })
    try {
      await fetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dvfScores: updatedScores }),
      })
      onRefreshIdea()
    } catch (e) {
      console.error('Failed to update score', e)
    }
  }

  if (generating) {
    return <SkeletonLoader lines={7} />
  }

  if (scores.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-[13px] text-[var(--text-secondary)]">
          No scores yet. Generate DVF scores using AI agents.
        </p>
        <button
          onClick={generateScores}
          className="px-4 py-2 rounded-md bg-[var(--bg-elevated)] text-[12px] font-medium hover-surface"
        >
          Generate with AI
        </button>
        {error && <div className="text-[12px] text-[var(--score-kill)]">{error}</div>}
      </div>
    )
  }

  // Extract scores from agent results
  const scoreMap: Record<string, { value: number; rationale: string }> = {}
  for (const agent of scores) {
    if (agent.scores) {
      for (const [key, val] of Object.entries(agent.scores)) {
        scoreMap[key] = { value: val as number, rationale: agent.rationale || '' }
      }
    }
  }

  return (
    <div className="space-y-3 max-w-2xl">
      {/* Venture Score Summary */}
      {idea.ventureScore != null && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Venture Score
          </span>
          <span className="font-mono text-[20px] font-bold">
            {idea.ventureScore}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">/ 100</span>
        </div>
      )}

      {/* Dimension Cards */}
      {DIMENSIONS.map(dim => {
        const data = scoreMap[dim.key]
        const value = data?.value ?? 0
        const barWidth = (value / 5) * 100

        return (
          <div key={dim.key} className="border border-[var(--border-dim)] rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-medium">{dim.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--text-muted)]">{dim.weight}</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={value}
                  onChange={e => updateScore(dim.key, Number(e.target.value))}
                  className="w-10 bg-[var(--bg-base)] border border-[var(--border-dim)] rounded px-1.5 py-0.5 text-center font-mono text-[12px] focus:outline-none focus:border-[var(--border-active)]"
                />
                <span className="text-[10px] text-[var(--text-muted)]">/ 5</span>
              </div>
            </div>
            {/* Bar */}
            <div className="h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--text-secondary)] rounded-full transition-all duration-150"
                style={{ width: `${barWidth}%` }}
              />
            </div>
            {data?.rationale && (
              <p className="mt-2 text-[11px] text-[var(--text-muted)] leading-relaxed">
                {data.rationale}
              </p>
            )}
          </div>
        )
      })}

      {error && <div className="text-[12px] text-[var(--score-kill)]">{error}</div>}
    </div>
  )
}
```

- [ ] **Step 3: Create AssumptionsTab**

Create `src/components/workspace/tabs/AssumptionsTab.tsx`. Thin wrapper around the existing `AssumptionMap` component with monochrome styling adjustments and an AI generate button.

```tsx
'use client'

import { useState } from 'react'
import { AssumptionMap } from '@/components/validate/AssumptionMap'
import { SkeletonLoader } from '../SkeletonLoader'
import type { Idea } from '@/types'

interface AssumptionsTabProps {
  idea: Idea
  onRefreshIdea: () => void
}

export function AssumptionsTab({ idea, onRefreshIdea }: AssumptionsTabProps) {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const hasAssumptions = idea.assumptionMap && idea.assumptionMap.length > 0

  const generateAssumptions = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id, step: 4, data: {} }),
      })
      if (!res.ok) throw new Error('Failed to generate assumptions')
      onRefreshIdea()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  if (generating) return <SkeletonLoader lines={6} />

  if (!hasAssumptions) {
    return (
      <div className="space-y-4">
        <p className="text-[13px] text-[var(--text-secondary)]">
          No assumptions mapped yet. Generate from your opportunity memo.
        </p>
        <button
          onClick={generateAssumptions}
          className="px-4 py-2 rounded-md bg-[var(--bg-elevated)] text-[12px] font-medium hover-surface"
        >
          Generate with AI
        </button>
        {error && <div className="text-[12px] text-[var(--score-kill)]">{error}</div>}
      </div>
    )
  }

  return (
    <div>
      <AssumptionMap idea={idea} onComplete={onRefreshIdea} />
    </div>
  )
}
```

- [ ] **Step 4: Create ExperimentsTab**

Create `src/components/workspace/tabs/ExperimentsTab.tsx`. Wraps existing `ExperimentCards` with generate button.

```tsx
'use client'

import { useState } from 'react'
import { ExperimentCards } from '@/components/validate/ExperimentCards'
import { SkeletonLoader } from '../SkeletonLoader'
import type { Idea } from '@/types'

interface ExperimentsTabProps {
  idea: Idea
  onRefreshIdea: () => void
}

export function ExperimentsTab({ idea, onRefreshIdea }: ExperimentsTabProps) {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const hasExperiments = idea.experiments && idea.experiments.length > 0

  const generateExperiments = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id, step: 5, data: { experiments: [] } }),
      })
      if (!res.ok) throw new Error('Failed to generate experiments')
      onRefreshIdea()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  if (generating) return <SkeletonLoader lines={4} />

  if (!hasExperiments) {
    return (
      <div className="space-y-4">
        <p className="text-[13px] text-[var(--text-secondary)]">
          No experiments designed yet. Generate from your top assumptions.
        </p>
        <button
          onClick={generateExperiments}
          disabled={!idea.assumptionMap || idea.assumptionMap.length === 0}
          className="px-4 py-2 rounded-md bg-[var(--bg-elevated)] text-[12px] font-medium hover-surface disabled:opacity-30"
        >
          Generate with AI
        </button>
        {error && <div className="text-[12px] text-[var(--score-kill)]">{error}</div>}
      </div>
    )
  }

  return (
    <div>
      <ExperimentCards idea={idea} onComplete={onRefreshIdea} />
    </div>
  )
}
```

- [ ] **Step 5: Create BoardBriefTab**

Create `src/components/workspace/tabs/BoardBriefTab.tsx`. Read-only summary of the idea's validation data plus voting results.

```tsx
'use client'

import { ScorePill } from '@/components/ui/ScorePill'
import type { Idea } from '@/types'

interface BoardBriefTabProps {
  idea: Idea
}

export function BoardBriefTab({ idea }: BoardBriefTabProps) {
  const memo = idea.opportunityMemo

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Venture Score */}
      {idea.ventureScore != null && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-[24px] font-bold">{idea.ventureScore}</span>
          <span className="text-[11px] text-[var(--text-muted)]">/ 100 venture score</span>
          {idea.boardDecision && (
            <ScorePill score={idea.ventureScore} className="ml-2" />
          )}
        </div>
      )}

      {/* Memo Summary */}
      {memo && (
        <section className="bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-md p-4 space-y-3 text-[12px] leading-relaxed">
          <BriefField label="Problem" value={memo.problem} />
          <BriefField label="Customer" value={memo.target_customer} />
          <BriefField label="Solution" value={memo.solution} />
          <BriefField label="Moat" value={memo.moat} />
          <BriefField label="Why Now" value={memo.why_now} />
          <BriefField label="Market" value={memo.market_size} />
          {memo.risks && memo.risks.length > 0 && (
            <div>
              <strong className="text-[var(--score-kill)]">Risks:</strong>{' '}
              <span className="text-[var(--text-secondary)]">{memo.risks.join(' · ')}</span>
            </div>
          )}
        </section>
      )}

      {/* Assumptions Summary */}
      {idea.assumptionMap && idea.assumptionMap.length > 0 && (
        <section>
          <SectionLabel>Critical Assumptions</SectionLabel>
          <div className="space-y-1">
            {idea.assumptionMap
              .filter((a: any) => a.importance > 0.5)
              .slice(0, 5)
              .map((a: any, i: number) => (
                <div key={i} className="text-[12px] text-[var(--text-secondary)] flex items-start gap-2">
                  <span className="text-[var(--text-muted)]">•</span>
                  {a.text}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Board Decision */}
      {idea.boardDecision && (
        <section className="border-t border-[var(--border-dim)] pt-4">
          <SectionLabel>Board Decision</SectionLabel>
          <div className="flex items-center gap-3">
            <VerdictBadge verdict={idea.boardDecision} />
            {idea.boardRationale && (
              <span className="text-[12px] text-[var(--text-secondary)]">
                {idea.boardRationale}
              </span>
            )}
          </div>
        </section>
      )}

      {/* Vote History */}
      {idea.boardVotes && idea.boardVotes.length > 0 && (
        <section>
          <SectionLabel>Votes</SectionLabel>
          <div className="space-y-1">
            {idea.boardVotes.map((vote: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-[12px]">
                <span className="text-[var(--text-primary)] font-medium">{vote.member_name}</span>
                <VerdictBadge verdict={vote.verdict} small />
                {vote.rationale && (
                  <span className="text-[var(--text-muted)] truncate">{vote.rationale}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Not ready state */}
      {!memo && !idea.ventureScore && (
        <p className="text-[13px] text-[var(--text-muted)]">
          Complete the Overview and Scoring tabs before submitting to the board.
        </p>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
      {children}
    </div>
  )
}

function BriefField({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <strong className="text-[var(--text-primary)]">{label}:</strong>{' '}
      <span className="text-[var(--text-secondary)]">{value}</span>
    </div>
  )
}

function VerdictBadge({ verdict, small }: { verdict: string; small?: boolean }) {
  const colors: Record<string, string> = {
    go: 'bg-[rgba(34,197,94,0.15)] text-[var(--score-go)]',
    conditional: 'bg-[rgba(245,158,11,0.15)] text-[var(--score-cond)]',
    pivot: 'bg-[rgba(99,102,241,0.15)] text-[var(--score-pivot)]',
    kill: 'bg-[rgba(239,68,68,0.15)] text-[var(--score-kill)]',
  }
  return (
    <span className={`${colors[verdict] || ''} ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-1'} rounded font-medium uppercase`}>
      {verdict}
    </span>
  )
}
```

- [ ] **Step 6: Verify build**

```bash
cd /Users/ronkaldes/Projects-WLDS/ai6\ Labs\ Studio/ai6-studio && npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/components/workspace/tabs/
git commit -m "feat: add all tab content components (Overview, Scoring, Assumptions, Experiments, BoardBrief)"
```

---

## Task 7: Create ContextPanel (Right Panel)

**Files:**
- Create: `src/components/workspace/ContextPanel.tsx`
- Create: `src/components/workspace/AIChatThread.tsx`
- Create: `src/components/workspace/VotingCard.tsx`

The right panel that adapts based on the active tab.

- [ ] **Step 1: Create AIChatThread component**

Create `src/components/workspace/AIChatThread.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { SkeletonLoader } from './SkeletonLoader'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatThreadProps {
  ideaId: string
  ideaTitle: string
  context?: string  // Additional context based on active tab
}

export function AIChatThread({ ideaId, ideaTitle, context }: AIChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea_id: ideaId,
          step: 1,
          data: { problem_statement: input },
        }),
      })
      const data = await res.json()
      const aiContent = data.feedback || data.result || 'No response generated.'
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get response. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-[11px] text-[var(--text-muted)] text-center py-4">
            Ask about "{ideaTitle}"
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-lg p-2.5 text-[11px] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.15)] text-[var(--text-secondary)]'
                : 'bg-[var(--bg-base)] text-[var(--text-secondary)]'
            }`}
          >
            <div className="text-[10px] text-[var(--text-muted)] mb-1">
              {msg.role === 'user' ? 'You' : 'Claude'}
            </div>
            {msg.content}
          </div>
        ))}
        {loading && <SkeletonLoader lines={3} />}
      </div>

      {/* Input */}
      <div className="p-3 border-t panel-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about this idea..."
            className="flex-1 bg-[var(--bg-base)] border border-[var(--border-dim)] rounded-lg px-3 py-2 text-[11px] text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)]"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-3 py-2 rounded-lg bg-[var(--bg-elevated)] text-[11px] font-medium hover-surface disabled:opacity-30"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create VotingCard component**

Create `src/components/workspace/VotingCard.tsx`:

```tsx
'use client'

import { useState } from 'react'
import type { BoardVerdict } from '@/types'

interface VotingCardProps {
  ideaId: string
  existingVotes?: any[]
  onVoteSubmitted: () => void
}

const VERDICTS: { key: BoardVerdict; label: string; color: string }[] = [
  { key: 'go', label: 'Go', color: 'var(--score-go)' },
  { key: 'conditional', label: 'Conditional', color: 'var(--score-cond)' },
  { key: 'pivot', label: 'Pivot', color: 'var(--score-pivot)' },
  { key: 'kill', label: 'Kill', color: 'var(--score-kill)' },
]

const MEMBERS = ['Pankaj', 'Offir', 'Leor', 'Leeor', 'Asher', 'Ron']

export function VotingCard({ ideaId, existingVotes = [], onVoteSubmitted }: VotingCardProps) {
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedVerdict, setSelectedVerdict] = useState<BoardVerdict | null>(null)
  const [rationale, setRationale] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submitVote = async () => {
    if (!selectedMember || !selectedVerdict || !rationale.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const vote = {
        member_name: selectedMember,
        member_email: `${selectedMember.toLowerCase()}@ai6labs.com`,
        verdict: selectedVerdict,
        rationale,
        voted_at: new Date().toISOString(),
      }
      const allVotes = [...existingVotes, vote]
      const res = await fetch('/api/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea_id: ideaId,
          votes: allVotes,
          decision: selectedVerdict,
          learnings: rationale,
        }),
      })
      if (!res.ok) throw new Error('Failed to submit vote')
      onVoteSubmitted()
      setSelectedVerdict(null)
      setRationale('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Member Selector */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
          Voting as
        </div>
        <div className="flex flex-wrap gap-1">
          {MEMBERS.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMember(m)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                selectedMember === m
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Verdict Buttons */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
          Verdict
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {VERDICTS.map(v => (
            <button
              key={v.key}
              onClick={() => setSelectedVerdict(v.key)}
              className={`px-3 py-2 rounded-md text-[11px] font-medium uppercase transition-colors border ${
                selectedVerdict === v.key
                  ? `border-[${v.color}] text-[${v.color}] bg-[rgba(255,255,255,0.03)]`
                  : 'border-[var(--border-dim)] text-[var(--text-muted)] hover:border-[var(--border-base)]'
              }`}
              style={selectedVerdict === v.key ? { borderColor: v.color, color: v.color } : {}}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rationale */}
      <div>
        <textarea
          value={rationale}
          onChange={e => setRationale(e.target.value)}
          placeholder="Rationale (required)..."
          rows={3}
          className="w-full bg-[var(--bg-base)] border border-[var(--border-dim)] rounded-md px-3 py-2 text-[11px] text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={submitVote}
        disabled={!selectedMember || !selectedVerdict || !rationale.trim() || submitting}
        className="w-full py-2 rounded-md bg-[var(--bg-elevated)] text-[12px] font-medium hover-surface disabled:opacity-30"
      >
        {submitting ? 'Submitting...' : 'Cast Vote'}
      </button>

      {error && <div className="text-[11px] text-[var(--score-kill)]">{error}</div>}

      {/* Existing Votes */}
      {existingVotes.length > 0 && (
        <div className="border-t panel-border pt-3">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
            Votes Cast
          </div>
          {existingVotes.map((v: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-[11px] mb-1">
              <span className="font-medium text-[var(--text-primary)]">{v.member_name}</span>
              <span className="uppercase text-[10px]" style={{
                color: VERDICTS.find(vd => vd.key === v.verdict)?.color
              }}>
                {v.verdict}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create ContextPanel component**

Create `src/components/workspace/ContextPanel.tsx`. Switches content based on active tab.

```tsx
'use client'

import { AIChatThread } from './AIChatThread'
import { VotingCard } from './VotingCard'
import type { Idea, TrendSignal } from '@/types'
import type { TabId } from './TabBar'

interface ContextPanelProps {
  item: Idea | TrendSignal | null
  activeTab: TabId
  onRefreshData: () => void
}

export function ContextPanel({ item, activeTab, onRefreshData }: ContextPanelProps) {
  if (!item) {
    return (
      <div className="flex flex-col h-full bg-[var(--bg-surface)]">
        <div className="flex-1 flex items-center justify-center text-[11px] text-[var(--text-muted)]">
          Select an item to see details
        </div>
      </div>
    )
  }

  const isIdea = 'stage' in item
  const idea = isIdea ? (item as Idea) : null

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)]">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b panel-border">
        <span className="text-[12px] font-medium">
          {getPanelTitle(activeTab, isIdea)}
        </span>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* AI Chat — shown for Overview, Scoring, non-board tabs */}
        {activeTab !== 'board-brief' && (
          <div className="flex-1 overflow-hidden">
            <AIChatThread
              ideaId={item.id}
              ideaTitle={item.title}
              context={getTabContext(activeTab)}
            />
          </div>
        )}

        {/* Voting — shown for Board Brief tab */}
        {activeTab === 'board-brief' && idea && (
          <div className="flex-1 overflow-y-auto p-3">
            <VotingCard
              ideaId={idea.id}
              existingVotes={idea.boardVotes || []}
              onVoteSubmitted={onRefreshData}
            />
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="px-3 py-3 border-t panel-border">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
          Activity
        </div>
        <div className="text-[10px] text-[var(--text-muted)] space-y-1 leading-relaxed">
          {idea?.boardDecision && <div>Board voted: {idea.boardDecision}</div>}
          {idea?.ventureScore && <div>Venture score: {idea.ventureScore}/100</div>}
          <div>
            {isIdea ? `Day ${(item as Idea).daysInStage} in ${(item as Idea).stage}` : 'Signal discovered'}
          </div>
        </div>
      </div>
    </div>
  )
}

function getPanelTitle(tab: TabId, isIdea: boolean): string {
  if (!isIdea) return 'AI Assistant'
  switch (tab) {
    case 'board-brief': return 'Voting'
    case 'scoring': return 'Score Analysis'
    default: return 'AI Assistant'
  }
}

function getTabContext(tab: TabId): string {
  switch (tab) {
    case 'overview': return 'Help refine the problem statement and opportunity memo.'
    case 'scoring': return 'Analyze and discuss the DVF scoring dimensions.'
    case 'assumptions': return 'Help evaluate and prioritize critical assumptions.'
    case 'experiments': return 'Suggest validation experiments and success metrics.'
    default: return ''
  }
}
```

- [ ] **Step 4: Verify build**

```bash
cd /Users/ronkaldes/Projects-WLDS/ai6\ Labs\ Studio/ai6-studio && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/workspace/ContextPanel.tsx src/components/workspace/AIChatThread.tsx src/components/workspace/VotingCard.tsx
git commit -m "feat: add ContextPanel with AI chat thread and voting card"
```

---

## Task 8: Create CommandPalette

**Files:**
- Create: `src/components/workspace/CommandPalette.tsx`

Cmd+K quick navigation using shadcn `dialog` primitive.

- [ ] **Step 1: Create CommandPalette component**

Create `src/components/workspace/CommandPalette.tsx`:

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { Idea, TrendSignal } from '@/types'
import type { ViewType } from './Navigator'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  ideas: Idea[]
  signals: TrendSignal[]
  onSelectItem: (id: string, type: 'signal' | 'idea') => void
  onViewChange: (view: ViewType) => void
  onTriggerScan: () => void
}

interface CommandItem {
  id: string
  label: string
  description: string
  action: () => void
  category: string
}

export function CommandPalette({
  open,
  onClose,
  ideas,
  signals,
  onSelectItem,
  onViewChange,
  onTriggerScan,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  const items: CommandItem[] = [
    // Views
    { id: 'v-inbox', label: 'Inbox', description: 'View new signals', action: () => { onViewChange('inbox'); onClose() }, category: 'Views' },
    { id: 'v-pipeline', label: 'Pipeline', description: 'View ideas in progress', action: () => { onViewChange('pipeline'); onClose() }, category: 'Views' },
    { id: 'v-board', label: 'Board', description: 'View pending decisions', action: () => { onViewChange('board'); onClose() }, category: 'Views' },
    { id: 'v-archive', label: 'Archive', description: 'View completed/killed ideas', action: () => { onViewChange('archive'); onClose() }, category: 'Views' },
    // Actions
    { id: 'a-scan', label: 'Trigger Scan', description: 'Scan for new signals', action: () => { onTriggerScan(); onClose() }, category: 'Actions' },
    // Ideas
    ...ideas.map(i => ({
      id: `i-${i.id}`,
      label: i.title,
      description: `${i.stage} · Score ${i.ventureScore ?? '—'}`,
      action: () => { onSelectItem(i.id, 'idea'); onClose() },
      category: 'Ideas',
    })),
    // Signals
    ...signals.filter(s => s.pipelineStatus === 'new').map(s => ({
      id: `s-${s.id}`,
      label: s.title,
      description: `${s.source} · ${s.opportunityScore}`,
      action: () => { onSelectItem(s.id, 'signal'); onClose() },
      category: 'Signals',
    })),
  ]

  const filtered = query
    ? items.filter(i =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        i.description.toLowerCase().includes(query.toLowerCase())
      )
    : items

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item)
    return acc
  }, {})

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="p-0 bg-[var(--bg-elevated)] border-[var(--border-base)] max-w-md top-[20%] translate-y-0">
        {/* Search */}
        <div className="px-4 py-3 border-b panel-border">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search or jump to..."
            autoFocus
            className="w-full bg-transparent text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto py-2">
          {Object.entries(grouped).map(([category, categoryItems]) => (
            <div key={category}>
              <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                {category}
              </div>
              {categoryItems.slice(0, 8).map(item => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full text-left px-4 py-2 hover-surface flex items-center justify-between"
                >
                  <span className="text-[12px] font-medium">{item.label}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{item.description}</span>
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-[12px] text-[var(--text-muted)]">
              No results found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Hook to register Cmd+K keyboard shortcut */
export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return { open, setOpen, close: () => setOpen(false) }
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/ronkaldes/Projects-WLDS/ai6\ Labs\ Studio/ai6-studio && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/workspace/CommandPalette.tsx
git commit -m "feat: add CommandPalette with Cmd+K shortcut"
```

---

## Task 9: Refactor UI Components (ScorePill, VentureMeter, SourceBadge)

**Files:**
- Modify: `src/components/ui/ScorePill.tsx`
- Modify: `src/components/ui/VentureMeter.tsx`
- Modify: `src/components/ui/SourceBadge.tsx`

Update to match the monochrome design system.

- [ ] **Step 1: Read current ScorePill, VentureMeter, SourceBadge**

Read all three files to understand current implementation before modifying.

- [ ] **Step 2: Update ScorePill to monochrome base**

Update `src/components/ui/ScorePill.tsx`: use monochrome styling for non-verdict scores. Only use verdict colors (green/amber/indigo/red) when displaying verdict-level scores. Reduce border-radius and font-size to match the tighter design.

- [ ] **Step 3: Update VentureMeter to horizontal bars**

Replace the radar chart implementation in `src/components/ui/VentureMeter.tsx` with horizontal bar chart display. Each dimension gets a labeled row with a horizontal bar showing the score (1-5 scale). Use the new monochrome color palette. Remove the Recharts radar dependency — use simple CSS bars.

- [ ] **Step 4: Update SourceBadge to be smaller**

Update `src/components/ui/SourceBadge.tsx`: reduce padding and font-size. Keep brand colors but make them more subtle (lower opacity backgrounds).

- [ ] **Step 5: Verify build**

```bash
cd /Users/ronkaldes/Projects-WLDS/ai6\ Labs\ Studio/ai6-studio && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/ScorePill.tsx src/components/ui/VentureMeter.tsx src/components/ui/SourceBadge.tsx
git commit -m "feat: refactor ScorePill, VentureMeter, SourceBadge to monochrome design"
```

---

## Task 10: Expand Board API Route + Ideas PATCH Endpoint

**Files:**
- Modify: `src/app/api/board/route.ts`
- Modify: `src/app/api/ideas/[id]/route.ts`

Board route currently maps `kill` → `graduated`, everything else → `active_sprint`. Expand to support all four verdict outcomes. Ideas PATCH currently only handles `stage` — expand to support `dvfScores` updates for inline score editing.

- [ ] **Step 1: Read current board route and ideas PATCH route**

Read `src/app/api/board/route.ts` and `src/app/api/ideas/[id]/route.ts` to understand current logic.

- [ ] **Step 2: Update board decision routing**

Modify the POST handler in `src/app/api/board/route.ts` to map all four verdicts. Replace the existing stage assignment logic (line 20: `stage: decision === 'kill' ? 'graduated' : 'active_sprint'`) with:

```ts
const stageMap: Record<string, string> = {
  go: 'active_sprint',
  conditional: 'validating',
  pivot: 'refining',
  kill: 'graduated',
}
const newStage = stageMap[decision] || 'active_sprint'
```

And update the `db.idea.update` call to use `newStage` and reset `daysInStage`:

```ts
await db.idea.update({
  where: { id: idea_id },
  data: {
    stage: newStage,
    daysInStage: 0,
    boardDecision: decision,
    boardRationale: learnings,
    boardVotes: JSON.stringify(votes)
  }
});
```

- [ ] **Step 3: Expand ideas PATCH to support dvfScores**

Update `src/app/api/ideas/[id]/route.ts` to accept and persist `dvfScores` in addition to `stage`:

```ts
data: {
  ...(data.stage && { stage: data.stage, daysInStage: 0 }),
  ...(data.dvfScores && { dvfScores: JSON.stringify(data.dvfScores) }),
}
```

This enables the ScoringTab's inline score editing.

- [ ] **Step 4: Verify build**

```bash
cd /Users/ronkaldes/Projects-WLDS/ai6\ Labs\ Studio/ai6-studio && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/board/route.ts src/app/api/ideas/\[id\]/route.ts
git commit -m "fix: expand board verdict routing and add dvfScores to ideas PATCH"
```

---

## Task 11: Wire Up the Workspace — Replace Dashboard Layout and Pages

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `src/app/(dashboard)/page.tsx`

This is the integration task — replace the old sidebar+topbar+page layout with the new WorkspaceLayout. The single page.tsx becomes the workspace entry point.

**Note:** The WorkspacePage fetches all data and could pass it to Navigator as props to avoid duplicate API calls. However, Navigator also fetches independently for encapsulation. During implementation, consider lifting data fetching to WorkspacePage only and passing signals/ideas as props to Navigator — this halves the initial API calls.

- [ ] **Step 1: Read current dashboard layout and page**

Read `src/app/(dashboard)/layout.tsx` and `src/app/(dashboard)/page.tsx`.

- [ ] **Step 2: Create the workspace page**

Rewrite `src/app/(dashboard)/page.tsx` as a client component that assembles the workspace:

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout'
import { Navigator, type ViewType } from '@/components/workspace/Navigator'
import { DetailView } from '@/components/workspace/DetailView'
import { ContextPanel } from '@/components/workspace/ContextPanel'
import { CommandPalette, useCommandPalette } from '@/components/workspace/CommandPalette'
import { OverviewTab } from '@/components/workspace/tabs/OverviewTab'
import { ScoringTab } from '@/components/workspace/tabs/ScoringTab'
import { AssumptionsTab } from '@/components/workspace/tabs/AssumptionsTab'
import { ExperimentsTab } from '@/components/workspace/tabs/ExperimentsTab'
import { BoardBriefTab } from '@/components/workspace/tabs/BoardBriefTab'
import { ContextEditor } from '@/components/settings/ContextEditor'
import { SkeletonLoader } from '@/components/workspace/SkeletonLoader'
import type { TabId } from '@/components/workspace/TabBar'
import type { Idea, TrendSignal } from '@/types'

export default function WorkspacePage() {
  const router = useRouter()
  const { open: cmdOpen, setOpen: setCmdOpen, close: closeCmdPalette } = useCommandPalette()

  // Navigation state
  const [activeView, setActiveView] = useState<ViewType>('inbox')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<'signal' | 'idea' | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [showSettings, setShowSettings] = useState(false)

  // Data state
  const [selectedItem, setSelectedItem] = useState<Idea | TrendSignal | null>(null)
  const [allSignals, setAllSignals] = useState<TrendSignal[]>([])
  const [allIdeas, setAllIdeas] = useState<Idea[]>([])
  const [loadingItem, setLoadingItem] = useState(false)

  // Fetch all data for command palette and navigator
  const fetchAllData = useCallback(async () => {
    try {
      const [sigRes, ideaRes] = await Promise.all([
        fetch('/api/signals'),
        fetch('/api/ideas'),
      ])
      const sigData = await sigRes.json()
      const ideaData = await ideaRes.json()
      setAllSignals(sigData.signals || [])
      setAllIdeas(ideaData.ideas || [])
    } catch (e) {
      console.error('Failed to fetch data:', e)
    }
  }, [])

  useEffect(() => { fetchAllData() }, [fetchAllData])

  // Fetch selected item detail
  const fetchSelectedItem = useCallback(async () => {
    if (!selectedId || !selectedType) {
      setSelectedItem(null)
      return
    }
    setLoadingItem(true)
    try {
      if (selectedType === 'signal') {
        const sig = allSignals.find(s => s.id === selectedId)
        setSelectedItem(sig || null)
      } else {
        const idea = allIdeas.find(i => i.id === selectedId)
        setSelectedItem(idea || null)
      }
    } finally {
      setLoadingItem(false)
    }
  }, [selectedId, selectedType, allSignals, allIdeas])

  useEffect(() => { fetchSelectedItem() }, [fetchSelectedItem])

  // When switching to board view, auto-select board-brief tab
  const handleViewChange = (view: ViewType) => {
    setActiveView(view)
    setShowSettings(false)
  }

  const handleSelectItem = (id: string, type: 'signal' | 'idea') => {
    setSelectedId(id)
    setSelectedType(type)
    setShowSettings(false)
    // Auto-select appropriate tab
    if (type === 'idea') {
      const idea = allIdeas.find(i => i.id === id)
      if (idea?.stage === 'decision_gate') {
        setActiveTab('board-brief')
      } else {
        setActiveTab('overview')
      }
    }
  }

  const refreshData = () => {
    fetchAllData()
  }

  // Actions
  const handlePromote = async (signalId: string) => {
    try {
      await fetch('/api/signals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: signalId, pipeline_status: 'promoted' }),
      })
      await fetchAllData()
      // Switch to pipeline view to see the new idea
      setActiveView('pipeline')
    } catch (e) {
      console.error('Promote failed:', e)
    }
  }

  const handleArchive = async (signalId: string) => {
    try {
      await fetch('/api/signals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: signalId, pipeline_status: 'archived' }),
      })
      await fetchAllData()
      setSelectedId(null)
      setSelectedItem(null)
    } catch (e) {
      console.error('Archive failed:', e)
    }
  }

  const handleSubmitToBoard = async (ideaId: string) => {
    try {
      await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: ideaId, step: 6, data: { submitted_by: 'Ron' } }),
      })
      await fetchAllData()
      setActiveView('board')
      setActiveTab('board-brief')
    } catch (e) {
      console.error('Submit to board failed:', e)
    }
  }

  const handleTriggerScan = async () => {
    try {
      await fetch('/api/scan', { method: 'POST' })
      await fetchAllData()
      setActiveView('inbox')
    } catch (e) {
      console.error('Scan failed:', e)
    }
  }

  // Render tab content
  const renderTabContent = () => {
    if (loadingItem) return <SkeletonLoader lines={6} />
    if (showSettings) return <ContextEditor />
    if (!selectedItem) return null

    // Signal detail (no tabs)
    if (selectedType === 'signal') {
      const sig = selectedItem as TrendSignal
      return (
        <div className="space-y-4 max-w-2xl">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">AI Summary</div>
          <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">{sig.aiSummary}</p>
          {sig.opportunityCard && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-md p-4 text-[12px] space-y-2">
              {sig.opportunityCard.problem && <div><strong>Problem:</strong> {sig.opportunityCard.problem}</div>}
              {sig.opportunityCard.why_now && <div><strong>Why Now:</strong> {sig.opportunityCard.why_now}</div>}
              {sig.opportunityCard.studio_angle && <div><strong>Studio Angle:</strong> {sig.opportunityCard.studio_angle}</div>}
              {sig.opportunityCard.sprint_hypothesis && <div><strong>Sprint Hypothesis:</strong> {sig.opportunityCard.sprint_hypothesis}</div>}
              {sig.opportunityCard.kill_risks && (
                <div><strong className="text-[var(--score-kill)]">Kill Risks:</strong> {sig.opportunityCard.kill_risks.join(', ')}</div>
              )}
            </div>
          )}
        </div>
      )
    }

    // Idea tabs
    const idea = selectedItem as Idea
    const sourceSignal = idea.sourceSignalId
      ? allSignals.find(s => s.id === idea.sourceSignalId) || null
      : null

    switch (activeTab) {
      case 'overview':
        return <OverviewTab idea={idea} sourceSignal={sourceSignal} onRefreshIdea={refreshData} />
      case 'scoring':
        return <ScoringTab idea={idea} onRefreshIdea={refreshData} />
      case 'assumptions':
        return <AssumptionsTab idea={idea} onRefreshIdea={refreshData} />
      case 'experiments':
        return <ExperimentsTab idea={idea} onRefreshIdea={refreshData} />
      case 'board-brief':
        return <BoardBriefTab idea={idea} />
      default:
        return null
    }
  }

  return (
    <>
      <WorkspaceLayout
        left={
          <Navigator
            activeView={activeView}
            onViewChange={handleViewChange}
            selectedId={selectedId}
            onSelectItem={handleSelectItem}
          />
        }
        center={
          showSettings ? (
            <div className="flex flex-col h-full">
              <div className="px-5 py-3 border-b panel-border">
                <h1 className="text-[15px] font-semibold tracking-tight">Settings</h1>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <ContextEditor />
              </div>
            </div>
          ) : (
            <DetailView
              item={selectedItem}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onPromote={selectedType === 'signal' ? handlePromote : undefined}
              onArchive={selectedType === 'signal' ? handleArchive : undefined}
              onSubmitToBoard={handleSubmitToBoard}
            >
              {renderTabContent()}
            </DetailView>
          )
        }
        right={
          <ContextPanel
            item={selectedItem}
            activeTab={activeTab}
            onRefreshData={refreshData}
          />
        }
      />
      <CommandPalette
        open={cmdOpen}
        onClose={closeCmdPalette}
        ideas={allIdeas}
        signals={allSignals}
        onSelectItem={handleSelectItem}
        onViewChange={handleViewChange}
        onTriggerScan={handleTriggerScan}
      />
    </>
  )
}
```

- [ ] **Step 3: Simplify dashboard layout**

Update `src/app/(dashboard)/layout.tsx` to just render `{children}` without the Sidebar/TopBar wrapper. The WorkspaceLayout is rendered by the page, not the layout.

```tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

- [ ] **Step 4: Verify build**

```bash
cd /Users/ronkaldes/Projects-WLDS/ai6\ Labs\ Studio/ai6-studio && npm run build
```

Expected: Build succeeds. The old pages (trends, pipeline, board, validate, settings) still exist but are no longer linked from navigation.

- [ ] **Step 5: Visually verify**

```bash
cd /Users/ronkaldes/Projects-WLDS/ai6\ Labs\ Studio/ai6-studio && npm run dev
```

Open `http://localhost:3000`. Verify:
- Three-panel layout renders
- Left panel shows views and idea list
- Clicking an item shows detail in center panel
- Tabs work and show correct content
- Right panel shows AI chat / voting based on tab
- Cmd+K opens command palette

- [ ] **Step 6: Commit**

```bash
git add src/app/'(dashboard)'/layout.tsx src/app/'(dashboard)'/page.tsx
git commit -m "feat: wire up workspace layout as main dashboard entry point"
```

---

## Task 12: Cleanup — Remove Old Components and Pages

**Files:**
- Remove: old page files and unused components (see list in File Structure section)

Only do this after Task 11 is verified working.

- [ ] **Step 1: Remove old page files**

Delete the old page routes that are now replaced by the workspace:

```bash
rm src/app/'(dashboard)'/trends/page.tsx
rm src/app/'(dashboard)'/pipeline/page.tsx
rm -rf src/app/'(dashboard)'/validate/
rm src/app/'(dashboard)'/board/page.tsx
rm src/app/'(dashboard)'/settings/context/page.tsx
```

- [ ] **Step 2: Remove old layout components**

```bash
rm src/components/layout/Sidebar.tsx
rm src/components/layout/TopBar.tsx
```

- [ ] **Step 3: Remove old page-specific components that are fully replaced**

```bash
rm src/components/trends/SignalGrid.tsx
rm src/components/trends/SignalCard.tsx
rm src/components/trends/FilterBar.tsx
rm src/components/trends/ScanButton.tsx
rm src/components/pipeline/KanbanBoard.tsx
rm src/components/pipeline/KanbanColumn.tsx
rm src/components/pipeline/IdeaCard.tsx
rm src/components/validate/ValidationStepper.tsx
rm src/components/validate/ProblemRefinement.tsx
rm src/components/validate/OpportunityMemo.tsx
rm src/components/validate/AgentPanel.tsx
rm src/components/validate/BoardSubmission.tsx
rm src/components/board/BoardDashboard.tsx
rm src/components/board/ReviewSession.tsx
```

Keep: `OpportunityCard.tsx`, `AssumptionMap.tsx`, `ExperimentCards.tsx`, `VotingInterface.tsx`, `DecisionLog.tsx`, `ContextEditor.tsx` — these are referenced by the new workspace tabs.

- [ ] **Step 4: Verify build**

```bash
cd /Users/ronkaldes/Projects-WLDS/ai6\ Labs\ Studio/ai6-studio && npm run build
```

If build fails due to broken imports, fix them. The most likely issue is a removed component still being imported somewhere.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove old sidebar, pages, and replaced components"
```

---

## Task 13: Responsive Adjustments

**Files:**
- Modify: `src/components/workspace/WorkspaceLayout.tsx`
- Modify: `src/components/workspace/Navigator.tsx`
- Modify: `src/components/workspace/ContextPanel.tsx`

Add tablet and mobile responsive behavior.

- [ ] **Step 1: Add responsive breakpoints to WorkspaceLayout**

Update `WorkspaceLayout.tsx` to detect screen width and adjust panel behavior:
- Desktop (1024px+): Full three-panel
- Tablet (768-1024px): Left panel auto-collapses to 48px, right panel hidden by default (drawer mode)
- Mobile (<768px): Single panel with bottom tab bar. This is a stretch goal — implement desktop and tablet first, then mobile if time permits.

Use a `useEffect` with `window.matchMedia` to detect breakpoints and auto-collapse panels.

- [ ] **Step 2: Add slide-over drawer for right panel on tablet**

Update `ContextPanel` to render as a slide-over drawer (using shadcn `sheet` component) when on tablet breakpoint. Trigger with a button in the center panel header.

- [ ] **Step 3: Verify build**

```bash
cd /Users/ronkaldes/Projects-WLDS/ai6\ Labs\ Studio/ai6-studio && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/workspace/WorkspaceLayout.tsx src/components/workspace/Navigator.tsx src/components/workspace/ContextPanel.tsx
git commit -m "feat: add responsive behavior for tablet breakpoint"
```

---

## Task 14: Final Build Verification and Settings Integration

**Files:**
- Modify: `src/app/(dashboard)/page.tsx` (if settings view needed)

- [ ] **Step 1: Ensure settings context editor is accessible**

The ContextEditor component (`src/components/settings/ContextEditor.tsx`) needs to be accessible from the workspace. Add it as a view accessible from the user avatar / settings gear in the Navigator. When settings is active, render `ContextEditor` in the center panel instead of idea detail.

- [ ] **Step 2: Full build verification**

```bash
cd /Users/ronkaldes/Projects-WLDS/ai6\ Labs\ Studio/ai6-studio && npm run build
```

Expected: Clean build with no errors.

- [ ] **Step 3: Visual smoke test**

```bash
cd /Users/ronkaldes/Projects-WLDS/ai6\ Labs\ Studio/ai6-studio && npm run dev
```

Walk through all three user journeys:
1. **Scout:** Inbox → click signal → see detail → promote → verify it appears in Pipeline
2. **Validator:** Pipeline → click validating idea → work through tabs → submit to board
3. **Board:** Board → click idea → Board Brief tab → vote → verify stage change

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: integrate settings view and final verification"
```
