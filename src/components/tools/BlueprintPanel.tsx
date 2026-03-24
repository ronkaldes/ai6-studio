'use client';

import { useState } from 'react';
import { ToolPanel } from './ToolPanel';
import { Map } from 'lucide-react';
import type { Idea, AIBlueprintResult } from '@/types';

const adoptionLevels = ['exploring', 'piloting', 'scaling', 'transforming'];
const goalOptions = ['Increase efficiency', 'Improve customer experience', 'Develop AI-driven products', 'Achieve autonomous operations'];
const dataInfraOptions = ['basic', 'developing', 'mature', 'advanced'];
const challengeOptions = ['Leadership buy-in', 'Lack of AI expertise', 'Data infrastructure', 'Resistance to change', 'Security/compliance', 'Business model uncertainty'];

export function BlueprintPanel({ idea }: { idea: Idea }) {
  const [industry, setIndustry] = useState('');
  const [adoptionLevel, setAdoptionLevel] = useState('exploring');
  const [goals, setGoals] = useState<string[]>([]);
  const [dataInfra, setDataInfra] = useState('basic');
  const [challenges, setChallenges] = useState<string[]>([]);
  const [result, setResult] = useState<AIBlueprintResult | null>(idea.aiBlueprint);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tools/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry, adoptionLevel, goals, dataInfra, challenges, ideaId: idea.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Generation failed');
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate blueprint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPanel
      title="AI Reinvention Blueprint"
      icon={Map}
      description="Comprehensive AI transformation roadmap"
      accentColor="text-indigo-500"
      accentBg="bg-indigo-500/10"
      accentBorder="border-indigo-500"
      isGenerated={!!result}
      isLoading={loading}
      error={error}
      onGenerate={handleGenerate}
      onRegenerate={() => { setResult(null); setError(null); }}
      inputForm={
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Industry</label>
            <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Healthcare"
              className="w-full bg-transparent border border-[var(--border-dim)] rounded-md px-2 py-1.5 text-[12px] focus:outline-none focus:border-[var(--border-active)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">AI Adoption Level</label>
              <select value={adoptionLevel} onChange={e => setAdoptionLevel(e.target.value)}
                className="w-full bg-transparent border border-[var(--border-dim)] rounded-md px-2 py-1.5 text-[12px] focus:outline-none focus:border-[var(--border-active)]">
                {adoptionLevels.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Data Infrastructure</label>
              <select value={dataInfra} onChange={e => setDataInfra(e.target.value)}
                className="w-full bg-transparent border border-[var(--border-dim)] rounded-md px-2 py-1.5 text-[12px] focus:outline-none focus:border-[var(--border-active)]">
                {dataInfraOptions.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Goals</label>
            <div className="flex flex-wrap gap-1.5">
              {goalOptions.map(g => (
                <button key={g} type="button" onClick={() => toggleItem(goals, g, setGoals)}
                  className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${goals.includes(g) ? 'bg-indigo-500/15 border-indigo-400 text-indigo-600' : 'border-[var(--border-dim)] text-[var(--text-muted)]'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Challenges</label>
            <div className="flex flex-wrap gap-1.5">
              {challengeOptions.map(c => (
                <button key={c} type="button" onClick={() => toggleItem(challenges, c, setChallenges)}
                  className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${challenges.includes(c) ? 'bg-indigo-500/15 border-indigo-400 text-indigo-600' : 'border-[var(--border-dim)] text-[var(--text-muted)]'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
    >
      {result && (
        <div className="space-y-3">
          <p className="text-[11px] text-[var(--text-secondary)]">{result.executive_summary}</p>
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-500">Pillars</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
              {result.transformation_pillars.map((p, i) => (
                <div key={i} className="p-2 bg-[var(--bg-base)] border border-[var(--border-dim)] rounded-md">
                  <h5 className="font-semibold text-[11px]">{p.name}</h5>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-500">KPIs</span>
            <ul className="text-[11px] text-[var(--text-secondary)] mt-1 space-y-0.5">
              {result.kpis.map((k, i) => <li key={i} className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-indigo-500" />{k}</li>)}
            </ul>
          </div>
        </div>
      )}
    </ToolPanel>
  );
}
