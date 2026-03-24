'use client'

import { X } from 'lucide-react'
import type { SimilarityMatch } from '@/types'

interface DuplicateCheckDialogProps {
  matches: SimilarityMatch[]
  signalTitle: string
  onPromoteAnyway: () => void
  onViewExisting: (ideaId: string) => void
  onCancel: () => void
}

export function DuplicateCheckDialog({
  matches,
  signalTitle,
  onPromoteAnyway,
  onViewExisting,
  onCancel,
}: DuplicateCheckDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-[var(--bg-surface)] rounded-lg shadow-xl border border-[var(--border-dim)] max-w-md w-full mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-dim)]">
          <div>
            <h2 className="text-[14px] font-semibold">Similar Ideas Found</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              &ldquo;{signalTitle}&rdquo; may overlap with existing ideas
            </p>
          </div>
          <button onClick={onCancel} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-[300px] overflow-y-auto">
          {matches.map(match => (
            <div key={match.ideaId} className="bg-[var(--bg-base)] border border-[var(--border-dim)] rounded-md p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium truncate">{match.title}</span>
                <button
                  onClick={() => onViewExisting(match.ideaId)}
                  className="text-[11px] text-[var(--accent-highlight)] hover:underline whitespace-nowrap cursor-pointer"
                >
                  View →
                </button>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                {match.reason}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 px-5 py-4 border-t border-[var(--border-dim)]">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 rounded-md border border-[var(--border-dim)] text-[12px] font-medium hover-surface cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onPromoteAnyway}
            className="flex-1 px-3 py-2 rounded-md bg-[var(--accent)] text-white text-[12px] font-medium hover:opacity-90 cursor-pointer"
          >
            Promote Anyway
          </button>
        </div>
      </div>
    </div>
  )
}
