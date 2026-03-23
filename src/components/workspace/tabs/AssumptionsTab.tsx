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
      <AssumptionMap idea={idea} onComplete={() => onRefreshIdea()} />
    </div>
  )
}
