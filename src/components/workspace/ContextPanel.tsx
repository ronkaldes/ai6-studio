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
