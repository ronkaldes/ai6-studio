import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runSkill } from '@/lib/claude';

export const maxDuration = 120; // seconds — required for Vercel

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await req.json();

    if (json.status === 'closed') {
      const stats = await db.trendSignal.count({
        where: { campaignId: id },
      });

      const promoted = await db.trendSignal.count({
        where: { campaignId: id, pipelineStatus: { in: ['promoted', 'reviewed'] } },
      });

      const summaryMsg = `Generate a 1-line summary report for this campaign.
Target stats:
Total signals collected: ${stats}
Signals promoted: ${promoted}
Return JUST the 1-line summary and nothing else.`;

      const summary = await runSkill({
        systemPrompt: "You are an AI analyst. Be extremely concise.",
        userMessage: summaryMsg,
      });

      const updated = await db.campaign.update({
        where: { id },
        data: {
          status: 'closed',
          summary: summary.trim(),
        }
      });
      return NextResponse.json(updated);
    }

    const updated = await db.campaign.update({
      where: { id },
      data: {
        name: json.name,
        domainFocus: json.domainFocus,
        minScore: json.minScore,
        deadline: json.deadline ? new Date(json.deadline) : null,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[campaigns] PATCH error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
