import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const comments = await db.comment.findMany({
    where: { ideaId: id },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const body = await req.json();

  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 });
  }

  const comment = await db.comment.create({
    data: {
      ideaId: id,
      authorName: body.authorName || 'Anonymous',
      content: body.content.trim(),
    },
  });
  return NextResponse.json({ comment });
}
