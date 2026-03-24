'use client';

import { useState } from 'react';
import { ToolPanel } from './ToolPanel';
import { Telescope } from 'lucide-react';
import type { FutureScenario } from '@/types';

export function FutureScenarioPanel() {
  const [year, setYear] = useState(2030);
  const [industry, setIndustry] = useState('');
  const [sector, setSector] = useState('');
  const [scenarios, setScenarios] = useState<FutureScenario[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tools/future-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, industry, sector }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Generation failed');
      const data = await res.json();
      setScenarios(data.scenarios);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate scenarios');
    } finally {
      setLoading(false);
    }
  };

  const likelihoodLabel = (n: number) => ['', 'Very Low', 'Low', 'Moderate', 'High', 'Very High'][n] || '';

  return (
    <ToolPanel
      title="Future Scenarios"
      icon={Telescope}
      description="Explore possible futures for an industry"
      accentColor="text-teal-500"
      accentBg="bg-teal-500/10"
      accentBorder="border-teal-500"
      isGenerated={!!scenarios}
      isLoading={loading}
      error={error}
      onGenerate={handleGenerate}
      onRegenerate={() => { setScenarios(null); setError(null); }}
      inputForm={
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Year</label>
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} min={2025} max={2100}
              className="w-full bg-transparent border border-[var(--border-dim)] rounded-md px-2 py-1.5 text-[12px] focus:outline-none focus:border-[var(--border-active)]" />
          </div>
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Industry</label>
            <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Healthcare"
              className="w-full bg-transparent border border-[var(--border-dim)] rounded-md px-2 py-1.5 text-[12px] focus:outline-none focus:border-[var(--border-active)]" />
          </div>
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Sector</label>
            <input value={sector} onChange={e => setSector(e.target.value)} placeholder="e.g. Telemedicine"
              className="w-full bg-transparent border border-[var(--border-dim)] rounded-md px-2 py-1.5 text-[12px] focus:outline-none focus:border-[var(--border-active)]" />
          </div>
        </div>
      }
    >
      {scenarios && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {scenarios.map((s, i) => (
            <div key={i} className="p-3 bg-[var(--bg-base)] border border-[var(--border-dim)] rounded-md flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-[12px]">{s.title}</h4>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-500 shrink-0">
                  {likelihoodLabel(s.likelihood)}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-4">{s.narrative}</p>
              <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-[var(--border-dim)]">
                <div>
                  <span className="text-[9px] font-mono uppercase text-[var(--score-go)] tracking-wider">Opportunities</span>
                  <ul className="text-[10px] text-[var(--text-muted)] mt-1 space-y-0.5">
                    {s.opportunities.slice(0, 3).map((o, j) => <li key={j}>+ {o}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase text-[var(--score-kill)] tracking-wider">Threats</span>
                  <ul className="text-[10px] text-[var(--text-muted)] mt-1 space-y-0.5">
                    {s.threats.slice(0, 3).map((t, j) => <li key={j}>- {t}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToolPanel>
  );
}
