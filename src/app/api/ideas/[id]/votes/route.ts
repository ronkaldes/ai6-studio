import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const votes = await db.ideaVote.findMany({ where: { ideaId: id } });
  const upvotes = votes.filter(v => v.vote === 1).length;
  const downvotes = votes.filter(v => v.vote === -1).length;
  return NextResponse.json({ votes, upvotes, downvotes, net: upvotes - downvotes });
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const body = await req.json();
  const userName = body.userName || 'Anonymous';
  const vote = body.vote === -1 ? -1 : 1;

  const existing = await db.ideaVote.findUnique({
    where: { ideaId_userName: { ideaId: id, userName } },
  });

  if (existing) {
    if (existing.vote === vote) {
      await db.ideaVote.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: 'removed' });
    } else {
      const updated = await db.ideaVote.update({
        where: { id: existing.id },
        data: { vote },
      });
      return NextResponse.json({ action: 'changed', vote: updated });
    }
  }

  const newVote = await db.ideaVote.create({
    data: { ideaId: id, userName, vote },
  });
  return NextResponse.json({ action: 'created', vote: newVote });
}
