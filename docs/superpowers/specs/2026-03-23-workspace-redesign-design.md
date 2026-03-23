# ai6 Labs Studio — Workspace Redesign

**Date:** 2026-03-23
**Status:** Approved
**Scope:** Full UI/UX redesign — information architecture, visual design system, user journeys, component architecture

## Problem Statement

The current ai6 Labs Studio is a functional prototype with five separate pages (Trend Radar, Pipeline, Validation, Board, Settings) connected by a sidebar. The user experience suffers from:

1. **Too many clicks to promote** — getting a signal from discovery into validation requires multiple page transitions
2. **Context loss between stages** — moving between modules loses the thread of what you were working on
3. **No sense of progress** — hard to see at a glance where ideas stand across the pipeline
4. **Heavy validation wizard** — 6 linear steps feels bureaucratic, not exploratory
5. **Generic visual design** — electric-blue-heavy palette lacks the restraint and precision of best-in-class tools

## Design Direction

**Approach: The Workspace** — a three-panel layout inspired by Linear/Superhuman where ideas are always visible in a list, detail opens in a center panel, and a contextual right panel provides AI assistance, activity feeds, and voting.

**Aesthetic:** Linear/Vercel — minimal, monochrome, function-first. White/grey hierarchy with color reserved for semantic meaning (verdicts, sources).

**Urgency model:** Calm workspace with contextual nudges — amber/red color shifts on stale items, badge counts, but no timers or pressure UI.

**Users:** Small team (2-5 people) with role-based workflows — scouts discover signals, validators do deep analysis, board members make decisions.

## Information Architecture

### Navigation Model

The current 5-page sidebar is replaced with a 3-panel workspace.

#### Left Panel — The Navigator (240px, collapsible to 48px)

- **Top:** ai6 logo + team name
- **Views** (not pages):
  - **Inbox** — new signals awaiting triage (replaces Trend Radar as a separate page)
  - **Pipeline** — all ideas grouped by stage (replaces the Kanban page)
  - **Board** — ideas pending board decision (filtered view, not a separate module)
  - **Archive** — graduated + killed ideas
- **Below views:** scrollable idea list for the active view, with search/filter
- **Bottom:** user avatar, settings gear

#### Center Panel — The Detail View (flexible width)

Selecting an idea from the left panel opens it here.

- **Top bar:** idea title, stage badge, assignee, days-in-stage (with amber nudge if stalling)
- **Tab bar** replaces the 6-step wizard:
  - **Overview** — problem statement, opportunity memo, source signal link
  - **Scoring** — DVF dimensions as inline editable cards
  - **Assumptions** — the 2x2 matrix (evidence vs. importance)
  - **Experiments** — experiment design cards
  - **Board Brief** — submission-ready summary + voting results
- Tabs are non-linear — jump to any tab, work in any order
- Empty tabs show a clear "Generate with AI" action
- Each tab shows completion state (dot indicator: empty/half/full)

#### Right Panel — The Context Panel (320px, collapsible)

Contextual and role-aware — shows what's relevant to the current tab:

- On Overview tab → AI assistant chat (refine problem, generate memo)
- On Scoring tab → score breakdown, comparisons to other ideas
- On Board Brief → voting interface, decision history, team comments
- **Activity feed** at the bottom — who did what, when
- Collapses to give center panel full width when focus is needed

### View-to-Stage Mapping

The current 6 pipeline stages stay in the data model, but the UI collapses them into 3 views:

| View | Shows Stages | Purpose |
|---|---|---|
| **Inbox** | Raw signals (not yet ideas) | Triage |
| **Pipeline** | Refining + Validating + Active Sprint | Work |
| **Board** | Decision Gate | Decide |

Archive holds Kill + Graduated. The left panel groups ideas by stage within each view.

### Idea Lifecycle

```
Signal (Inbox)
  │ promote →
Idea (Pipeline: Refining)
  │ validation work begins →
Idea (Pipeline: Validating)
  │ submit to board →
Idea (Board: Decision Gate)
  │ board votes →
  ├─ Go → Active Sprint
  ├─ Conditional → Back to Validating (with feedback)
  ├─ Pivot → Back to Refining (with new direction)
  └─ Kill → Archive (with learnings)
```

## Visual Design System

### Color Palette — Monochrome Shift

| Token | Current | New | Purpose |
|---|---|---|---|
| `--bg-base` | `#0A0F1C` (navy) | `#0A0A0A` (near-black) | Page background |
| `--bg-surface` | `#111827` (blue-grey) | `#141414` (neutral dark) | Cards, panels |
| `--bg-elevated` | `#1A2235` (slate) | `#1C1C1C` (subtle lift) | Modals, dropdowns |
| `--bg-subtle` | `#1E293B` | `#181818` | Hover states |
| `--border-dim` | `#1F2D45` | `#1E1E1E` | Subtle dividers |
| `--border-base` | `#2D3F5A` (blue tint) | `#262626` (neutral) | Standard borders |
| `--border-active` | `#3B82F6` | `#EBEBEB` | Active/focus |
| `--accent` | `#3B82F6` (electric blue) | `#EBEBEB` (white) | Primary actions |
| `--accent-highlight` | — | `#3B82F6` | Interactive highlights only |
| `--text-primary` | `#F1F5F9` | `#EDEDED` | Primary text |
| `--text-secondary` | `#94A3B8` | `#888888` | Secondary text |
| `--text-muted` | `#475569` | `#555555` | Muted/tertiary |

Verdict colors remain semantic and unchanged:
- `--score-go`: `#22C55E` (green)
- `--score-cond`: `#F59E0B` (amber)
- `--score-pivot`: `#6366F1` (indigo)
- `--score-kill`: `#EF4444` (red)

Source brand colors remain unchanged (GitHub purple, Reddit orange, etc.).

### Typography

| Element | Font | Size | Weight | Spacing |
|---|---|---|---|---|
| Page/idea title | DM Sans | 15px | 600 | -0.3px |
| Section header | DM Sans | 13px | 600 | -0.2px |
| Body text | DM Sans | 13px | 400 | normal |
| List item | DM Sans | 12px | 500 | normal |
| Metadata/scores | JetBrains Mono | 10px | 400 | normal |
| Stage divider labels | DM Sans | 10px | 600 | 1px (uppercase) |

Key change: JetBrains Mono reserved only for data (scores, timestamps, day counters). No uppercase labels except stage dividers in the left panel.

### Spacing

- Between sections: 24px
- Within components: 8px
- Card padding: 12px
- Border radius: 6px (reduced from 12-16px)
- Panel gaps: 1px border dividers (no gap)

### Micro-interactions

- Hover: background shift (`#141414` → `#1C1C1C`), no elevation/shadow
- Selected item: 2px left border accent (white), not full ring
- Transitions: 150ms ease-out (faster than current 300ms)
- Loading: skeleton shimmer (not spinners)
- AI streaming: text appears inline, character by character

## User Journeys

### Journey 1: The Scout (Signal Discovery)

**Role:** Discovers and triages new signals.

```
Open app → Inbox view (default landing)
  → Scan list of new signals (sorted by opportunity score)
  → Click signal → center panel shows summary, source, AI analysis
  → Right panel: AI proactively highlights why this is interesting
  → Decision: "Promote to Pipeline →" or "Archive"
  → Promote = one click, idea created, appears in Pipeline instantly
  → Scout moves to next signal
```

**Improvement over current:** Promote is a single action with zero page transitions. Switching to Pipeline view shows the idea already there.

### Journey 2: The Validator (Deep Analysis)

**Role:** Conducts validation analysis on promoted ideas.

```
Open app → Pipeline view → ideas grouped by stage
  → Click idea in "Validating" group → center panel opens with Overview tab
  → Work across tabs in any order:
      Overview: refine problem statement (AI assists in right panel)
      Scoring: click "Generate DVF Scores" → AI fills inline, editable
      Assumptions: drag assumptions on 2x2 matrix
      Experiments: add/edit experiment cards
  → Each tab shows completion state (dot: empty/half/full)
  → When all tabs substantive → "Submit to Board" appears in header
  → Submit moves idea to Board stage automatically
```

**Improvement over current:** No linear wizard. Tabs are independent. AI adapts to whichever tab is active.

### Journey 3: The Board Member (Decision Making)

**Role:** Reviews validated ideas and votes on verdicts.

```
Open app → Board view (ideas pending decision, badge shows count)
  → Click idea → center panel shows Board Brief tab auto-selected
  → Board Brief = read-only summary: memo, scores, assumptions, experiments
  → Right panel: voting interface
      → Pick verdict: Go / Conditional / Pivot / Kill
      → Add rationale (required)
      → See other votes (if team has voted)
  → After voting → idea moves based on consensus
  → Decision logged in activity feed
```

**Improvement over current:** Board is a filtered view of the same workspace, not a separate full-screen modal. Same mental model, less context switching.

### Urgency Layer

Ambient signals woven into existing elements — no dedicated pressure UI:

- **Day counter** in idea header: neutral grey days 1-3, amber at day 5, red at day 7+
- **Inbox badge count**: new signals since last visit
- **Board badge**: ideas awaiting your vote (red if > 24h)
- **Stale stage warning**: subtle amber left-border on ideas stuck > 5 days
- **No timers, no progress bars, no countdown UI**

## Component Architecture

### Components to Keep (Refactored)

| Component | Change |
|---|---|
| `ScorePill` | Monochrome base, verdict colors only for Go/Kill/Pivot/Cond |
| `SourceBadge` | Keep brand colors, reduce physical size |
| `VentureMeter` | Horizontal bar chart (replaces radar chart) |
| `AssumptionMap` | Keep 2x2 matrix, tighten to monochrome styling |
| shadcn/ui primitives | Keep all (`button`, `card`, `input`, `dialog`, etc.) — restyle via CSS variables |

### Components to Remove

| Component | Replaced By |
|---|---|
| `Sidebar.tsx` | Navigator panel (left panel) |
| `TopBar.tsx` | Center panel header bar |
| `KanbanBoard.tsx` / `KanbanColumn.tsx` | Pipeline list view (grouped by stage) |
| `ValidationStepper.tsx` | Tab bar in center panel |
| `SignalGrid.tsx` | Inbox list view |
| `BoardDashboard.tsx` | Board filtered view |
| `ReviewSession.tsx` | Standard idea detail with Board Brief tab |
| `ScanButton.tsx` | Action in Navigator panel header or Cmd+K palette |

### New Components

| Component | Purpose |
|---|---|
| `WorkspaceLayout` | Three-panel shell with resize handles and collapse toggles |
| `Navigator` | Left panel: views, search, idea list grouped by stage |
| `DetailView` | Center panel: header bar, tab bar, tab content |
| `ContextPanel` | Right panel: AI chat, activity feed, voting (contextual) |
| `IdeaListItem` | Compact list row for left panel (title, score, stage, days) |
| `TabBar` | Horizontal tabs replacing the validation stepper |
| `AIChatThread` | Conversational AI interface for right panel |
| `VotingCard` | Inline verdict voting widget for right panel |
| `StageIndicator` | Subtle urgency badges (day counter with color shifts) |
| `CommandPalette` | `Cmd+K` quick navigation: search ideas, switch views, trigger actions |
| `SkeletonLoader` | Shimmer loading states for all data-fetching areas |

### Error Handling

The existing 3-state pattern (idle | loading | error) is retained on all AI actions. Changes:

- Loading states: skeleton shimmer replaces spinners
- Error states: inline error message with retry action (no modal)
- AI streaming: text streams inline, error falls back to retry prompt
- `maxDuration = 120` on all AI API routes (unchanged)

## Responsive Strategy

| Breakpoint | Layout |
|---|---|
| **Desktop (1024px+)** | Full three-panel layout |
| **Tablet (768-1024px)** | Left panel collapses to icon-only (48px). Right panel becomes slide-over drawer. Two visible panels. |
| **Mobile (<768px)** | Single panel. Bottom tab bar (Inbox, Pipeline, Board, Settings). Idea detail is a pushed view. Right panel is a bottom sheet (swipe up). |

**Mobile-specific:** Pipeline view becomes a grouped list (collapsible stage sections). No Kanban drag-and-drop on mobile. Back button returns to list.

## Data Model Impact

No schema changes required. The existing Prisma models (`TrendSignal`, `Idea`, `BoardSession`, `User`, `ProjectContext`) support this redesign fully. The changes are purely presentational:

- `TrendSignal` maps to Inbox items
- `Idea` with stage field maps to Pipeline/Board views
- `BoardSession` maps to voting in the right panel
- Pipeline stages are grouped in the UI, not restructured in the database

## API Impact

No new API routes required. Existing routes support all interactions:

- `GET/PATCH /api/signals` — Inbox triage
- `GET/POST/PATCH /api/ideas` — Pipeline management
- `POST /api/validate` — AI actions per tab
- `POST /api/board` — Voting
- `POST /api/scan` — Signal scanning (triggered from Cmd+K or nav)
- `GET/POST /api/context` — Settings

## Dependencies

No new dependencies required. The existing stack supports everything:

- **Layout:** CSS Grid/Flexbox (no library needed for panels)
- **Resize handles:** CSS `resize` or lightweight custom hook
- **Animations:** Framer Motion (already installed)
- **Drag-and-drop:** dnd-kit retained for assumption map only (Kanban removed)
- **Charts:** Recharts retained for horizontal bar charts
- **Command palette:** Custom component using `dialog` + search (no library needed)

## Out of Scope

- Light mode / theme toggle
- Real-time collaboration (WebSocket/presence)
- Notification system
- User role permissions (all users see all views)
- Onboarding flow
- Export/reporting features
