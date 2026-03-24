'use client'

import { useState } from 'react'
import { SkeletonLoader } from '../SkeletonLoader'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { ScorePill } from '@/components/ui/ScorePill'
import { PersonaPanel } from '@/components/tools/PersonaPanel'
import { HMWPanel } from '@/components/tools/HMWPanel'
import { BusinessReinventionPanel } from '@/components/tools/BusinessReinventionPanel'
import type { Idea, TrendSignal } from '@/types'

interface OverviewTabProps {
  idea: Idea
  sourceSignal?: TrendSignal | null
  onRefreshIdea: () => void
}

export function OverviewTab({ idea, sourceSignal, onRefreshIdea }: OverviewTabProps) {
  const [problemText, setProblemText] = useState(idea.opportunityMemo?.problem || '')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const generateMemo = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id, step: 2, data: { validated_problem: problemText } }),
      })
      if (!res.ok) throw new Error('Failed to generate memo')
      onRefreshIdea()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const memo = idea.opportunityMemo

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Source Signal */}
      {sourceSignal && (
        <section>
          <SectionLabel>Source Signal</SectionLabel>
          <div className="flex items-center gap-2">
            <SourceBadge source={sourceSignal.source} />
            {sourceSignal.velocitySignal && (
              <span className="text-[12px] text-[var(--text-secondary)]">
                {sourceSignal.velocitySignal}
              </span>
            )}
            <ScorePill score={sourceSignal.opportunityScore} className="ml-1" />
          </div>
        </section>
      )}

      {/* Problem Statement */}
      <section>
        <SectionLabel>Problem</SectionLabel>
        <textarea
          value={problemText}
          onChange={e => setProblemText(e.target.value)}
          placeholder="Describe the core problem this idea addresses..."
          className="w-full bg-transparent border border-[var(--border-dim)] rounded-md p-3 text-[13px] leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] resize-none min-h-[80px]"
        />
      </section>

      {/* Opportunity Memo */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <SectionLabel className="mb-0">Opportunity Memo</SectionLabel>
          {memo && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">
              AI Generated
            </span>
          )}
        </div>

        {generating ? (
          <SkeletonLoader lines={6} />
        ) : memo ? (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-md p-4 space-y-2 text-[12px] leading-relaxed text-[var(--text-secondary)]">
            <MemoField label="Customer" value={memo.target_customer} />
            <MemoField label="Solution" value={memo.solution} />
            <MemoField label="Moat" value={memo.moat} />
            <MemoField label="Why Now" value={memo.why_now} />
            <MemoField label="Market" value={memo.market_size} />
            {memo.risks && memo.risks.length > 0 && (
              <div>
                <strong className="text-[var(--text-primary)]">Risks:</strong>{' '}
                {memo.risks.join(', ')}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={generateMemo}
            disabled={!problemText.trim()}
            className="px-4 py-2 rounded-md bg-[var(--bg-elevated)] text-[12px] font-medium hover-surface disabled:opacity-30"
          >
            Generate with AI
          </button>
        )}

        {error && (
          <div className="mt-2 text-[12px] text-[var(--score-kill)]">{error}</div>
        )}
      </section>

      {/* BOI Innovation Tools */}
      <section>
        <SectionLabel>Innovation Tools</SectionLabel>
        <div className="space-y-2">
          <PersonaPanel idea={idea} />
          <HMWPanel idea={idea} />
          <BusinessReinventionPanel idea={idea} />
        </div>
      </section>
    </div>
  )
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ${className || ''}`}>
      {children}
    </div>
  )
}

function MemoField({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <strong className="text-[var(--text-primary)]">{label}:</strong> {value}
    </div>
  )
}
