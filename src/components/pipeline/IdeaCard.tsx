'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Idea } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScorePill } from '@/components/ui/ScorePill';
import { Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function IdeaCard({ idea }: { idea: Idea }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idea.id, data: { idea } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isWarning = idea.daysInStage > 7;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing p-4 group transition-all duration-300 bg-surface border-border",
        isDragging && "opacity-50 ring-2 ring-primary relative z-50 shadow-xl scale-105",
        isWarning && "border-destructive/30"
      )}
    >
      <div className="flex justify-between items-start mb-3 gap-2">
        <h4 className="font-semibold text-sm leading-snug text-foreground group-hover:text-primary transition-colors">
          {idea.title}
        </h4>
        {idea.ventureScore !== null && (
          <ScorePill score={idea.ventureScore} max={100} />
        )}
      </div>

      <div className="flex items-center justify-between mt-5">
        <div className="flex items-center gap-2">
          {isWarning ? (
            <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 text-[10px] gap-1 px-1.5 h-5 font-mono">
              <AlertTriangle className="h-3 w-3" /> {idea.daysInStage}d
            </Badge>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted/50 px-1.5 rounded py-0.5 border border-border/30">
              <Clock className="h-3 w-3" /> {idea.daysInStage}d
            </div>
          )}
          {idea.sourceSignalId && (
            <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-muted text-muted-foreground uppercase tracking-widest font-mono border border-border/50">Signal</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Validation Link overlayed correctly */}
          <Link href={`/validate/${idea.id}`} className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 text-primary hover:bg-primary/20" onPointerDown={(e) => e.stopPropagation()}>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {/* Assignee Avatar */}
          <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-bold border border-primary/30 shadow-sm">
            {idea.assigneeId ? idea.assigneeId[0].toUpperCase() : '?'}
          </div>
        </div>
      </div>
    </Card>
  );
}
