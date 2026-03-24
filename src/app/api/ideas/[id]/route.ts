import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeIdea } from '@/lib/serialize-idea';

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
  return NextResponse.json({ idea: serializeIdea(idea) });
}
