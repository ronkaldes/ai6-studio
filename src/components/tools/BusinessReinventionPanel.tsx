'use client';

import { useState } from 'react';
import { ToolPanel } from './ToolPanel';
import { RefreshCw } from 'lucide-react';
import type { Idea, BusinessReinventionResult } from '@/types';

export function BusinessReinventionPanel({ idea }: { idea: Idea }) {
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [challenge, setChallenge] = useState('');
  const [result, setResult] = useState<BusinessReinventionResult | null>(idea.businessReinvention);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tools/business-reinvention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, industry, challenge, ideaId: idea.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Generation failed');
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const impactColor = (v: string) => v === 'high' ? 'text-[var(--score-go)]' : v === 'medium' ? 'text-[var(--score-cond)]' : 'text-[var(--text-muted)]';

  return (
    <ToolPanel
      title="Business Reinvention"
      icon={RefreshCw}
      description="AI transformation insights for the business"
      accentColor="text-emerald-500"
      accentBg="bg-emerald-500/10"
      accentBorder="border-emerald-500"
      isGenerated={!!result}
      isLoading={loading}
      error={error}
      onGenerate={handleGenerate}
      onRegenerate={() => { setResult(null); setError(null); }}
      inputForm={
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Company</label>
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name"
                className="w-full bg-transparent border border-[var(--border-dim)] rounded-md px-2 py-1.5 text-[12px] focus:outline-none focus:border-[var(--border-active)]" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Industry</label>
              <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Manufacturing"
                className="w-full bg-transparent border border-[var(--border-dim)] rounded-md px-2 py-1.5 text-[12px] focus:outline-none focus:border-[var(--border-active)]" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Main Challenge</label>
            <textarea value={challenge} onChange={e => setChallenge(e.target.value)} placeholder="Describe the main challenge..."
              className="w-full bg-transparent border border-[var(--border-dim)] rounded-md p-2 text-[12px] min-h-[50px] resize-none focus:outline-none focus:border-[var(--border-active)]" />
          </div>
        </div>
      }
    >
      {result && (
        <div className="space-y-3">
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{result.current_state_analysis}</p>
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-500">AI Opportunities</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
              {result.ai_opportunities.map((opp, i) => (
                <div key={i} className="p-2 bg-[var(--bg-base)] border border-[var(--border-dim)] rounded-md">
                  <h5 className="font-semibold text-[11px]">{opp.title}</h5>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{opp.description}</p>
                  <div className="flex gap-3 mt-1 text-[9px] font-mono">
                    <span>Impact: <span className={impactColor(opp.impact)}>{opp.impact}</span></span>
                    <span>Effort: {opp.effort}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-[var(--text-primary)] bg-emerald-500/10 p-2 rounded-md border border-emerald-500/20">
            <span className="text-[9px] font-mono uppercase text-emerald-600">First Step:</span> {result.recommended_first_step}
          </div>
        </div>
      )}
    </ToolPanel>
  );
}
