'use client';

import { TrendSignal } from '@/types';
import { SignalCard } from './SignalCard';
import { useRouter } from 'next/navigation';

export function SignalGrid({ signals }: { signals: TrendSignal[] }) {
  const router = useRouter();

  const handlePromote = async (id: string) => {
    await fetch('/api/signals', {
      method: 'PATCH',
      body: JSON.stringify({ id, pipeline_status: 'promoted' }),
      headers: { 'Content-Type': 'application/json' }
    });
    router.refresh();
  };

  const handleArchive = async (id: string) => {
    await fetch('/api/signals', {
      method: 'PATCH',
      body: JSON.stringify({ id, pipeline_status: 'archived' }),
      headers: { 'Content-Type': 'application/json' }
    });
    router.refresh();
  };

  if (signals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl bg-surface/30 mt-6">
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
          No signals above threshold
        </p>
        <p className="text-xs text-muted-foreground mt-3 opacity-80">
          Lower the filter or run a new scan.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 auto-rows-max items-start">
      {signals.map(signal => (
        <SignalCard 
          key={signal.id} 
          signal={signal} 
          onPromote={handlePromote} 
          onArchive={handleArchive} 
        />
      ))}
    </div>
  );
}
