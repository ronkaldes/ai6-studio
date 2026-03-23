'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Idea, IdeaStage } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { IdeaCard } from './IdeaCard';
import { useRouter } from 'next/navigation';

const STAGES: { id: IdeaStage; title: string }[] = [
  { id: 'signal', title: 'Signal' },
  { id: 'refining', title: 'Refining' },
  { id: 'validating', title: 'Validating' },
  { id: 'decision_gate', title: 'Decision Gate' },
  { id: 'active_sprint', title: 'Active Sprint' },
  { id: 'graduated', title: 'Graduated' },
];

export function KanbanBoard({ initialIdeas }: { initialIdeas: Idea[] }) {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [activeIdea, setActiveIdea] = useState<Idea | null>(null);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }) // 5px drag tolerance to allow clicks
  );

  const handleDragStart = (e: DragStartEvent) => {
    const idea = ideas.find(i => i.id === e.active.id);
    if (idea) setActiveIdea(idea);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveIdea(null);
    const { active, over } = e;
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id; // Either a column id or an idea id
    
    const activeIdea = ideas.find(i => i.id === activeId);
    if (!activeIdea) return;
    
    // Determine new stage
    let newStage = activeIdea.stage;
    if (STAGES.map(s => s.id as string).includes(overId as string)) {
      newStage = overId as IdeaStage;
    } else {
      const overIdea = ideas.find(i => i.id === overId);
      if (overIdea) newStage = overIdea.stage;
    }

    if (activeIdea.stage === newStage) return;

    // Optimistic UI update
    setIdeas(prev => prev.map(i => i.id === activeId ? { ...i, stage: newStage, daysInStage: 0 } : i));

    // API Call
    try {
      await fetch(`/api/ideas/${activeId}`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: newStage }),
        headers: { 'Content-Type': 'application/json' }
      });
      router.refresh();
    } catch (err) {
      console.error('Drag error:', err);
      // Revert if error
      setIdeas(initialIdeas);
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 h-full items-start p-1">
        {STAGES.map(stage => (
          <KanbanColumn 
            key={stage.id} 
            id={stage.id} 
            title={stage.title} 
            ideas={ideas.filter(i => i.stage === stage.id)} 
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeIdea ? <IdeaCard idea={activeIdea} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
