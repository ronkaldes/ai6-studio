'use client'

import { useState } from 'react'
import type { BoardVerdict } from '@/types'

interface VotingCardProps {
  ideaId: string
  existingVotes?: any[]
  onVoteSubmitted: () => void
}

const VERDICTS: { key: BoardVerdict; label: string; color: string }[] = [
  { key: 'go', label: 'Go', color: 'var(--score-go)' },
  { key: 'conditional', label: 'Conditional', color: 'var(--score-cond)' },
  { key: 'pivot', label: 'Pivot', color: 'var(--score-pivot)' },
  { key: 'kill', label: 'Kill', color: 'var(--score-kill)' },
]

const MEMBERS = ['Pankaj', 'Offir', 'Leor', 'Leeor', 'Asher', 'Ron']

export function VotingCard({ ideaId, existingVotes = [], onVoteSubmitted }: VotingCardProps) {
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedVerdict, setSelectedVerdict] = useState<BoardVerdict | null>(null)
  const [rationale, setRationale] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submitVote = async () => {
    if (!selectedMember || !selectedVerdict || !rationale.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const vote = {
        member_name: selectedMember,
        member_email: `${selectedMember.toLowerCase()}@ai6labs.com`,
        verdict: selectedVerdict,
        rationale,
        voted_at: new Date().toISOString(),
      }
      const allVotes = [...existingVotes, vote]
      const res = await fetch('/api/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea_id: ideaId,
          votes: allVotes,
          decision: selectedVerdict,
          learnings: rationale,
        }),
      })
      if (!res.ok) throw new Error('Failed to submit vote')
      onVoteSubmitted()
      setSelectedVerdict(null)
      setRationale('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Member Selector */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
          Voting as
        </div>
        <div className="flex flex-wrap gap-1">
          {MEMBERS.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMember(m)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                selectedMember === m
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Verdict Buttons */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
          Verdict
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {VERDICTS.map(v => (
            <button
              key={v.key}
              onClick={() => setSelectedVerdict(v.key)}
              className={`px-3 py-2 rounded-md text-[11px] font-medium uppercase transition-colors border ${
                selectedVerdict === v.key
                  ? `border-[${v.color}] text-[${v.color}] bg-[rgba(255,255,255,0.03)]`
                  : 'border-[var(--border-dim)] text-[var(--text-muted)] hover:border-[var(--border-base)]'
              }`}
              style={selectedVerdict === v.key ? { borderColor: v.color, color: v.color } : {}}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rationale */}
      <div>
        <textarea
          value={rationale}
          onChange={e => setRationale(e.target.value)}
          placeholder="Rationale (required)..."
          rows={3}
          className="w-full bg-[var(--bg-base)] border border-[var(--border-dim)] rounded-md px-3 py-2 text-[11px] text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={submitVote}
        disabled={!selectedMember || !selectedVerdict || !rationale.trim() || submitting}
        className="w-full py-2 rounded-md bg-[var(--bg-elevated)] text-[12px] font-medium hover-surface disabled:opacity-30"
      >
        {submitting ? 'Submitting...' : 'Cast Vote'}
      </button>

      {error && <div className="text-[11px] text-[var(--score-kill)]">{error}</div>}

      {/* Existing Votes */}
      {existingVotes.length > 0 && (
        <div className="border-t panel-border pt-3">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
            Votes Cast
          </div>
          {existingVotes.map((v: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-[11px] mb-1">
              <span className="font-medium text-[var(--text-primary)]">{v.member_name}</span>
              <span className="uppercase text-[10px]" style={{
                color: VERDICTS.find(vd => vd.key === v.verdict)?.color
              }}>
                {v.verdict}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
