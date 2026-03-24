'use client'

import { useState } from 'react'
import { Plus, Target, CalendarDays, BarChart, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Campaign } from '@/types'

interface CampaignSelectorProps {
  campaigns: Campaign[]
  activeCampaignId: string | null
  onSelect: (id: string | null) => void
  onNew: () => void
  leftCollapsed: boolean
}

export function CampaignSelector({ campaigns, activeCampaignId, onSelect, onNew, leftCollapsed }: CampaignSelectorProps) {
  const [open, setOpen] = useState(false)

  const active = campaigns.find(c => c.id === activeCampaignId)
  const activeLabel = active ? active.name : 'No active campaign'

  return (
    <div className="px-2 py-2 border-b panel-border relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover-surface cursor-pointer",
          active ? "bg-[var(--bg-elevated)]" : "text-[var(--text-secondary)]",
          leftCollapsed && "justify-center"
        )}
      >
        <div className="flex items-center gap-2">
          <Target size={14} className={active ? "text-[var(--accent-highlight)]" : "text-[var(--text-muted)]"} />
          {!leftCollapsed && (
            <span className="text-[12px] font-medium truncate max-w-[120px]">
              {activeLabel}
            </span>
          )}
        </div>
        {!leftCollapsed && <ChevronDown size={14} className="text-[var(--text-muted)]" />}
      </button>

      {open && (
        <div className="absolute top-10 left-2 right-2 bg-[var(--bg-surface)] border panel-border rounded-md shadow-lg z-50 flex flex-col py-1 overflow-hidden">
          <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
            Active Campaigns
          </div>
          
          <button
            onClick={() => { onSelect(null); setOpen(false) }}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover-surface w-full",
              !activeCampaignId && "bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium"
            )}
          >
            <div className="w-4 flex items-center justify-center">
              {!activeCampaignId && <Check size={12} />}
            </div>
            <span>No active campaign</span>
          </button>

          {campaigns.filter(c => c.status === 'active').map(c => (
            <button
              key={c.id}
              onClick={() => { onSelect(c.id); setOpen(false) }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover-surface w-full",
                activeCampaignId === c.id && "bg-[var(--bg-elevated)] text-[var(--accent-highlight)] font-medium"
              )}
            >
              <div className="w-4 flex items-center justify-center">
                {activeCampaignId === c.id && <Check size={12} />}
              </div>
              <span className="flex-1 truncate">{c.name}</span>
            </button>
          ))}
          
          <div className="border-t panel-border mt-1 pt-1">
            <button
              onClick={() => { onNew(); setOpen(false) }}
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover-surface w-full"
            >
              <Plus size={14} />
              <span>New Campaign</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
