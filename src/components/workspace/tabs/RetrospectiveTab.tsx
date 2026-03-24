'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2 } from 'lucide-react'
import type { Idea, SprintRetrospective } from '@/types'

interface RetrospectiveTabProps {
  idea: Idea
  onRefreshIdea: () => void
}

export function RetrospectiveTab({ idea, onRefreshIdea }: RetrospectiveTabProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [retro, setRetro] = useState<Partial<SprintRetrospective>>({
    hypothesisValidated: 'partially',
    actualOutcome: '',
    ventureScoreAccuracy: 3,
    materializedKillRisks: [],
    keyLearning: '',
    wouldBuildAgain: 'yes'
  })

  // Kill risks from the memo
  const availableRisks = idea.opportunityMemo?.risks || []

  useEffect(() => {
    fetch(`/api/retrospectives?ideaId=${idea.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.retro) {
          setRetro(d.retro)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [idea.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/retrospectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: idea.id, ...retro })
      })
      if (res.ok) {
        onRefreshIdea()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <section className="space-y-4">
        <div className="flex items-center gap-2">
           <div className="w-1 h-1 bg-indigo-500 rounded-full" />
           <h3 className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Experiment Outcome</h3>
        </div>
        
        <div className="space-y-6 bg-surface p-5 rounded-lg border border-border/50 shadow-sm">
          <div className="space-y-3">
            <label className="text-sm font-semibold block">Was the hypothesis validated?</label>
            <div className="flex gap-6">
              {['yes', 'partially', 'no'].map((val) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="hypothesisValidated"
                    value={val}
                    checked={retro.hypothesisValidated === val}
                    onChange={() => setRetro(r => ({ ...r, hypothesisValidated: val as any }))}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm capitalize group-hover:text-foreground transition-colors">{val}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold block">Actual Outcome & Observations</label>
            <Textarea 
              placeholder="What specifically happened during the sprint? (e.g. '0 clicks on landing page' or '3 users said they already use Excel')"
              value={retro.actualOutcome}
              onChange={e => setRetro(r => ({ ...r, actualOutcome: e.target.value }))}
              className="min-h-[100px] bg-background/50 border-border/50 focus:border-indigo-500/50 text-[13px]"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
           <div className="w-1 h-1 bg-amber-500 rounded-full" />
           <h3 className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Studio Predictions</h3>
        </div>
        
        <div className="space-y-6 bg-surface p-5 rounded-lg border border-border/50 shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold">Venture Score Accuracy</label>
              <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                Studio Score: {idea.ventureScore}% | Accuracy: {retro.ventureScoreAccuracy}/5
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground italic -mt-2">How well did the AI-generated score predict this outcome?</p>
            <Slider 
              min={1} max={5} step={1} 
              value={[retro.ventureScoreAccuracy || 3]} 
              onValueChange={(val: any) => setRetro(r => ({ ...r, ventureScoreAccuracy: Array.isArray(val) ? val[0] : val }))}
              className="py-4"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
              <span>Way Off</span>
              <span>Predictive</span>
            </div>
          </div>

          {availableRisks.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-border/30">
              <label className="text-sm font-semibold block">Which Kill Risks Materialized?</label>
              <div className="grid gap-2 border-l-2 border-red-200 pl-4 py-1">
                {availableRisks.map((risk, idx) => (
                  <label key={idx} className="flex items-center gap-3 py-1 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={retro.materializedKillRisks?.includes(risk)}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setRetro(r => ({
                          ...r,
                          materializedKillRisks: checked 
                            ? [...(r.materializedKillRisks || []), risk]
                            : (r.materializedKillRisks || []).filter(x => x !== risk)
                        }))
                      }}
                      className="w-4 h-4 rounded text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="text-[13px] group-hover:text-foreground transition-colors leading-tight">
                      {risk}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
           <div className="w-1 h-1 bg-green-500 rounded-full" />
           <h3 className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Synthesis</h3>
        </div>
        
        <div className="space-y-6 bg-surface p-5 rounded-lg border border-border/50 shadow-sm">
          <div className="space-y-3">
            <label className="text-sm font-semibold block">Key Learning</label>
            <Textarea 
              placeholder="What is the #1 lesson learned for the studio?"
              value={retro.keyLearning || ''}
              onChange={e => setRetro(r => ({ ...r, keyLearning: e.target.value }))}
              className="bg-background/50 border-border/50 focus:border-indigo-500/50 text-[13px]"
            />
          </div>

          <div className="space-y-3 border-t border-border/50 pt-4">
            <label className="text-sm font-semibold block">Would you build this again knowing what you know now?</label>
            <div className="flex gap-6 pt-1">
              {[
                { val: 'yes', label: 'Yes' },
                { val: 'with_changes', label: 'With Changes' },
                { val: 'no', label: 'No' }
              ].map((opt) => (
                <label key={opt.val} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="wouldBuildAgain"
                    value={opt.val}
                    checked={retro.wouldBuildAgain === opt.val}
                    onChange={() => setRetro(r => ({ ...r, wouldBuildAgain: opt.val as any }))}
                    className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm group-hover:text-foreground transition-colors">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4 gap-3 border-t border-border/50 pb-8">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-[0.98]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          {saving ? 'Saving...' : 'Save Retrospective'}
        </Button>
      </div>
    </div>
  )
}
