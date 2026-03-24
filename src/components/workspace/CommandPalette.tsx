'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { Idea, TrendSignal } from '@/types'
import type { ViewType } from './Navigator'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  ideas: Idea[]
  signals: TrendSignal[]
  onSelectItem: (id: string, type: 'signal' | 'idea') => void
  onViewChange: (view: ViewType) => void
  onTriggerScan: () => void
  scanning?: boolean
}

interface CommandItem {
  id: string
  label: string
  description: string
  action: () => void
  category: string
}

export function CommandPalette({
  open,
  onClose,
  ideas,
  signals,
  onSelectItem,
  onViewChange,
  onTriggerScan,
  scanning = false,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{
    signals: any[], ideas: any[], learnings: any[]
  }>({ signals: [], ideas: [], learnings: [] })
  const [searching, setSearching] = useState(false)

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  // Fetch search results
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults({ signals: [], ideas: [], learnings: [] })
      setSearching(false) // Ensure searching is false when query is empty
      return
    }
    setSearching(true)
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(res => res.json())
      .then(data => {
        setSearchResults(data)
        setSearching(false)
      })
      .catch((e) => {
        console.error('Search error', e)
        setSearching(false)
      })
  }, [debouncedQuery])

  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  let items: CommandItem[] = []
  
  if (!query) {
    items = [
      // Views
      { id: 'v-inbox', label: 'Inbox', description: 'View new signals', action: () => { onViewChange('inbox'); onClose() }, category: 'Views' },
      { id: 'v-pipeline', label: 'Pipeline', description: 'View ideas in progress', action: () => { onViewChange('pipeline'); onClose() }, category: 'Views' },
      { id: 'v-board', label: 'Board', description: 'View pending decisions', action: () => { onViewChange('board'); onClose() }, category: 'Views' },
      { id: 'v-archive', label: 'Archive', description: 'View completed/killed ideas', action: () => { onViewChange('archive'); onClose() }, category: 'Views' },
      // Actions
      { id: 'a-scan', label: scanning ? 'Scanning...' : 'Trigger Scan', description: scanning ? 'Claude is scanning for signals…' : 'Scan for new signals', action: () => { if (!scanning) { onTriggerScan(); onClose() } }, category: 'Actions' },
      // Ideas (from props, when no search query)
      ...ideas.map(i => ({
        id: `i-${i.id}`,
        label: i.title,
        description: `${i.stage} · Score ${i.ventureScore ?? '—'}`,
        action: () => { onSelectItem(i.id, 'idea'); onClose() },
        category: 'Ideas',
      })),
      // Signals (from props, when no search query)
      ...signals.filter(s => s.pipelineStatus === 'new').map(s => ({
        id: `s-${s.id}`,
        label: s.title,
        description: `${s.source} · ${s.opportunityScore}`,
        action: () => { onSelectItem(s.id, 'signal'); onClose() },
        category: 'Signals',
      })),
    ]
  } else {
    items = [
      // Actions (still available during search)
      { id: 'a-scan', label: scanning ? 'Scanning...' : 'Trigger Scan', description: scanning ? 'Claude is scanning for signals…' : 'Scan for new signals', action: () => { if (!scanning) { onTriggerScan(); onClose() } }, category: 'Actions' },
      
      // Async Ideas
      ...searchResults.ideas.map(i => ({
        id: `i-${i.id}`,
        label: i.title,
        description: `Idea ${i.stage} · ${(i.summary || '').substring(0, 60)}...`,
        action: () => { onSelectItem(i.id, 'idea'); onClose() },
        category: 'Ideas',
      })),
      // Async Signals
      ...searchResults.signals.map(s => ({
        id: `s-${s.id}`,
        label: s.title,
        description: `Signal Score ${s.score} · ${(s.summary || '').substring(0, 60)}...`,
        action: () => { onSelectItem(s.id, 'signal'); onClose() },
        category: 'Signals',
      })),
      // Async Board Learnings
      ...searchResults.learnings.map(l => ({
        id: `l-${l.id}`,
        label: `Learning: ${l.ideaTitle}`,
        description: `${l.killReason ? 'Killed' : 'Insight'}: ${(l.keySentence || '').substring(0, 50)}...`,
        action: () => { onSelectItem(l.ideaId, 'idea'); onClose() },
        category: 'Board Decisions',
      }))
    ]
  }

  const grouped = items.reduce<Record<string, CommandItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item)
    return acc
  }, {})

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="p-0 bg-[var(--bg-elevated)] border-[var(--border-base)] max-w-md top-[20%] translate-y-0">
        {/* Search */}
        <div className="px-4 py-3 border-b panel-border">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search or jump to..."
            autoFocus
            className="w-full bg-transparent text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto py-2 relative">
          {searching && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--border-dim)] overflow-hidden">
              <div className="h-full bg-[var(--accent-highlight)] w-1/3 animate-[slide_1s_ease-in-out_infinite]" />
            </div>
          )}
          {Object.entries(grouped).map(([category, categoryItems]) => (
            <div key={category}>
              <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                {category}
              </div>
              {categoryItems.slice(0, 8).map(item => {
                const isDisabled = item.id === 'a-scan' && scanning
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    disabled={isDisabled}
                    className={`w-full text-left px-4 py-2 hover-surface flex items-center justify-between${isDisabled ? ' opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-[12px] font-medium">{item.label}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{item.description}</span>
                  </button>
                )
              })}
            </div>
          ))}
          {items.length === 0 && !searching && (
            <div className="px-4 py-6 text-center text-[12px] text-[var(--text-muted)]">
              No results found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Hook to register Cmd+K keyboard shortcut */
export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return { open, setOpen, close: () => setOpen(false) }
}
