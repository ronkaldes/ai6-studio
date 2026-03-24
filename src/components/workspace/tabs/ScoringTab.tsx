'use client'

import { useState } from 'react'
import { SkeletonLoader } from '../SkeletonLoader'
import { StrategyMatrixPanel } from '@/components/tools/StrategyMatrixPanel'
import type { Idea, AgentScore } from '@/types'

const DIMENSIONS = [
  { key: 'desirability', label: 'Desirability', weight: '20%' },
  { key: 'strategic_fit', label: 'Strategic Fit', weight: '20%' },
  { key: 'market_size', label: 'Market Size', weight: '15%' },
  { key: 'technical_feasibility', label: 'Tech Feasibility', weight: '15%' },
  { key: 'revenue_path', label: 'Revenue Path', weight: '15%' },
  { key: 'distribution_leverage', label: 'Distribution', weight: '10%' },
  { key: 'why_now', label: 'Why Now', weight: '5%' },
]

interface ScoringTabProps {
  idea: Idea
  onRefreshIdea: () => void
}

export function ScoringTab({ idea, onRefreshIdea }: ScoringTabProps) {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const scores = idea.dvfScores || []

  const generateScores = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id, step: 3, data: {} }),
      })
      if (!res.ok) throw new Error('Failed to generate scores')
      onRefreshIdea()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  // NOTE: Score editing depends on Task 10 Step 3 (PATCH endpoint expansion).
  // Until that step is done, edited scores won't persist. AI generation works immediately.
  const updateScore = async (dimension: string, newValue: number) => {
    // Update score locally then persist
    const updatedScores = scores.map((s: AgentScore) => {
      if (s.dimension === dimension) {
        return { ...s, scores: { ...s.scores, [dimension]: newValue } }
      }
      return s
    })
    try {
      await fetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dvfScores: updatedScores }),
      })
      onRefreshIdea()
    } catch (e) {
      console.error('Failed to update score', e)
    }
  }

  if (generating) {
    return <SkeletonLoader lines={7} />
  }

  if (scores.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-[13px] text-[var(--text-secondary)]">
          No scores yet. Generate DVF scores using AI agents.
        </p>
        <button
          onClick={generateScores}
          className="px-4 py-2 rounded-md bg-[var(--bg-elevated)] text-[12px] font-medium hover-surface"
        >
          Generate with AI
        </button>
        {error && <div className="text-[12px] text-[var(--score-kill)]">{error}</div>}
      </div>
    )
  }

  // Extract scores from agent results
  const scoreMap: Record<string, { value: number; rationale: string }> = {}
  for (const agent of scores) {
    if (agent.scores) {
      for (const [key, val] of Object.entries(agent.scores)) {
        scoreMap[key] = { value: val as number, rationale: agent.rationale || '' }
      }
    }
  }

  return (
    <div className="space-y-3 max-w-2xl">
      {/* Venture Score Summary */}
      {idea.ventureScore != null && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Venture Score
          </span>
          <span className="font-mono text-[20px] font-bold">
            {idea.ventureScore}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">/ 100</span>
        </div>
      )}

      {/* Dimension Cards */}
      {DIMENSIONS.map(dim => {
        const data = scoreMap[dim.key]
        const value = data?.value ?? 0
        const barWidth = (value / 5) * 100

        return (
          <div key={dim.key} className="border border-[var(--border-dim)] rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-medium">{dim.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--text-muted)]">{dim.weight}</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={value}
                  onChange={e => updateScore(dim.key, Number(e.target.value))}
                  className="w-10 bg-[var(--bg-base)] border border-[var(--border-dim)] rounded px-1.5 py-0.5 text-center font-mono text-[12px] focus:outline-none focus:border-[var(--border-active)]"
                />
                <span className="text-[10px] text-[var(--text-muted)]">/ 5</span>
              </div>
            </div>
            {/* Bar */}
            <div className="h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--text-secondary)] rounded-full transition-all duration-150"
                style={{ width: `${barWidth}%` }}
              />
            </div>
            {data?.rationale && (
              <p className="mt-2 text-[11px] text-[var(--text-muted)] leading-relaxed">
                {data.rationale}
              </p>
            )}
          </div>
        )
      })}

      {error && <div className="text-[12px] text-[var(--score-kill)]">{error}</div>}

      {/* AI Strategy Matrix Tool */}
      <div className="mt-4 pt-4 border-t border-[var(--border-dim)]">
        <StrategyMatrixPanel idea={idea} />
      </div>
    </div>
  )
}
