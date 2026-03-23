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
