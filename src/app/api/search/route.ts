import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ signals: [], ideas: [], learnings: [] });
  }

  try {
    const [signals, ideas, learnings] = await Promise.all([
      db.$queryRaw`
        SELECT id, title, left("aiSummary", 200) as summary, "opportunityScore" as score
        FROM "TrendSignal"
        WHERE search_vector @@ plainto_tsquery('english', ${q})
        ORDER BY ts_rank(search_vector, plainto_tsquery('english', ${q})) DESC
        LIMIT 10
      `,
      db.$queryRaw`
        SELECT id, title, left("opportunityMemo", 200) as summary, stage
        FROM "Idea"
        WHERE search_vector @@ plainto_tsquery('english', ${q})
        ORDER BY ts_rank(search_vector, plainto_tsquery('english', ${q})) DESC
        LIMIT 10
      `,
      // For learnings
      db.boardSession.findMany({
        where: {
          learnings: { contains: q, mode: 'insensitive' }
        },
        take: 5
      })
    ]);

    return NextResponse.json({
      signals,
      ideas,
      learnings
    });
  } catch (err) {
    console.error('[Search API Error]', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
