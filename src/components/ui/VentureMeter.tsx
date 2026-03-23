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

  const dimensions = [
    { label: 'Desirability',  val: desirability,    weight: '20%' },
    { label: 'Strategic Fit', val: strategicFit,    weight: '20%' },
    { label: 'Market Size',   val: marketSize,       weight: '15%' },
    { label: 'Feasibility',   val: techFeasibility,  weight: '15%' },
    { label: 'Revenue Path',  val: revenuePath,      weight: '15%' },
    { label: 'Distribution',  val: distribution,     weight: '10%' },
    { label: 'Why Now',       val: whyNow,           weight: '5%'  },
  ];

  return (
    <Card className="p-6 md:p-8 bg-surface border-border overflow-hidden relative shadow-md">
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: scoreColor }} />
      <div className="flex flex-col md:flex-row items-start gap-8 pl-4">

        {/* Score total */}
        <div className="flex flex-col items-center justify-center shrink-0 w-44">
          <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-2">Venture Score</span>
          <span className="text-7xl font-display font-bold tabular-nums tracking-tighter" style={{ color: scoreColor }}>
            {score}
          </span>
          <span className="text-xs uppercase font-bold tracking-wider mt-2 px-3 py-1 bg-background/50 rounded-md border border-border/50" style={{ color: scoreColor }}>
            {score >= 75 ? 'GO - Ready' : score >= 55 ? 'Conditional' : score >= 35 ? 'Pivot Required' : 'Kill - Unviable'}
          </span>
        </div>

        {/* Horizontal bar dimensions */}
        <div className="flex-1 flex flex-col gap-3 w-full border-t md:border-t-0 md:border-l border-border/50 pt-6 md:pt-0 md:pl-8">
          {dimensions.map(({ label, val, weight }) => (
            <DimensionBar key={label} label={label} val={val} weight={weight} />
          ))}
        </div>

      </div>
    </Card>
  );
}

function DimensionBar({ label, val, weight }: { label: string; val: number; weight: string }) {
  const pct = (val / 5) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-[10px] font-mono uppercase tracking-widest text-muted-foreground truncate">{label}</span>
      <div className="flex-1 h-[5px] bg-muted/60 rounded-sm overflow-hidden border border-border/20">
        <div
          className="h-full bg-foreground/40 rounded-sm transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-[11px] font-bold tabular-nums text-foreground">{val.toFixed(1)}</span>
      <span className="w-7 shrink-0 text-right text-[9px] text-muted-foreground opacity-50">{weight}</span>
    </div>
  );
}
