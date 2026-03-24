'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'

interface OpportunityCard {
  problem?: string
  why_now?: string
  studio_angle?: string
  sprint_hypothesis?: string
  kill_risks?: string[]
}

interface CardDiffViewProps {
  originalCard: OpportunityCard
  newCard: OpportunityCard
  onApply: (merged: OpportunityCard) => void
  onCancel: () => void
}

type DiffSelection = 'old' | 'new'

export function CardDiffView({ originalCard, newCard, onApply, onCancel }: CardDiffViewProps) {
  const fields = ['problem', 'why_now', 'studio_angle', 'sprint_hypothesis', 'kill_risks'] as const
  
  const [selections, setSelections] = useState<Record<string, DiffSelection>>(() => {
    const initial: Record<string, DiffSelection> = {}
    fields.forEach(f => initial[f] = 'new') // Default to picking the newly regenerated data
    return initial
  })

  const handleApply = () => {
    const merged: Record<string, any> = {}
    fields.forEach(f => {
      merged[f] = selections[f] === 'old' ? originalCard[f] : newCard[f]
    })
    onApply(merged as OpportunityCard)
  }

  const renderDiffSection = (label: string, field: typeof fields[number]) => {
    const oldVal = originalCard[field] || ''
    const newVal = newCard[field] || ''
    
    // Arrays stringified for comparison
    const oldStr = Array.isArray(oldVal) ? oldVal.join('\n• ') : oldVal || ''
    const newStr = Array.isArray(newVal) ? newVal.join('\n• ') : newVal || ''
    
    const isChanged = oldStr !== newStr
    const isKillRisk = field === 'kill_risks'

    return (
      <div className="flex flex-col gap-2 mb-6" key={field}>
        <div className="flex items-center justify-between">
          <h4 className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
            {label}
            {isChanged && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase font-semibold">Changed</span>}
          </h4>
          
          {isChanged && (
            <div className="flex bg-[var(--bg-elevated)] rounded p-1 border border-[var(--border-dim)]">
              <button 
                onClick={() => setSelections(s => ({ ...s, [field]: 'old' }))}
                className={`px-2 py-1 text-[11px] rounded transition-colors ${selections[field] === 'old' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'}`}
              >
                Keep Old
              </button>
              <button 
                onClick={() => setSelections(s => ({ ...s, [field]: 'new' }))}
                className={`px-2 py-1 text-[11px] rounded transition-colors ${selections[field] === 'new' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'}`}
              >
                Use New
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-md border text-[13px] leading-relaxed whitespace-pre-wrap ${selections[field] === 'old' ? 'border-indigo-400 bg-indigo-50/50 shadow-sm' : 'border-[var(--border-dim)] bg-[var(--bg-elevated)] opacity-50 grayscale'}`}>
            {oldStr ? (Array.isArray(oldVal) ? '• ' + oldStr : oldStr) : <span className="italic text-[var(--text-muted)]">Empty</span>}
          </div>
          <div className={`p-3 rounded-md border text-[13px] leading-relaxed whitespace-pre-wrap ${selections[field] === 'new' ? isKillRisk ? 'border-red-400 bg-red-50/50 shadow-sm' : 'border-amber-400 bg-amber-50/50 shadow-sm' : 'border-[var(--border-dim)] bg-[var(--bg-elevated)] opacity-50 grayscale'}`}>
            {newStr ? (Array.isArray(newVal) ? '• ' + newStr : newStr) : <span className="italic text-[var(--text-muted)]">Empty</span>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] rounded-md border border-[var(--border-base)] overflow-hidden shadow-lg animate-in fade-in zoom-in-95">
      <div className="px-4 py-3 border-b flex items-center justify-between bg-[var(--bg-elevated)]">
        <div>
          <h3 className="font-semibold text-sm">Review Card Changes</h3>
          <p className="text-[11px] text-[var(--text-muted)]">Compare regenerated AI outputs to your current card.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-xs rounded border border-[var(--border-dim)] hover:bg-[var(--bg-surface)] flex items-center gap-1">
            <X size={14} /> Cancel
          </button>
          <button onClick={handleApply} className="px-3 py-1.5 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1 shadow-sm">
            <Check size={14} /> Apply Merged Changes
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-4 mb-3 px-1">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Current Card</div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">Generated Changes</div>
        </div>
        
        {renderDiffSection('Problem', 'problem')}
        {renderDiffSection('Why Now', 'why_now')}
        {renderDiffSection('Studio Angle', 'studio_angle')}
        {renderDiffSection('Sprint Hypothesis', 'sprint_hypothesis')}
        {renderDiffSection('Kill Risks', 'kill_risks')}
      </div>
    </div>
  )
}
