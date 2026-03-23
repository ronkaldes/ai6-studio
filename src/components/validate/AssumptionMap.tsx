'use client';

import { useState, useRef } from 'react';
import { Idea, AssumptionItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { DndContext, useDraggable, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

export function AssumptionMap({ idea, onComplete }: { idea: Idea, onComplete: (idea: Idea) => void }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Local state for the assumptions
  const [assumptions, setAssumptions] = useState<AssumptionItem[]>(
    (idea.assumptionMap as AssumptionItem[]) || []
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id, step: 4, data: {} })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setAssumptions(data.assumptions || []);
      onComplete({ ...idea, assumptionMap: data.assumptions });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    setAssumptions(prev => prev.map(item => {
      if (item.id === active.id) {
        // Delta is in pixels. Convert to percentages.
        const deltaEvidence = delta.x / rect.width;
        // Importance is inverted on the Y axis (Higher importance = visually top = lower Y)
        const deltaImportance = -(delta.y / rect.height);
        
        return {
          ...item,
          evidence: Math.max(0, Math.min(1, item.evidence + deltaEvidence)),
          importance: Math.max(0, Math.min(1, item.importance + deltaImportance)),
        };
      }
      return item;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assumptionMap: assumptions })
      });
      
      onComplete({ ...idea, assumptionMap: assumptions as any });
    } catch(err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (assumptions.length > 0) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-border/50 pb-5">
           <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <span className="text-primary italic font-serif">IV.</span> Assumption Map
          </h2>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
            Proceed to Experiments
          </Button>
        </div>

        <Card className="p-1 md:p-6 bg-surface border-border shadow-md">
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div 
              ref={containerRef}
              className="relative w-full aspect-square md:aspect-video max-h-[600px] border border-border bg-background rounded-lg overflow-hidden touch-none"
            >
              {/* SVG Background Grid */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--border-base)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--border-base)" strokeWidth="2" strokeDasharray="4 4" />
                
                {/* Quadrant Labels */}
                <text x="25%" y="25%" fill="var(--score-kill)" className="font-mono text-base md:text-xl font-bold opacity-20 uppercase tracking-widest" textAnchor="middle">Test First</text>
                <text x="75%" y="25%" fill="var(--score-cond)" className="font-mono text-base md:text-xl font-bold opacity-20 uppercase tracking-widest" textAnchor="middle">Validate</text>
                <text x="25%" y="75%" fill="var(--accent)" className="font-mono text-base md:text-xl font-bold opacity-20 uppercase tracking-widest" textAnchor="middle">Monitor</text>
                <text x="75%" y="75%" fill="var(--text-muted)" className="font-mono text-base md:text-xl font-bold opacity-20 uppercase tracking-widest" textAnchor="middle">Deprioritize</text>
              </svg>

              {/* Axes Labels */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground bg-background/80 px-2 py-1 rounded border border-border/30">High Importance</div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground bg-background/80 px-2 py-1 rounded border border-border/30">Low Importance</div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground bg-background/80 px-2 py-1 rounded origin-left -rotate-90 border border-border/30 z-10 w-32 translate-y-16 text-center">Low Evidence</div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground bg-background/80 px-2 py-1 rounded origin-right rotate-90 border border-border/30 z-10 w-32 -translate-y-16 text-center mb-8">High Evidence</div>

              {assumptions.map((item, i) => (
                <DraggableAssumption key={item.id} item={item} index={i} />
              ))}
            </div>
          </DndContext>
        </Card>
      </div>
    );
  }

  return (
    <Card className="p-8 md:p-12 bg-surface border-border max-w-4xl mx-auto flex flex-col items-center justify-center text-center min-h-[400px]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-display text-foreground mb-4">Assumption Mapping</h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          The AI will extract the 8 most critical assumptions from your Opportunity Memo and plot them on an Importance vs. Evidence matrix.
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
        {loading ? 'Mapping Assumptions...' : 'Generate Assumption Map'}
      </Button>
    </Card>
  );
}

function DraggableAssumption({ item, index }: { item: AssumptionItem, index: number }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    left: `calc( ${item.evidence * 100}% - 16px )`,
    top: `calc( ${(1 - item.importance) * 100}% - 16px )`,
  };

  const isTestFirst = item.importance >= 0.5 && item.evidence < 0.5;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "absolute cursor-grab active:cursor-grabbing group p-2 -m-2",
        isDragging && "z-50 opacity-80"
      )}
    >
      <div className={cn(
        "relative flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold transition-colors bg-surface shadow-sm",
        isTestFirst 
          ? "border-destructive text-destructive shadow-[0_0_10px_rgba(239,68,68,0.4)] bg-destructive/10" 
          : "border-primary text-primary"
      )}>
        {index + 1}
      </div>
      
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 bg-elevated border border-border p-3 rounded-md shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-xs text-foreground z-50 ring-1 ring-border/50">
        <span className="font-bold mb-1.5 block text-[10px] uppercase font-mono tracking-widest text-primary">Assumption {index + 1}</span>
        <span className="leading-relaxed text-muted-foreground">{item.text}</span>
      </div>
    </div>
  );
}
