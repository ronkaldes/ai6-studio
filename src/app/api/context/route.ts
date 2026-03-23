import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEFAULT_STUDIO_CONTEXT } from '@/lib/context';

export async function GET() {
  const ctx = await db.projectContext.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ content: ctx ? ctx.content : DEFAULT_STUDIO_CONTEXT });
}

export async function POST(req: NextRequest) {
  const { content } = await req.json();
  const last = await db.projectContext.findFirst({ orderBy: { createdAt: 'desc' } });
  const version = last ? last.version + 1 : 1;
  const ctx = await db.projectContext.create({
    data: { content, version }
  });
  return NextResponse.json({ content: ctx.content });
}
