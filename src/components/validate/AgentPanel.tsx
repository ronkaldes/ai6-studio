'use client';

import { useState } from 'react';
import { Idea, AgentScore } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { VentureMeter } from '@/components/ui/VentureMeter';

// Color map
const agentStyles: Record<string, { color: string; bg: string; border: string; title: string }> = {
  market_analyst: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500', title: 'Market Analyst' },
  technical_architect: { color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500', title: 'Technical Architect' },
  vc_evaluator: { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500', title: 'VC Evaluator' },
  distribution_strategist: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500', title: 'Distribution Strategist' },
  customer_advocate: { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500', title: 'Customer Advocate' },
  red_team: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive', title: 'Red Team Challenger' }
};

export function AgentPanel({ idea, onComplete }: { idea: Idea, onComplete: (idea: Idea) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id, step: 3, data: {} })
      });
      if (!res.ok) throw new Error(await res.text());
      const { agents } = await res.json();
      onComplete({ ...idea, dvfScores: agents });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scoring failed');
    } finally {
      setLoading(false);
    }
  };

  const scores = idea.dvfScores as AgentScore[] | null;

  if (scores) {
    // Sort to ensure Red Team is last
    const sorted = [...scores].sort((a, b) => {
      if (a.dimension === 'red_team') return 1;
      if (b.dimension === 'red_team') return -1;
      return 0;
    });

    return (
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="flex justify-between items-center mb-2 border-b border-border/50 pb-5">
           <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <span className="text-primary italic font-serif">III.</span> DVF Agent Synthesis
          </h2>
          <Button onClick={() => onComplete(idea)} size="sm">Continue <Loader2 className="ml-2 h-3 w-3 hidden"/></Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((s, i) => {
            const style = agentStyles[s.dimension] || agentStyles.market_analyst;
            const isRedTeam = s.dimension === 'red_team';
            return (
              <motion.div
                key={s.dimension}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className={cn(isRedTeam && "lg:col-span-3 lg:w-2/3 lg:mx-auto")}
              >
                <Card className={cn(
                  "p-5 h-full border-l-[3px] flex flex-col gap-4 relative overflow-hidden transition-all hover:bg-surface/80",
                  style.border,
                  isRedTeam ? "bg-destructive/5 border shadow-md shadow-destructive/10" : "bg-surface shadow-sm"
                )}>
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <h4 className={cn("font-bold text-[11px] uppercase tracking-widest font-mono", style.color)}>
                      {style.title}
                    </h4>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground/90 italic flex-1 border-l-2 border-border/50 pl-3">
                    "{s.rationale}"
                  </p>

                  {/* Render the specific scores if not red team */}
                  {!isRedTeam && Object.entries(s as any).filter(([k,v]) => typeof v === 'number' && k !== 'confidence').map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between mt-auto bg-background/60 px-3 py-1.5 rounded-md border border-border/40">
                      <span className="text-[10px] font-mono text-foreground/70 uppercase tracking-wider">{k.replace('_', ' ')}</span>
                      <span className={cn("font-bold text-sm tabular-nums", style.color)}>{v as number}/5</span>
                    </div>
                  ))}

                  {/* Red Team specific rendering */}
                  {isRedTeam && (s as any).kill_risks && (
                    <div className="mt-2 space-y-3 bg-destructive/10 p-4 rounded-md border border-destructive/20">
                       <span className="text-destructive font-bold text-[10px] tracking-widest uppercase font-mono">⚠ Verified Kill Risks:</span>
                       <ul className="list-disc pl-5 space-y-1.5 marker:text-destructive/50">
                         {(s as any).kill_risks.map((kr: string, idx: number) => (
                           <li key={idx} className="text-sm text-foreground/90">{kr}</li>
                         ))}
                       </ul>
                       <div className="mt-4 pt-3 border-t border-destructive/20 flex items-center justify-between">
                         <span className="text-[10px] uppercase tracking-widest text-destructive/70 font-mono">Verdict</span>
                         <span className="font-black text-destructive text-lg">{(s as any).verdict}</span>
                       </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5, type: 'spring' }}
          className="mt-6"
        >
          <VentureMeter agents={scores} />
        </motion.div>
        
        <div className="flex justify-end mt-4">
           <Button onClick={() => onComplete(idea)} className="bg-primary px-8 h-12 text-base shadow-lg shadow-primary/20">Proceed to Assumption Map</Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-8 md:p-12 bg-surface border-border max-w-4xl mx-auto flex flex-col items-center justify-center text-center min-h-[400px]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-display text-foreground mb-4">Multi-Agent DVF Scoring</h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Six independent AI agents will evaluate the Opportunity Memo across Desirability, Viability, and Feasibility dimensions.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border-l-2 border-destructive text-destructive text-sm text-center w-full max-w-md">
          {error}
        </div>
      )}

      <Button 
        onClick={handleScore} 
        disabled={loading} 
        size="lg"
        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.3)] h-12 px-8 text-base"
      >
        {loading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : null}
        {loading ? 'Running 6 parallel agents...' : 'Initialize Agent Panel'}
      </Button>
    </Card>
  );
}
