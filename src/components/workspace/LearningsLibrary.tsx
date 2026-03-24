'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ChevronDown, ChevronUp, Search, Calendar } from 'lucide-react'

interface Learning {
  id: string;
  ideaId: string;
  ideaTitle: string;
  category: string;
  killReason: string;
  keySentence: string;
  tags: string[];
  createdAt: string;
}

export function LearningsLibrary() {
  const [learnings, setLearnings] = useState<Learning[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/learnings')
      .then(r => r.json())
      .then(d => {
        setLearnings(d.learnings || [])
        setLoading(false)
      })
      .catch((e) => {
        console.error('Failed to load learnings', e)
        setLoading(false)
      })
  }, [])

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const filtered = learnings.filter(l => 
    l.ideaTitle.toLowerCase().includes(search.toLowerCase()) || 
    l.keySentence.toLowerCase().includes(search.toLowerCase()) ||
    l.category.toLowerCase().includes(search.toLowerCase()) ||
    l.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin opacity-50 mb-4" />
        <span className="font-mono text-sm uppercase tracking-widest block ml-4">Loading Library...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)]">
      <div className="px-5 py-4 border-b panel-border bg-[var(--bg-elevated)] sticky top-0 z-10">
        <div className="flex flex-col gap-4 max-w-5xl mx-auto">
          <div>
            <h1 className="text-xl font-bold font-display text-foreground">Learnings Library</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Synthesized insights from killed ideas and past board decisions.
            </p>
          </div>
          
          <div className="flex gap-2 relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by title, tag, or keyword..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--bg-base)] border border-[var(--border-dim)] rounded-md focus:border-primary focus:outline-none text-sm shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-surface border border-border/50 rounded-lg">
              <p>No learnings found matching "{search}"</p>
            </div>
          ) : (
            filtered.map(learning => {
              const dateObj = new Date(learning.createdAt)
              const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              const isExpanded = expanded[learning.id]
              
              return (
                <Card 
                  key={learning.id} 
                  className={`border border-[var(--border-base)] shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-surface \${isExpanded ? 'ring-1 ring-primary/20' : ''}`}
                >
                  <div 
                    className="p-4 cursor-pointer flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
                    onClick={() => toggleExpand(learning.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {dateStr}
                        </span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">
                          {learning.category}
                        </Badge>
                        <span className="text-xs font-semibold px-2 truncate w-48 text-foreground">
                          {learning.ideaTitle}
                        </span>
                      </div>
                      <h3 className="text-[15px] font-semibold text-foreground leading-snug">
                        {learning.keySentence}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-muted-foreground">
                      <div className="flex gap-1">
                        {learning.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-[10px] uppercase font-mono bg-transparent">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-[var(--border-dim)] bg-muted/20 text-sm">
                      <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Board Rationale
                      </div>
                      <p className="text-[13px] text-foreground leading-relaxed whitespace-pre-wrap border-l-2 border-amber-500/50 pl-3">
                        {learning.killReason || "No full rationale recorded."}
                      </p>
                    </div>
                  )}
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
