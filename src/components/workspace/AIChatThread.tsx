'use client'

import { useState } from 'react'
import { SkeletonLoader } from './SkeletonLoader'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatThreadProps {
  ideaId: string
  ideaTitle: string
  context?: string  // Additional context based on active tab
}

export function AIChatThread({ ideaId, ideaTitle, context }: AIChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea_id: ideaId,
          step: 1,
          data: { problem_statement: input },
        }),
      })
      const data = await res.json()
      const aiContent = data.feedback || data.result || 'No response generated.'
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get response. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-[11px] text-[var(--text-muted)] text-center py-4">
            Ask about &quot;{ideaTitle}&quot;
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-lg p-2.5 text-[11px] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.15)] text-[var(--text-secondary)]'
                : 'bg-[var(--bg-base)] text-[var(--text-secondary)]'
            }`}
          >
            <div className="text-[10px] text-[var(--text-muted)] mb-1">
              {msg.role === 'user' ? 'You' : 'Claude'}
            </div>
            {msg.content}
          </div>
        ))}
        {loading && <SkeletonLoader lines={3} />}
      </div>

      {/* Input */}
      <div className="p-3 border-t panel-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about this idea..."
            className="flex-1 bg-[var(--bg-base)] border border-[var(--border-dim)] rounded-lg px-3 py-2 text-[11px] text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)]"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-3 py-2 rounded-lg bg-[var(--bg-elevated)] text-[11px] font-medium hover-surface disabled:opacity-30"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
