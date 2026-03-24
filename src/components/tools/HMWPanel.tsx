'use client';

import { useState } from 'react';
import { ToolPanel } from './ToolPanel';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Idea, HMWStatement } from '@/types';

const categoryColors: Record<string, { text: string; bg: string }> = {
  desirability: { text: 'text-green-600', bg: 'bg-green-500/10' },
  feasibility: { text: 'text-blue-600', bg: 'bg-blue-500/10' },
  viability: { text: 'text-amber-600', bg: 'bg-amber-500/10' },
  wild_card: { text: 'text-rose-600', bg: 'bg-rose-500/10' },
};

export function HMWPanel({ idea }: { idea: Idea }) {
  const [targetAudience, setTargetAudience] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [statements, setStatements] = useState<HMWStatement[] | null>(idea.hmwStatements);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tools/hmw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetAudience, problemDescription, ideaId: idea.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Generation failed');
      setStatements(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate HMW statements');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPanel
      title="How Might We"
      icon={Lightbulb}
      description="Reframe problems into opportunity statements"
      accentColor="text-amber-500"
      accentBg="bg-amber-500/10"
      accentBorder="border-amber-500"
      isGenerated={!!statements}
      isLoading={loading}
      error={error}
      onGenerate={handleGenerate}
      onRegenerate={() => { setStatements(null); setError(null); }}
      inputForm={
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Target Audience</label>
            <textarea value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="Who has this problem?"
              className="w-full bg-transparent border border-[var(--border-dim)] rounded-md p-2 text-[12px] min-h-[50px] resize-none focus:outline-none focus:border-[var(--border-active)]" />
          </div>
          <div>
            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Problem Description</label>
            <textarea value={problemDescription} onChange={e => setProblemDescription(e.target.value)} placeholder="Describe the problem space"
              className="w-full bg-transparent border border-[var(--border-dim)] rounded-md p-2 text-[12px] min-h-[50px] resize-none focus:outline-none focus:border-[var(--border-active)]" />
          </div>
        </div>
      }
    >
      {statements && (
        <div className="space-y-2">
          {statements.map((s, i) => {
            const cat = categoryColors[s.category] || categoryColors.wild_card;
            return (
              <div key={i} className="flex items-start gap-2 p-2 bg-[var(--bg-base)] rounded-md border border-[var(--border-dim)]">
                <span className={cn('text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0 mt-0.5', cat.bg, cat.text)}>
                  {s.category.replace('_', ' ')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[var(--text-primary)]">{s.statement}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{s.rationale}</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className={cn('w-1 h-3 rounded-sm', j < s.innovation_potential ? 'bg-amber-500' : 'bg-[var(--border-dim)]')} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ToolPanel>
  );
}
