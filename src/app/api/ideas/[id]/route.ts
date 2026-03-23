import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await req.json();
  const idea = await db.idea.update({
    where: { id: params.id },
    data: {
      ...(data.stage && { stage: data.stage, daysInStage: 0 }),
      ...(data.dvfScores && { dvfScores: JSON.stringify(data.dvfScores) }),
    }
  });
  return NextResponse.json({ idea: {
    ...idea,
    opportunityMemo: idea.opportunityMemo ? JSON.parse(idea.opportunityMemo) : null,
    dvfScores: idea.dvfScores ? JSON.parse(idea.dvfScores) : null,
    assumptionMap: idea.assumptionMap ? JSON.parse(idea.assumptionMap) : null,
    experiments: idea.experiments ? JSON.parse(idea.experiments) : null,
    boardVotes: idea.boardVotes ? JSON.parse(idea.boardVotes) : null
  } });
}
