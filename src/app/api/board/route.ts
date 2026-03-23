import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { idea_id, votes, decision, learnings } = await req.json();

  const session = await db.boardSession.create({
    data: {
      ideaId: idea_id,
      attendees: JSON.stringify(Array.from(new Set(votes.map((v: any) => v.member_name)))),
      decision,
      votes: JSON.stringify(votes),
      learnings: learnings || null,
    }
  });

  const stageMap: Record<string, string> = {
    go: 'active_sprint',
    conditional: 'validating',
    pivot: 'refining',
    kill: 'graduated',
  }
  const newStage = stageMap[decision] || 'active_sprint'

  await db.idea.update({
    where: { id: idea_id },
    data: {
      stage: newStage,
      daysInStage: 0,
      boardDecision: decision,
      boardRationale: learnings,
      boardVotes: JSON.stringify(votes)
    }
  });

  return NextResponse.json({ session });
}
