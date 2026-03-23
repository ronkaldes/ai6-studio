import { KanbanBoard } from '@/components/pipeline/KanbanBoard';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function PipelinePage() {
  const ideas = await db.idea.findMany({
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="max-w-full h-full flex flex-col">
      <div className="flex flex-col mb-6 gap-2 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Idea Pipeline</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">Structured Kanban tracking every idea from raw signal to active sprint.</p>
      </div>
      
      <div className="flex-1 min-h-0">
        <KanbanBoard initialIdeas={ideas as any[]} />
      </div>
    </div>
  );
}
