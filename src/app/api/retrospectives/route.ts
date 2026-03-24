import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ideaId = searchParams.get('ideaId');
  if (!ideaId) return NextResponse.json({ error: 'ideaId is required' }, { status: 400 });

  const retro = await (db as any).sprintRetrospective.findUnique({ where: { ideaId } });
  return NextResponse.json({ retro });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ideaId, ...data } = body;
  
  const retro = await (db as any).sprintRetrospective.upsert({
    where: { ideaId },
    create: { ideaId, ...data },
    update: { ...data }
  });

  return NextResponse.json({ retro });
}
