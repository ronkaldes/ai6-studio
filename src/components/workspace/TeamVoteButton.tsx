'use client'

import { useState, useEffect } from 'react'

export function TeamVoteButton({ ideaId }: { ideaId: string }) {
  const [net, setNet] = useState(0)
  const [myVote, setMyVote] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/ideas/${ideaId}/votes`).then(r => r.json()).then(d => {
      setNet(d.net || 0)
      const mine = (d.votes || []).find((v: { userName: string; vote: number }) => v.userName === 'Ron')
      setMyVote(mine?.vote || null)
    })
  }, [ideaId])

  const vote = async (direction: 1 | -1) => {
    await fetch(`/api/ideas/${ideaId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote: direction, userName: 'Ron' }),
    })
    const refresh = await fetch(`/api/ideas/${ideaId}/votes`).then(r => r.json())
    setNet(refresh.net || 0)
    const mine = (refresh.votes || []).find((v: { userName: string; vote: number }) => v.userName === 'Ron')
    setMyVote(mine?.vote || null)
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => vote(1)}
        className={`w-6 h-6 rounded flex items-center justify-center text-[12px] transition-colors cursor-pointer ${myVote === 1 ? 'bg-[rgba(34,197,94,0.2)] text-[var(--score-go)]' : 'hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}
      >
        ▲
      </button>
      <span className="text-[11px] font-mono font-medium min-w-[20px] text-center">{net}</span>
      <button
        onClick={() => vote(-1)}
        className={`w-6 h-6 rounded flex items-center justify-center text-[12px] transition-colors cursor-pointer ${myVote === -1 ? 'bg-[rgba(239,68,68,0.2)] text-[var(--score-kill)]' : 'hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}
      >
        ▼
      </button>
    </div>
  )
}
