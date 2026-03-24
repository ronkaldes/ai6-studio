'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useWorkspace } from './WorkspaceLayout'
import { IdeaListItem } from './IdeaListItem'
import { SkeletonLoader } from './SkeletonLoader'
import { CampaignSelector } from './CampaignSelector'
import { NewCampaignDialog } from './NewCampaignDialog'
import { useWorkspaceData } from './WorkspaceDataProvider'
import type { Idea, TrendSignal, Campaign } from '@/types'
import { Inbox, LayoutDashboard, Vote, Archive, Settings, BarChart3, BookOpen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ViewType = 'inbox' | 'pipeline' | 'board' | 'archive' | 'analytics' | 'learnings'

interface NavigatorProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  selectedId: string | null
  onSelectItem: (id: string, type: 'signal' | 'idea') => void
  onSettingsClick?: () => void
  signals: TrendSignal[]
  ideas: Idea[]
  campaigns: Campaign[]
  activeCampaignId: string | null
  setActiveCampaignId: (id: string | null) => void
  loading: boolean
  scanState?: 'idle' | 'loading' | 'error'
  scanMessage?: string | null
  onRetryScan?: () => void
}

const VIEWS: { key: ViewType; label: string; Icon: LucideIcon }[] = [
  { key: 'inbox', label: 'Inbox', Icon: Inbox },
  { key: 'pipeline', label: 'Pipeline', Icon: LayoutDashboard },
  { key: 'board', label: 'Board', Icon: Vote },
  { key: 'archive', label: 'Archive', Icon: Archive },
  { key: 'learnings', label: 'Learnings', Icon: BookOpen },
  { key: 'analytics', label: 'Analytics', Icon: BarChart3 },
]

export function Navigator({ activeView, onViewChange, selectedId, onSelectItem, onSettingsClick, signals, ideas, campaigns, activeCampaignId, setActiveCampaignId, loading, scanState, scanMessage, onRetryScan }: NavigatorProps) {
  const { leftCollapsed } = useWorkspace()
  const { refresh } = useWorkspaceData()
  const [search, setSearch] = useState('')
  const [showNewCampaign, setShowNewCampaign] = useState(false)

  const filteredItems = getViewItems(activeView, signals, ideas, search, activeCampaignId)

  const inboxCount = signals.filter(s => s.pipelineStatus === 'new').length
  const boardCount = ideas.filter(i => i.stage === 'decision_gate').length

  return (
    <>
      <div className="flex flex-col h-full bg-[var(--bg-surface)]">
      <div className="px-4 py-3 border-b panel-border">
        <div className="font-semibold text-[13px] tracking-tight">
          {leftCollapsed ? 'a6' : 'ai6 Labs'}
        </div>
        {!leftCollapsed && (
          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Studio</div>
        )}
      </div>

      <CampaignSelector
        campaigns={campaigns}
        activeCampaignId={activeCampaignId}
        onSelect={setActiveCampaignId}
        onNew={() => setShowNewCampaign(true)}
        leftCollapsed={leftCollapsed}
      />

      <div className="px-2 py-2 space-y-0.5">
        {VIEWS.map(v => (
          <button
            key={v.key}
            onClick={() => onViewChange(v.key)}
            className={cn(
              'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] font-medium hover-surface cursor-pointer',
              activeView === v.key ? 'bg-[var(--bg-elevated)]' : 'text-[var(--text-secondary)]'
            )}
          >
            <v.Icon size={14} className="text-[var(--text-muted)] flex-shrink-0" />
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

      <div className="px-3 py-3 border-t panel-border flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[var(--bg-elevated)]" />
        {!leftCollapsed && (
          <span className="text-[11px] text-[var(--text-secondary)] flex-1">Ron K.</span>
        )}
        <button
          onClick={onSettingsClick}
          title="Settings"
          className={cn(
            'flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer',
            leftCollapsed ? 'w-full' : 'w-5 h-5'
          )}
        >
          <Settings size={13} />
        </button>
      </div>
    </div>
      {showNewCampaign && (
        <NewCampaignDialog
          onClose={() => setShowNewCampaign(false)}
          onCreated={() => {
            setShowNewCampaign(false)
            refresh()
          }}
        />
      )}
    </>
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
  search: string,
  activeCampaignId: string | null
): ItemGroup[] {
  const q = search.toLowerCase()
  const matchSearch = (title: string) => !q || title.toLowerCase().includes(q)

  switch (view) {
    case 'inbox': {
      let filtered = signals.filter(s => s.pipelineStatus === 'new' && matchSearch(s.title))
      if (activeCampaignId) {
        filtered = filtered.filter(s => s.campaignId === activeCampaignId)
      }
      return [{
        label: '',
        items: filtered.sort((a, b) => b.opportunityScore - a.opportunityScore)
      }]
    }
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
