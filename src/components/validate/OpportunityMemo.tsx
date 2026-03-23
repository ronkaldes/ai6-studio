'use client';

import { useState } from 'react';
import { Idea, OpportunityMemo as OppMemoType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { OpportunityCard } from '../trends/OpportunityCard'; // Reusing visual layout where possible or custom

export function OpportunityMemoView({ idea, validatedProblem, onComplete }: { idea: Idea, validatedProblem: string, onComplete: (idea: Idea) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id, step: 2, data: { validated_problem: validatedProblem } })
      });
      if (!res.ok) throw new Error(await res.text());
      const memo = await res.json();
      onComplete({ ...idea, opportunityMemo: memo });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  // If the Memo already exists, we display it, otherwise we prompt to generate it.
  if (idea.opportunityMemo) {
    const memo = idea.opportunityMemo as OppMemoType;
    return (
      <Card className="p-6 md:p-8 bg-surface border-border max-w-4xl mx-auto shadow-md">
        <div className="flex justify-between items-center border-b border-border/50 pb-5 mb-6">
           <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <span className="text-primary italic font-serif">II.</span> Hexa Memo
          </h2>
          <Button onClick={() => onComplete(idea)} size="sm">Continue <Loader2 className="ml-2 h-3 w-3 hidden"/></Button>
        </div>
        
        <div className="grid gap-6 text-sm text-foreground">
          {memo.risks && memo.risks.length > 0 && (
            <div className="p-4 bg-destructive/5 border-l-2 border-destructive rounded-r-md">
              <h4 className="font-bold text-destructive text-xs uppercase tracking-widest mb-2 flex items-center gap-2">⚠ Primary Kill Risks</h4>
              <ul className="list-disc pl-5 space-y-1 mt-2 marker:text-destructive/50">
                {memo.risks.map((risk, i) => <li key={i} className="text-muted-foreground">{risk}</li>)}
              </ul>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6 bg-muted/20 p-5 rounded-md border border-border">
             <div>
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Problem</span>
                <p className="leading-relaxed opacity-90">{memo.problem}</p>
             </div>
             <div>
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Target Customer</span>
                <p className="leading-relaxed opacity-90">{memo.target_customer}</p>
             </div>
             <div>
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Solution</span>
                <p className="leading-relaxed opacity-90">{memo.solution}</p>
             </div>
             <div>
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Moat</span>
                <p className="leading-relaxed opacity-90">{memo.moat}</p>
             </div>
             <div>
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Why Now</span>
                <p className="leading-relaxed opacity-90">{memo.why_now}</p>
             </div>
             <div>
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Market Size</span>
                <p className="leading-relaxed text-primary/80 font-medium">{memo.market_size}</p>
             </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
           <Button onClick={() => onComplete(idea)} className="bg-primary px-8">Proceed to Scoring</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 md:p-12 bg-surface border-border max-w-4xl mx-auto flex flex-col items-center justify-center text-center min-h-[400px]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-display text-foreground mb-4">Opportunity Memo</h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Claude will synthesize a structured 1-page memo using the Hexa framework based on your validated problem definition.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border-l-2 border-destructive text-destructive text-sm text-center w-full max-w-md">
          {error}
        </div>
      )}

      <Button 
        onClick={handleGenerate} 
        disabled={loading} 
        size="lg"
        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.2)] h-12 px-8 text-base"
      >
        {loading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : null}
        {loading ? 'Synthesizing Hexa Memo...' : 'Generate Hexa Memo'}
      </Button>
    </Card>
  );
}
