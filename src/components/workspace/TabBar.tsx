'use client'

import { cn } from '@/lib/utils'

export type TabId = 'overview' | 'scoring' | 'assumptions' | 'experiments' | 'board-brief' | 'retrospective'

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
