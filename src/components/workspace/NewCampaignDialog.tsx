'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface NewCampaignDialogProps {
  onClose: () => void
  onCreated: () => void
}

export function NewCampaignDialog({ onClose, onCreated }: NewCampaignDialogProps) {
  const [name, setName] = useState('')
  const [domainFocus, setDomainFocus] = useState('')
  const [minScore, setMinScore] = useState(6)
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, domainFocus, minScore, deadline }),
      })
      if (res.ok) {
        onCreated()
      } else {
        alert('Failed to create campaign')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-[var(--bg-surface)] w-full max-w-md rounded-xl shadow-2xl border panel-border flex flex-col p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">New Sprint Campaign</h2>
          <button onClick={onClose} className="p-1 hover-surface rounded-md text-[var(--text-muted)]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">Campaign Name *</label>
            <input
              required
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Q3 AI Dev Tools"
              className="px-3 py-2 rounded-md bg-[var(--bg-elevated)] border panel-border text-[13px] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">Domain Focus</label>
            <input
              value={domainFocus}
              onChange={e => setDomainFocus(e.target.value)}
              placeholder="e.g. tools for backend engineers"
              className="px-3 py-2 rounded-md bg-[var(--bg-elevated)] border panel-border text-[13px] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">
              Minimum Signal Score: {minScore}
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={minScore}
              onChange={e => setMinScore(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="px-3 py-2 rounded-md bg-[var(--bg-elevated)] border panel-border text-[13px] outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-4 py-2 text-[13px] flex items-center gap-2"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
