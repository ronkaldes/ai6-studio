import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const sources = searchParams.get('source')?.split(',');
  const minScore = Number(searchParams.get('min_score') ?? 0);
  const categories = searchParams.get('category')?.split(',');
  const statuses = searchParams.get('status')?.split(',');
  const limit = Number(searchParams.get('limit') ?? 20);
  const offset = Number(searchParams.get('offset') ?? 0);

  const signals = await db.trendSignal.findMany({
    where: {
      ...(sources?.length && { source: { in: sources } }),
      ...(minScore > 0 && { opportunityScore: { gte: minScore } }),
      ...(categories?.length && { category: { in: categories } }),
      ...(statuses?.length && { pipelineStatus: { in: statuses } }),
    },
    orderBy: { opportunityScore: 'desc' },
    take: limit,
    skip: offset,
  });

  return NextResponse.json({ signals, total: signals.length });
}

export async function PATCH(req: NextRequest) {
  const { id, pipeline_status } = await req.json() as {
    id: string;
    pipeline_status: string;
  };

  const updated = await db.trendSignal.update({
    where: { id },
    data: { pipelineStatus: pipeline_status },
  });

  // Auto-create Idea when promoted
  if (pipeline_status === 'promoted') {
    await db.idea.create({
      data: {
        title: updated.title,
        stage: 'signal',
        sourceSignalId: updated.id,
        signals: { connect: { id: updated.id } },
      },
    });
  }

  return NextResponse.json({ signal: updated });
}
