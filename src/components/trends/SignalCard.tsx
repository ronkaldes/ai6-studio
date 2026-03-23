'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendSignal } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { ScorePill } from '@/components/ui/ScorePill';
import { OpportunityCard } from './OpportunityCard';
import { ArrowUpRight, Archive, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignalCardProps {
  signal: TrendSignal;
  onPromote: (id: string) => void;
  onArchive: (id: string) => void;
}

export function SignalCard({ signal, onPromote, onArchive }: SignalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(signal.pipelineStatus);

  const handlePromote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus('promoted');
    onPromote(signal.id);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus('archived');
    onArchive(signal.id);
  };

  if (status === 'archived') return null;

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className="relative z-0 hover:z-10 group"
    >
      <Card 
        className={cn(
          "cursor-pointer overflow-hidden transition-all duration-300 border-border bg-surface",
          expanded ? "ring-1 ring-primary/50 shadow-lg" : "hover:border-primary/50 shadow-sm"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="p-4 flex flex-col gap-3">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <SourceBadge source={signal.source} />
                {status === 'promoted' && (
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] uppercase font-bold tracking-wider">
                    Promoted
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-base md:text-lg leading-snug text-foreground group-hover:text-primary transition-colors pr-4">
                {signal.title}
              </h3>
            </div>
            <ScorePill score={signal.opportunityScore} max={10} />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mt-1">
            {signal.velocitySignal ? (
              <span className="text-foreground/80 font-medium bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                {signal.velocitySignal}
              </span>
            ) : <span />}
            {signal.category && (
              <span className="uppercase tracking-wider opacity-70">
                {signal.category.replace('_', ' ')}
              </span>
            )}
          </div>

          {!expanded && signal.aiSummary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {signal.aiSummary}
            </p>
          )}

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-border mt-3"
              >
                {signal.aiSummary && (
                  <p className="text-sm text-foreground mt-4 leading-relaxed bg-muted/20 p-3 rounded border border-border/30">
                    {signal.aiSummary}
                  </p>
                )}
                
                {signal.opportunityCard ? (
                  <OpportunityCard card={signal.opportunityCard} />
                ) : (
                  <div className="mt-4 p-4 text-center text-sm text-muted-foreground bg-muted/20 border border-border border-dashed rounded-md font-mono">
                    No Opportunity Card generated (score &lt; 7)
                  </div>
                )}

                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border">
                  <Button 
                    variant="default" 
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-bold shadow-lg shadow-primary/20"
                    onClick={handlePromote}
                    disabled={status === 'promoted'}
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    {status === 'promoted' ? 'In Pipeline' : 'Promote to Pipeline'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleArchive}
                    className="shrink-0 hover:text-destructive hover:border-destructive hover:bg-destructive/10"
                    title="Archive"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                  {signal.url && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={(e) => { e.stopPropagation(); window.open(signal.url!, '_blank', 'noreferrer'); }}
                      title="Open source target"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}
