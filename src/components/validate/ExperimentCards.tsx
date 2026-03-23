'use client';

import { useState } from 'react';
import { Idea, AssumptionItem, ExperimentCard, ExperimentMethod, ExperimentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const METHODS: ExperimentMethod[] = ['interview', 'smoke_test', 'landing_page', 'concierge', 'wizard_of_oz', 'pre_sale'];

export function ExperimentCards({ idea, onComplete }: { idea: Idea, onComplete: (idea: Idea) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with existing experiments, or auto-generate empty shells for top 3 "Test First" assumptions
  const initialExperiments = (idea.experiments as ExperimentCard[]) || [];
  
  const autoGen = initialExperiments.length === 0 ? (() => {
    const map = (idea.assumptionMap || []) as AssumptionItem[];
    const testFirst = map.filter(a => a.importance >= 0.5 && a.evidence < 0.5)
                         .sort((a,b) => b.importance - a.importance)
                         .slice(0, 3);
                         
    return testFirst.map((a, i) => ({
      id: `exp-${Date.now()}-${i}`,
      assumption: a.text,
      hypothesis: `If we build this, we validate ${a.text.substring(0,30)}... by measuring...`,
      method: 'interview' as ExperimentMethod,
      success_metric: '3 out of 5 users agree to...',
      timeline_days: 7,
      status: 'not_started' as ExperimentStatus
    }));
  })() : initialExperiments;

  const [experiments, setExperiments] = useState<ExperimentCard[]>(autoGen);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id, step: 5, data: { experiments } })
      });
      if (!res.ok) throw new Error(await res.text());
      onComplete({ ...idea, experiments: experiments as any });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const updateExp = (id: string, field: keyof ExperimentCard, value: any) => {
    setExperiments(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <div className="flex justify-between items-center border-b border-border/50 pb-5">
         <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <span className="text-primary italic font-serif">V.</span> Experiment Design
        </h2>
        <Button onClick={handleSave} disabled={loading || experiments.length === 0} size="sm">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
          Save & Proceed
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border-l-2 border-destructive text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {experiments.map((exp, i) => (
          <Card key={exp.id} className="p-6 bg-surface border-border shadow-sm flex flex-col gap-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-xs text-primary uppercase font-mono tracking-widest bg-primary/10 px-3 py-1 rounded inline-block">Experiment {i + 1}</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 bg-muted/10 p-5 rounded border border-border/30">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono ml-1">Core Assumption to Test</label>
                <Textarea 
                  value={exp.assumption} 
                  onChange={e => updateExp(exp.id, 'assumption', e.target.value)}
                  className="h-24 bg-background text-sm resize-none focus:border-primary border-border/50 shadow-inner"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono ml-1">Test Hypothesis</label>
                <Textarea 
                  value={exp.hypothesis} 
                  onChange={e => updateExp(exp.id, 'hypothesis', e.target.value)}
                  className="h-24 bg-background text-sm resize-none focus:border-primary border-border/50 shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 items-end">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono ml-1">Method</label>
                <select 
                  className="w-full h-10 rounded-md bg-background border border-border/50 px-3 text-sm overflow-hidden outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 shadow-sm"
                  value={exp.method}
                  onChange={e => updateExp(exp.id, 'method', e.target.value)}
                >
                  {METHODS.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                </select>
              </div>

              <div className="space-y-3 col-span-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono ml-1">Success Metric</label>
                <Input 
                  value={exp.success_metric} 
                  onChange={e => updateExp(exp.id, 'success_metric', e.target.value)}
                  className="h-10 bg-background text-sm focus:border-primary border-border/50 shadow-sm"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono ml-1">Timeline (Days)</label>
                <Input 
                  type="number"
                  value={exp.timeline_days} 
                  onChange={e => updateExp(exp.id, 'timeline_days', parseInt(e.target.value))}
                  className="h-10 bg-background text-sm focus:border-primary border-border/50 shadow-sm"
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setExperiments(prev => prev.filter(e => e.id !== exp.id))} className="text-destructive hover:bg-destructive/10 hover:text-destructive text-xs">
                <Trash2 className="mr-2 h-3 w-3" /> Remove Experiment
              </Button>
            </div>
          </Card>
        ))}

        <Button 
          variant="outline" 
          className="w-full border-dashed border-border hover:bg-muted/20 text-muted-foreground h-16 flex items-center justify-center tracking-widest uppercase font-mono text-xs"
          onClick={() => setExperiments(prev => [...prev, {
            id: `exp-${Date.now()}`, assumption: '', hypothesis: '', method: 'interview', success_metric: '', timeline_days: 7, status: 'not_started'
          }])}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Custom Experiment
        </Button>
      </div>
    </div>
  );
}
