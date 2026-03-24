'use client'

import { AIChatThread } from './AIChatThread'
import { VotingCard } from './VotingCard'
import { CommentsThread } from './CommentsThread'
import { FutureScenarioPanel } from '@/components/tools/FutureScenarioPanel'
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
        {/* Future Scenarios — shown for signals */}
        {!isIdea && (
          <div className="flex-1 overflow-y-auto p-3">
            <FutureScenarioPanel />
          </div>
        )}

        {/* AI Chat — shown for ideas on non-board tabs */}
        {isIdea && activeTab !== 'board-brief' && (
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

      {/* Comments — shown for ideas */}
      {isIdea && (
        <div className="border-t panel-border" style={{ height: '40%' }}>
          <div className="px-4 py-2 border-b panel-border">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Comments</span>
          </div>
          <CommentsThread ideaId={item.id} />
        </div>
      )}

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

function computeActivityEvents(item: Idea | TrendSignal | null, isIdea: boolean): string[] {
  if (!item) return ['No item selected']
  if (!isIdea) return ['Signal discovered']

  const idea = item as Idea
  const events: string[] = []

  if (idea.boardDecision) {
    const icon = { go: '✓', conditional: '~', pivot: '↻', kill: '✕' }[idea.boardDecision] || ''
    events.push(`Board decision: ${icon} ${idea.boardDecision}`)
  }
  if (idea.ventureScore != null) events.push(`Venture score: ${idea.ventureScore}/100`)
  if (idea.dvfScores && idea.dvfScores.length > 0) events.push('DVF scoring complete')
  if (idea.opportunityMemo) events.push('Opportunity memo generated')
  if (idea.sourceSignalId) events.push('Promoted from signal')
  events.push(`Day ${idea.daysInStage} in ${idea.stage.replace('_', ' ')}`)

  return events
}
