import { AgentScore } from '@/types';
import { Card } from './card';

export function VentureMeter({ agents }: { agents: AgentScore[] }) {
  const get = (agent: string, field: string): number => {
    const a = agents.find((s) => s.dimension === agent);
    return ((a as any)?.[field] as number) ?? 3;
  };

  const desirability      = (get('market_analyst', 'desirability') + get('customer_advocate', 'user_desirability')) / 2;
  const strategicFit      = get('market_analyst', 'market_size'); // Placeholder proxy for Strategic Fit
  const marketSize        = get('market_analyst', 'market_size');
  const techFeasibility   = get('technical_architect', 'feasibility');
  const revenuePath       = get('vc_evaluator', 'revenue_path');
  const distribution      = get('distribution_strategist', 'distribution_leverage');
  const whyNow            = get('vc_evaluator', 'viability');

  const raw =
    desirability    * 0.20 +
    strategicFit    * 0.20 +
    marketSize      * 0.15 +
    techFeasibility * 0.15 +
    revenuePath     * 0.15 +
    distribution    * 0.10 +
    whyNow          * 0.05;

  const score = Math.round((raw / 5) * 100);

  const scoreColor = score >= 75 ? 'var(--score-go)' :
                     score >= 55 ? 'var(--score-cond)' :
                     score >= 35 ? 'var(--score-pivot)' :
                     'var(--score-kill)';

  return (
    <Card className="p-6 md:p-8 bg-surface border-border overflow-hidden relative shadow-md">
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: scoreColor }} />
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pl-4">
        
        <div className="flex flex-col items-center justify-center shrink-0 w-44">
          <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-2">Venture Score</span>
          <span className="text-7xl font-display font-bold tabular-nums tracking-tighter" style={{ color: scoreColor }}>
            {score}
          </span>
          <span className="text-xs uppercase font-bold tracking-wider mt-2 px-3 py-1 bg-background/50 rounded-md border border-border/50" style={{ color: scoreColor }}>
            {score >= 75 ? 'GO - Ready' : score >= 55 ? 'Conditional' : score >= 35 ? 'Pivot Required' : 'Kill - Unviable'}
          </span>
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6 w-full border-t md:border-t-0 md:border-l border-border/50 pt-6 md:pt-0 md:pl-8">
          <Metric label="Desirability" val={desirability} w="20%" color="bg-blue-500" />
          <Metric label="Feasibility" val={techFeasibility} w="15%" color="bg-teal-500" />
          <Metric label="Revenue Path" val={revenuePath} w="15%" color="bg-purple-500" />
          <Metric label="Distribution" val={distribution} w="10%" color="bg-amber-500" />
          <Metric label="Market Size" val={marketSize} w="15%" color="bg-blue-400" />
          <Metric label="Why Now" val={whyNow} w="5%" color="bg-indigo-500" />
        </div>

      </div>
    </Card>
  );
}

function Metric({ label, val, w, color }: { label: string, val: number, w: string, color: string }) {
  const pct = (val / 5) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-xs font-bold text-foreground tabular-nums">{val.toFixed(1)} <span className="opacity-40 text-[10px] font-normal tracking-wide ml-1">({w})</span></span>
      </div>
      <div className="h-[5px] w-full bg-muted/60 rounded-full overflow-hidden border border-border/20">
        <div 
          className={`h-full ${color} opacity-80 rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${pct}%` }} 
        />
      </div>
    </div>
  );
}
