'use client';

import { useState } from 'react';
import { ToolPanel } from './ToolPanel';
import { Users } from 'lucide-react';
import type { Idea, UserPersona } from '@/types';

export function PersonaPanel({ idea }: { idea: Idea }) {
  const [targetAudience, setTargetAudience] = useState('');
  const [researchQuestion, setResearchQuestion] = useState('');
  const [personas, setPersonas] = useState<UserPersona[] | null>(idea.userPersonas);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tools/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetAudience, researchQuestion, ideaId: idea.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Generation failed');
      setPersonas(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate personas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPanel
      title="User Personas"
      icon={Users}
      description="AI-generated user personas for target audience"
      accentColor="text-purple-500"
      accentBg="bg-purple-500/10"
      accentBorder="border-purple-500"
      isGenerated={!!personas}
      isLoading={loading}
      error={error}
      onGenerate={handleGenerate}
      onRegenerate={() => { setPersonas(null); setError(null); }}
      inputForm={
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Target Audience</label>
            <textarea value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="e.g. Solo developers building AI-powered SaaS"
              className="w-full bg-transparent border border-[var(--border-dim)] rounded-md p-2 text-[12px] min-h-[50px] resize-none focus:outline-none focus:border-[var(--border-active)]" />
          </div>
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Research Question</label>
            <textarea value={researchQuestion} onChange={e => setResearchQuestion(e.target.value)} placeholder="e.g. What motivates them to adopt new dev tools?"
              className="w-full bg-transparent border border-[var(--border-dim)] rounded-md p-2 text-[12px] min-h-[50px] resize-none focus:outline-none focus:border-[var(--border-active)]" />
          </div>
        </div>
      }
    >
      {personas && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {personas.map((p, i) => (
            <div key={i} className="p-3 bg-[var(--bg-base)] border border-[var(--border-dim)] rounded-md flex flex-col gap-2">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-dim)]">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 font-bold text-[11px]">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-[11px]">{p.name}, {p.age}</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">{p.role}</p>
                </div>
                <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500">{p.tech_comfort}</span>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] italic">&quot;{p.key_quote}&quot;</p>
              <div className="grid grid-cols-2 gap-2 text-[10px] mt-1">
                <div>
                  <span className="font-mono text-[9px] uppercase text-[var(--score-go)] tracking-wider">Goals</span>
                  <ul className="text-[var(--text-muted)] mt-0.5 space-y-0.5">{p.goals.slice(0, 3).map((g, j) => <li key={j}>+ {g}</li>)}</ul>
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase text-[var(--score-kill)] tracking-wider">Pain Points</span>
                  <ul className="text-[var(--text-muted)] mt-0.5 space-y-0.5">{p.pain_points.slice(0, 3).map((pp, j) => <li key={j}>- {pp}</li>)}</ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToolPanel>
  );
}
