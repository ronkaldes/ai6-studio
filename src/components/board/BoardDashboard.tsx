'use client';

import { useState } from 'react';
import { Idea, BoardSession } from '@/types';
import { ReviewSession } from './ReviewSession';
import { DecisionLog } from './DecisionLog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScorePill } from '@/components/ui/ScorePill';
import { Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BoardDashboard({ pendingIdeas, completedSessions, allIdeas }: { pendingIdeas: Idea[], completedSessions: BoardSession[], allIdeas: Idea[] }) {
  const [activeReview, setActiveReview] = useState<Idea | null>(null);
  const router = useRouter();

  const handleExitReview = () => {
    setActiveReview(null);
    router.refresh();
  };

  return (
    <>
      <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-10 h-full pt-2">
        <div className="flex flex-col gap-2 shrink-0">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Advisory Board Room</h1>
          <p className="text-muted-foreground text-sm max-w-3xl">Structured presentation and voting interface for high-stakes decision sprints.</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 flex flex-col gap-5">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono font-bold flex items-center justify-between">
              Pending Review <span className="bg-muted px-2 py-0.5 rounded-full text-foreground">{pendingIdeas.length}</span>
            </h2>
            <div className="flex flex-col gap-4">
              {pendingIdeas.length === 0 ? (
                <div className="p-8 border border-dashed border-border/50 rounded-xl bg-surface/30 text-center">
                  <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">Inbox Zero</span>
                </div>
              ) : (
                pendingIdeas.map(idea => (
                  <Card key={idea.id} className="p-5 flex flex-col gap-4 bg-surface border-border hover:shadow-md transition-shadow">
                     <div className="flex justify-between items-start gap-4">
                        <h3 className="font-semibold text-sm">{idea.title}</h3>
                        {idea.ventureScore ? <ScorePill score={idea.ventureScore} max={100} /> : null}
                     </div>
                     <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
                        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Wait: {idea.daysInStage}d</span>
                        <Button size="sm" onClick={() => setActiveReview(idea)} className="bg-primary/10 text-primary hover:bg-primary/20 h-8 text-xs font-bold gap-2 focus:ring-0 shadow-none">
                           Start Review <Play className="h-3 w-3" />
                        </Button>
                     </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-5">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono font-bold">
              Historical Decisions & Learnings
            </h2>
            <DecisionLog sessions={completedSessions} ideas={allIdeas} />
          </div>
        </div>
      </div>

      {activeReview && (
        <ReviewSession idea={activeReview} onExit={handleExitReview} />
      )}
    </>
  );
}
