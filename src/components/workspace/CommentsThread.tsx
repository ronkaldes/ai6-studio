'use client'

import { useState, useEffect } from 'react'
import type { Comment } from '@/types'

function getUserName(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('studio_user_name') || ''
  }
  return ''
}

export function CommentsThread({ ideaId }: { ideaId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [userName, setUserName] = useState(getUserName)

  useEffect(() => {
    fetch(`/api/ideas/${ideaId}/comments`).then(r => r.json()).then(d => setComments(d.comments || []))
  }, [ideaId])

  const handlePost = async () => {
    if (!newComment.trim()) return
    const authorName = userName.trim() || 'Anonymous'
    // Persist name for future use
    if (userName.trim()) {
      localStorage.setItem('studio_user_name', userName.trim())
    }
    setPosting(true)
    try {
      const res = await fetch(`/api/ideas/${ideaId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, authorName }),
      })
      const { comment } = await res.json()
      setComments(prev => [...prev, comment])
      setNewComment('')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {comments.length === 0 && (
          <div className="text-[11px] text-[var(--text-muted)] text-center py-4">No comments yet</div>
        )}
        {comments.map(c => (
          <div key={c.id} className="text-[12px]">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[var(--text-primary)]">{c.authorName}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-[var(--text-secondary)] mt-0.5 leading-relaxed">{c.content}</p>
          </div>
        ))}
      </div>

      <div className="border-t panel-border p-2 space-y-1.5">
        {!getUserName() && (
          <input
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="Your name..."
            className="w-full bg-[var(--bg-base)] border border-[var(--border-dim)] rounded px-2 py-1 text-[11px] focus:outline-none focus:border-[var(--border-active)]"
          />
        )}
        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handlePost()}
            className="flex-1 bg-[var(--bg-base)] border border-[var(--border-dim)] rounded px-2 py-1.5 text-[12px] focus:outline-none focus:border-[var(--border-active)]"
          />
          <button
            onClick={handlePost}
            disabled={posting || !newComment.trim()}
            className="px-3 py-1.5 rounded bg-[var(--bg-elevated)] text-[11px] font-medium hover-surface disabled:opacity-30"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
