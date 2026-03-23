'use client'

import { useState } from 'react'
import { ExperimentCards } from '@/components/validate/ExperimentCards'
import { SkeletonLoader } from '../SkeletonLoader'
import type { Idea } from '@/types'

interface ExperimentsTabProps {
  idea: Idea
  onRefreshIdea: () => void
}

export function ExperimentsTab({ idea, onRefreshIdea }: ExperimentsTabProps) {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const hasExperiments = idea.experiments && idea.experiments.length > 0

  const generateExperiments = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id, step: 5, data: { experiments: [] } }),
      })
      if (!res.ok) throw new Error('Failed to generate experiments')
      onRefreshIdea()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  if (generating) return <SkeletonLoader lines={4} />

  if (!hasExperiments) {
    return (
      <div className="space-y-4">
        <p className="text-[13px] text-[var(--text-secondary)]">
          No experiments designed yet. Generate from your top assumptions.
        </p>
        <button
          onClick={generateExperiments}
          disabled={!idea.assumptionMap || idea.assumptionMap.length === 0}
          className="px-4 py-2 rounded-md bg-[var(--bg-elevated)] text-[12px] font-medium hover-surface disabled:opacity-30"
        >
          Generate with AI
        </button>
        {error && <div className="text-[12px] text-[var(--score-kill)]">{error}</div>}
      </div>
    )
  }

  return (
    <div>
      <ExperimentCards idea={idea} onComplete={() => onRefreshIdea()} />
    </div>
  )
}
