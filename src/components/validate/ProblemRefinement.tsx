'use client';

import { useState } from 'react';
import { Idea } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowRight } from 'lucide-react';

export function ProblemRefinement({ idea, onComplete }: { idea: Idea, onComplete: (problem: string) => void }) {
  const [problem, setProblem] = useState(idea.title);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id, step: 1, data: { problem_statement: problem } })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      if (data.complete) {
        onComplete(data.refined_problem || problem);
      } else {
        setFeedback(data.feedback);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed. Check your API configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 md:p-10 bg-surface border-border max-w-3xl mx-auto shadow-md">
      <div className="mb-8 border-b border-border/50 pb-6">
        <h2 className="text-2xl font-bold font-display text-foreground mb-2 flex items-center gap-2">
          <span className="text-primary italic font-serif">I.</span> Problem Gate
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          Who specifically suffers? What do they do today instead? The AI will test your problem statement before allowing you to proceed.
        </p>
      </div>
      
      {error && (
        <div className="mb-6 mx-auto p-4 bg-destructive/10 border-l-2 border-destructive text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {feedback && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-md text-foreground text-sm flex flex-col gap-2 shadow-inner">
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">AI Feedback received</span>
          <p className="leading-relaxed border-l-2 border-primary/40 pl-3 italic opacity-90">{feedback}</p>
        </div>
      )}

      <div className="space-y-6">
        <Textarea 
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Describe the specific problem context, the target customer persona, and their existing alternatives..."
          className="min-h-[140px] bg-background border-border focus:border-primary text-foreground font-mono text-sm leading-relaxed p-4 resize-none"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={loading || problem.length < 15} 
            className="w-full sm:w-auto h-11 px-6 shadow-md transition-all active:scale-95"
            size="lg"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? 'Validating completeness...' : 'Validate Problem'}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}
