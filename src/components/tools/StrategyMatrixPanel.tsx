'use client';

import { useState } from 'react';
import { ToolPanel } from './ToolPanel';
import { Grid3x3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Idea, AIStrategyMatrixResult } from '@/types';

const ambitionOptions = [
  { value: 'optimize', label: 'Optimize' },
  { value: 'differentiate', label: 'Differentiate' },
  { value: 'transform', label: 'Transform' },
  { value: 'disrupt', label: 'Disrupt' },
];

const quadrantColors: Record<string, string> = {
  optimize: 'bg-blue-500/15 text-blue-600 border-blue-400',
  differentiate: 'bg-amber-500/15 text-amber-600 border-amber-400',
  transform: 'bg-purple-500/15 text-purple-600 border-purple-400',
  disrupt: 'bg-red-500/15 text-red-600 border-red-400',
};

export function StrategyMatrixPanel({ idea }: { idea: Idea }) {
  const [productOffering, setProductOffering] = useState('');
  const [operationalModel, setOperationalModel] = useState('');
  const [aiAmbition, setAiAmbition] = useState('optimize');
  const [competitiveLandscape, setCompetitiveLandscape] = useState('');
  const [result, setResult] = useState<AIStrategyMatrixResult | null>(idea.aiStrategyMatrix);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tools/strategy-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productOffering, operationalModel, aiAmbition, competitiveLandscape, ideaId: idea.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Generation failed');
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate strategy matrix');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPanel
      title="AI Strategy Matrix"
      icon={Grid3x3}
      description="Strategic AI positioning analysis"
      accentColor="text-blue-500"
      accentBg="bg-blue-500/10"
      accentBorder="border-blue-500"
      isGenerated={!!result}
      isLoading={loading}
      error={error}
      onGenerate={handleGenerate}
      onRegenerate={() => { setResult(null); setError(null); }}
      inputForm={
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Product/Service</label>
            <textarea value={productOffering} onChange={e => setProductOffering(e.target.value)} placeholder="Describe your core product or service..."
              className="w-full bg-transparent border border-[var(--border-dim)] rounded-md p-2 text-[12px] min-h-[50px] resize-none focus:outline-none focus:border-[var(--border-active)]" />
          </div>
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Operational Model</label>
            <textarea value={operationalModel} onChange={e => setOperationalModel(e.target.value)} placeholder="How does the company currently operate?"
              className="w-full bg-transparent border border-[var(--border-dim)] rounded-md p-2 text-[12px] min-h-[50px] resize-none focus:outline-none focus:border-[var(--border-active)]" />
          </div>
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">AI Ambition</label>
            <select value={aiAmbition} onChange={e => setAiAmbition(e.target.value)}
              className="w-full bg-transparent border border-[var(--border-dim)] rounded-md px-2 py-1.5 text-[12px] focus:outline-none focus:border-[var(--border-active)]">
              {ambitionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Competitive Landscape</label>
            <textarea value={competitiveLandscape} onChange={e => setCompetitiveLandscape(e.target.value)} placeholder="Industry and main competitors..."
              className="w-full bg-transparent border border-[var(--border-dim)] rounded-md p-2 text-[12px] min-h-[50px] resize-none focus:outline-none focus:border-[var(--border-active)]" />
          </div>
        </div>
      }
    >
      {result && (
        <div className="space-y-3">
          <div className={cn('inline-flex items-center gap-2 px-2 py-1 rounded-md border text-[11px] font-bold', quadrantColors[result.strategic_quadrant])}>
            {result.strategic_quadrant.toUpperCase()}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">{result.product_assessment}</p>
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-blue-500">Recommendations</span>
            <div className="space-y-1.5 mt-1">
              {result.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-[var(--bg-base)] rounded-md border border-[var(--border-dim)]">
                  <div className="flex gap-0.5 shrink-0 mt-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className={cn('w-1 h-2.5 rounded-sm', j < r.impact ? 'bg-blue-500' : 'bg-[var(--border-dim)]')} />
                    ))}
                  </div>
                  <div>
                    <h5 className="font-semibold text-[11px]">{r.title}</h5>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{r.description}</p>
                    <span className="text-[9px] font-mono text-[var(--text-muted)]">{r.timeline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ToolPanel>
  );
}
