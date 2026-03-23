import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const ideas = await db.idea.findMany({
    orderBy: { updatedAt: 'desc' }
  });
  return NextResponse.json({ ideas: ideas.map(idea => ({
    ...idea,
    opportunityMemo: idea.opportunityMemo ? JSON.parse(idea.opportunityMemo) : null,
    dvfScores: idea.dvfScores ? JSON.parse(idea.dvfScores) : null,
    assumptionMap: idea.assumptionMap ? JSON.parse(idea.assumptionMap) : null,
    experiments: idea.experiments ? JSON.parse(idea.experiments) : null,
    boardVotes: idea.boardVotes ? JSON.parse(idea.boardVotes) : null
  })) });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const idea = await db.idea.create({
    data: {
      title: data.title,
      sourceSignalId: data.source_signal_id,
      stage: 'signal'
    }
  });
  return NextResponse.json({ idea });
}
