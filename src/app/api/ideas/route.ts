import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeIdea } from '@/lib/serialize-idea';

export async function GET(req: NextRequest) {
  const ideas = await (db as any).idea.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { sprintRetrospective: true }
  });
  return NextResponse.json({ ideas: ideas.map(serializeIdea) });
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
