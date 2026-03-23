'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Idea } from '@/types';
import { IdeaCard } from './IdeaCard';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  ideas: Idea[];
}

export function KanbanColumn({ id, title, ideas }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className={cn(
      "flex flex-col flex-shrink-0 w-[300px] bg-muted/10 border border-border rounded-xl overflow-hidden h-[calc(100vh-14rem)] transition-colors duration-300",
      isOver && "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
    )}>
      <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between sticky top-0 shadow-sm z-10 backdrop-blur-sm">
        <h3 className="font-bold text-[13px] text-foreground uppercase tracking-widest font-display">{title}</h3>
        <Badge variant="default" className="h-5 text-[11px] px-2 bg-background text-muted-foreground border border-border tabular-nums shadow-sm">
          {ideas.length}
        </Badge>
      </div>
      
      <div 
        ref={setNodeRef} 
        className="flex-1 overflow-y-auto p-3 space-y-3 pretty-scrollbar"
      >
        <SortableContext items={ideas.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {ideas.map(idea => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </SortableContext>
        
        {/* Placeholder rendering when empty to give drop target height */}
        {ideas.length === 0 && (
          <div className="h-full w-full border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center text-muted-foreground/50 text-xs font-mono uppercase tracking-widest p-8 text-center bg-background/30">
            Drop Ideas Here
          </div>
        )}
      </div>
    </div>
  );
}
