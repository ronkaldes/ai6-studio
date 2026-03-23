import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { idea_id, votes, decision, learnings } = await req.json();

  const session = await db.boardSession.create({
    data: {
      ideaId: idea_id,
      attendees: Array.from(new Set(votes.map((v: any) => v.member_name))) as string[],
      decision,
      votes,
      learnings: learnings || null,
    }
  });

  await db.idea.update({
    where: { id: idea_id },
    data: {
      stage: decision === 'kill' ? 'graduated' : 'active_sprint',
      boardDecision: decision,
      boardRationale: learnings,
      boardVotes: votes
    }
  });

  return NextResponse.json({ session });
}
