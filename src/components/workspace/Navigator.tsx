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
  onSettingsClick?: () => void
}

const VIEWS: { key: ViewType; label: string; icon: string }[] = [
  { key: 'inbox', label: 'Inbox', icon: '◆' },
  { key: 'pipeline', label: 'Pipeline', icon: '▦' },
  { key: 'board', label: 'Board', icon: '◎' },
  { key: 'archive', label: 'Archive', icon: '◇' },
]

export function Navigator({ activeView, onViewChange, selectedId, onSelectItem, onSettingsClick }: NavigatorProps) {
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

  const filteredItems = getViewItems(activeView, signals, ideas, search)

  const inboxCount = signals.filter(s => s.pipelineStatus === 'new').length
  const boardCount = ideas.filter(i => i.stage === 'decision_gate').length

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)]">
      <div className="px-4 py-3 border-b panel-border">
        <div className="font-semibold text-[13px] tracking-tight">
          {leftCollapsed ? 'a6' : 'ai6 Labs'}
        </div>
        {!leftCollapsed && (
          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Studio</div>
        )}
      </div>

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
            'flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors',
            leftCollapsed ? 'w-full' : 'w-5 h-5'
          )}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
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
