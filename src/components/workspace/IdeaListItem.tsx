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
