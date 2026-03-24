'use client';

import { useState } from 'react';
import { ToolPanel } from './ToolPanel';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Idea, AISimulationResult } from '@/types';

const options = {
  scenario: ['Process Automation', 'Customer Experience', 'Product Innovation', 'Full Transformation'],
  budget: ['Minimal', 'Moderate', 'Significant', 'Transformative'],
  dataStrategy: ['Basic Analytics', 'Advanced Analytics', 'ML-Driven', 'AI-Native'],
  businessGoal: ['Cost Reduction', 'Revenue Growth', 'Market Expansion', 'Competitive Advantage'],
  integrationApproach: ['Phased', 'Parallel', 'Big Bang', 'Hybrid'],
};

function SelectField({ label, value, onChange, items }: { label: string; value: string; onChange: (v: string) => void; items: string[] }) {
  return (
    <div>
      <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-transparent border border-[var(--border-dim)] rounded-md px-2 py-1.5 text-[12px] focus:outline-none focus:border-[var(--border-active)]">
        <option value="">Select...</option>
        {items.map(i => <option key={i} value={i.toLowerCase().replace(/\s+/g, '_')}>{i}</option>)}
      </select>
    </div>
  );
}

export function SimulationPanel({ idea }: { idea: Idea }) {
  const [scenario, setScenario] = useState('');
  const [budget, setBudget] = useState('');
  const [dataStrategy, setDataStrategy] = useState('');
  const [businessGoal, setBusinessGoal] = useState('');
  const [integrationApproach, setIntegrationApproach] = useState('');
  const [result, setResult] = useState<AISimulationResult | null>(idea.aiSimulation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tools/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, budget, dataStrategy, businessGoal, integrationApproach, ideaId: idea.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Simulation failed');
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPanel
      title="AI Transformation Simulator"
      icon={Play}
      description="Simulate transformation outcomes"
      accentColor="text-rose-500"
      accentBg="bg-rose-500/10"
      accentBorder="border-rose-500"
      isGenerated={!!result}
      isLoading={loading}
      error={error}
      onGenerate={handleGenerate}
      onRegenerate={() => { setResult(null); setError(null); }}
      inputForm={
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Scenario" value={scenario} onChange={setScenario} items={options.scenario} />
          <SelectField label="Budget" value={budget} onChange={setBudget} items={options.budget} />
          <SelectField label="Data Strategy" value={dataStrategy} onChange={setDataStrategy} items={options.dataStrategy} />
          <SelectField label="Business Goal" value={businessGoal} onChange={setBusinessGoal} items={options.businessGoal} />
          <SelectField label="Integration" value={integrationApproach} onChange={setIntegrationApproach} items={options.integrationApproach} />
        </div>
      }
    >
      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border-dim)" strokeWidth="4" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" className="text-rose-500"
                  strokeWidth="4" strokeDasharray={`${result.success_probability * 1.76} 176`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-rose-500">{result.success_probability}%</span>
            </div>
            <div>
              <h4 className="font-semibold text-[12px]">Success Probability</h4>
              <p className="text-[10px] text-[var(--text-muted)]">Based on scenario parameters</p>
            </div>
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-rose-500">Projected Outcomes</span>
            <div className="space-y-1 mt-1">
              {result.projected_outcomes.map((o, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-base)] rounded border border-[var(--border-dim)] text-[11px]">
                  <span className="text-[var(--text-muted)]">{o.metric}</span>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="text-[var(--text-muted)]">{o.baseline}</span>
                    <span>→</span>
                    <span className="text-rose-500 font-bold">{o.projected}</span>
                    <span className={cn('px-1 py-0.5 rounded text-[9px]',
                      o.confidence > 70 ? 'bg-green-500/10 text-green-600' : o.confidence > 40 ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-500')}>
                      {o.confidence}%
                    </span>
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
