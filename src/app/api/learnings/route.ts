import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const learnings = await (db as any).learning.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ learnings });
}
