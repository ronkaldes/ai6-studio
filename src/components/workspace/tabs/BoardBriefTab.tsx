'use client'

import { ScorePill } from '@/components/ui/ScorePill'
import { BlueprintPanel } from '@/components/tools/BlueprintPanel'
import { SimulationPanel } from '@/components/tools/SimulationPanel'
import type { Idea } from '@/types'

interface BoardBriefTabProps {
  idea: Idea
}

export function BoardBriefTab({ idea }: BoardBriefTabProps) {
  const memo = idea.opportunityMemo

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Venture Score */}
      {idea.ventureScore != null && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-[24px] font-bold">{idea.ventureScore}</span>
          <span className="text-[11px] text-[var(--text-muted)]">/ 100 venture score</span>
          {idea.boardDecision && (
            <ScorePill score={idea.ventureScore} className="ml-2" />
          )}
        </div>
      )}

      {/* Memo Summary */}
      {memo && (
        <section className="bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-md p-4 space-y-3 text-[12px] leading-relaxed">
          <BriefField label="Problem" value={memo.problem} />
          <BriefField label="Customer" value={memo.target_customer} />
          <BriefField label="Solution" value={memo.solution} />
          <BriefField label="Moat" value={memo.moat} />
          <BriefField label="Why Now" value={memo.why_now} />
          <BriefField label="Market" value={memo.market_size} />
          {memo.risks && memo.risks.length > 0 && (
            <div>
              <strong className="text-[var(--score-kill)]">Risks:</strong>{' '}
              <span className="text-[var(--text-secondary)]">{memo.risks.join(' · ')}</span>
            </div>
          )}
        </section>
      )}

      {/* Assumptions Summary */}
      {idea.assumptionMap && idea.assumptionMap.length > 0 && (
        <section>
          <SectionLabel>Critical Assumptions</SectionLabel>
          <div className="space-y-1">
            {idea.assumptionMap
              .filter((a: any) => a.importance > 0.5)
              .slice(0, 5)
              .map((a: any, i: number) => (
                <div key={i} className="text-[12px] text-[var(--text-secondary)] flex items-start gap-2">
                  <span className="text-[var(--text-muted)]">•</span>
                  {a.text}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Board Decision */}
      {idea.boardDecision && (
        <section className="border-t border-[var(--border-dim)] pt-4">
          <SectionLabel>Board Decision</SectionLabel>
          <div className="flex items-center gap-3">
            <VerdictBadge verdict={idea.boardDecision} />
            {idea.boardRationale && (
              <span className="text-[12px] text-[var(--text-secondary)]">
                {idea.boardRationale}
              </span>
            )}
          </div>
        </section>
      )}

      {/* Vote History */}
      {idea.boardVotes && idea.boardVotes.length > 0 && (
        <section>
          <SectionLabel>Votes</SectionLabel>
          <div className="space-y-1">
            {idea.boardVotes.map((vote: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-[12px]">
                <span className="text-[var(--text-primary)] font-medium">{vote.member_name}</span>
                <VerdictBadge verdict={vote.verdict} small />
                {vote.rationale && (
                  <span className="text-[var(--text-muted)] truncate">{vote.rationale}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Strategic Analysis Tools */}
      <section>
        <SectionLabel>Strategic Analysis</SectionLabel>
        <div className="space-y-2">
          <BlueprintPanel idea={idea} />
          <SimulationPanel idea={idea} />
        </div>
      </section>

      {/* Not ready state */}
      {!memo && !idea.ventureScore && (
        <p className="text-[13px] text-[var(--text-muted)]">
          Complete the Overview and Scoring tabs before submitting to the board.
        </p>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
      {children}
    </div>
  )
}

function BriefField({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <strong className="text-[var(--text-primary)]">{label}:</strong>{' '}
      <span className="text-[var(--text-secondary)]">{value}</span>
    </div>
  )
}

function VerdictBadge({ verdict, small }: { verdict: string; small?: boolean }) {
  const colors: Record<string, string> = {
    go: 'bg-[rgba(34,197,94,0.15)] text-[var(--score-go)]',
    conditional: 'bg-[rgba(245,158,11,0.15)] text-[var(--score-cond)]',
    pivot: 'bg-[rgba(99,102,241,0.15)] text-[var(--score-pivot)]',
    kill: 'bg-[rgba(239,68,68,0.15)] text-[var(--score-kill)]',
  }
  return (
    <span className={`${colors[verdict] || ''} ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-1'} rounded font-medium uppercase`}>
      {verdict}
    </span>
  )
}
