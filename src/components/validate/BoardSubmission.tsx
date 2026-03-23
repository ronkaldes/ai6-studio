'use client';

import { useState } from 'react';
import { Idea } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowRight } from 'lucide-react';

export function BoardSubmission({ idea, onComplete }: { idea: Idea, onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id, step: 6, data: { submitted_by: 'Ron' } })
      });
      if (!res.ok) throw new Error(await res.text());
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 md:p-16 bg-surface border-border max-w-3xl mx-auto flex flex-col items-center justify-center text-center shadow-lg">
      <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8 border-2 border-primary/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
        <ArrowRight className="h-8 w-8" />
      </div>
      <h2 className="text-3xl font-bold font-display text-foreground mb-4">Ready for Board Review</h2>
      <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
        This wraps up the validation phase. Your idea is now fully documented with the Hexa memo, DVF scores, core assumptions, and designed validation metrics.
      </p>

      {error && (
        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md w-full">
          {error}
        </div>
      )}

      <Button 
        onClick={handleSubmit} 
        disabled={loading} 
        size="lg"
        className="mt-10 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-12 text-base font-bold w-full sm:w-auto shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
      >
        {loading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : null}
        {loading ? 'Submitting to Board...' : 'Submit to Advisory Board'}
      </Button>
    </Card>
  );
}
