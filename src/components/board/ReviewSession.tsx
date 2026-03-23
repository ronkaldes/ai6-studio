'use client';

import { Idea, OpportunityMemo } from '@/types';
import { VotingInterface } from './VotingInterface';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { VentureMeter } from '@/components/ui/VentureMeter';
import { useEffect } from 'react';

export function ReviewSession({ idea, onExit }: { idea: Idea, onExit: () => void }) {
  const memo = idea.opportunityMemo as OpportunityMemo;
  
  // Disable body scroll when full screen
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">
      <div className="h-[68px] border-b border-border/50 flex items-center justify-between px-6 bg-surface/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onExit} className="rounded-full shadow-sm hover:bg-muted/50 border-border/50"><ArrowLeft className="h-4 w-4" /></Button>
          <div className="flex flex-col">
            <h1 className="font-display font-bold text-lg leading-tight text-foreground">{idea.title}</h1>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Advisory Board Review • {(Date.now()).toString().slice(-4)}</span>
          </div>
        </div>
        <div className="hidden sm:flex text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded font-bold uppercase tracking-widest shadow-inner gap-2 items-center">
           <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live Session
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row p-4 sm:p-6 md:p-8 gap-8 w-full mx-auto pb-24">
        {/* Left Panel: Memo */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <Card className="p-6 md:p-10 bg-surface border-border shadow-lg flex-1 overflow-hidden h-fit sticky top-24">
            <h2 className="font-display text-3xl font-bold mb-8 text-foreground flex items-center gap-3 border-b border-border/50 pb-6">
              <span className="text-primary italic font-serif text-4xl">I.</span> Hexa Opportunity Memo
            </h2>
            <div className="space-y-8 flex-1 overflow-y-auto pr-4 pretty-scrollbar">
              <div className="bg-muted/10 p-5 rounded-md border border-border/30 shadow-inner">
                <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2 font-bold">The Problem</h4>
                <p className="text-sm leading-relaxed text-foreground/90">{memo?.problem}</p>
              </div>
              <div className="bg-muted/10 p-5 rounded-md border border-border/30 shadow-inner">
                <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2 font-bold">Target Customer</h4>
                <p className="text-sm leading-relaxed text-foreground/90">{memo?.target_customer}</p>
              </div>
              <div className="bg-muted/10 p-5 rounded-md border border-border/30 shadow-inner">
                <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2 font-bold">Proposed Solution</h4>
                <p className="text-sm leading-relaxed text-foreground/90">{memo?.solution}</p>
              </div>
              <div className="bg-muted/10 p-5 rounded-md border border-border/30 shadow-inner">
                <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2 font-bold">Defensibility (Moat)</h4>
                <p className="text-sm leading-relaxed text-foreground/90">{memo?.moat}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary/5 p-5 rounded-md border border-primary/20 shadow-inner">
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2 font-bold">Why Now?</h4>
                  <p className="text-sm leading-relaxed text-foreground/90">{memo?.why_now}</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2 font-bold">Market Size</h4>
                  <p className="text-sm leading-relaxed text-foreground font-medium">{memo?.market_size}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel: Defense & Voting */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <Card className="p-6 md:p-8 bg-destructive/5 border-destructive/20 shadow-md">
             <h2 className="font-display text-2xl font-bold mb-6 text-destructive flex items-center gap-3">
              <span className="italic font-serif text-3xl opacity-80">II.</span> Critical Kill Risks
            </h2>
            <ul className="list-disc list-outside ml-5 space-y-3 marker:text-destructive">
              {memo?.risks.map((r,i) => <li key={i} className="text-[15px] text-foreground leading-relaxed pl-2">{r}</li>)}
            </ul>
          </Card>

          <div className="w-full">
             <VentureMeter agents={idea.dvfScores as any} />
          </div>

          <VotingInterface idea={idea} onComplete={onExit} />
        </div>
      </div>
    </div>
  );
}
