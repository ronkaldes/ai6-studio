import { db } from '@/lib/db';
import { BoardDashboard } from '@/components/board/BoardDashboard';

export const dynamic = 'force-dynamic';

export default async function BoardPage() {
  const pendingIdeas = await db.idea.findMany({
    where: { stage: 'decision_gate' },
    orderBy: { updatedAt: 'desc' },
    include: { signals: true }
  });

  const completedSessions = await db.boardSession.findMany({
    orderBy: { sessionDate: 'desc' }
  });
  
  const ideas = await db.idea.findMany();

  return (
    <BoardDashboard 
      pendingIdeas={pendingIdeas as any[]} 
      completedSessions={completedSessions as any[]} 
      allIdeas={ideas as any[]} 
    />
  );
}
