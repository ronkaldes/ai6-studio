'use client'

import { cn } from '@/lib/utils'
import { PanelRight, PanelRightClose } from 'lucide-react'
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
  children: React.ReactNode
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
                className="text-[12px] font-medium px-3 py-1.5 rounded-md bg-[var(--bg-elevated)] hover-surface cursor-pointer"
              >
                Promote to Pipeline →
              </button>
            )}
            {onArchive && (
              <button
                onClick={() => onArchive(item.id)}
                className="text-[12px] text-[var(--text-muted)] px-3 py-1.5 rounded-md border border-[var(--border-dim)] hover-surface cursor-pointer"
              >
                Archive
              </button>
            )}
          </div>
        )}

        {isIdea && onSubmitToBoard && (item as Idea).dvfScores && (item as Idea).dvfScores!.length > 0 && (item as Idea).opportunityMemo && (item as Idea).stage !== 'decision_gate' && (item as Idea).stage !== 'graduated' && (
          <button
            onClick={() => onSubmitToBoard(item.id)}
            className="text-[12px] font-medium px-3 py-1.5 rounded-md bg-[var(--bg-elevated)] hover-surface cursor-pointer"
          >
            Submit to Board →
          </button>
        )}

        <button
          onClick={toggleRight}
          className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] ml-2 cursor-pointer"
        >
          {rightCollapsed ? <PanelRight size={14} /> : <PanelRightClose size={14} />}
        </button>
      </div>

      {isIdea && tabs.length > 0 && (
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      )}

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
