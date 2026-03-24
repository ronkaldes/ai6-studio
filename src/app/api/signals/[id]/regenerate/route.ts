import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runSkill } from '@/lib/claude';
import { getOpportunityMemoPrompt } from '@/lib/skills/opportunity-memo';

export const maxDuration = 120;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const signal = await (db as any).trendSignal.findUnique({ where: { id } });
    if (!signal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const memoRaw = await runSkill({
      systemPrompt: getOpportunityMemoPrompt(),
      userMessage: `Regenerate the Opportunity Memo based on:\nTitle: ${signal.title}\nSummary: ${signal.aiSummary}\nCategory: ${signal.category || 'General'}\n\nExisting Score: ${signal.opportunityScore}\n\nPlease generate a fresh, stronger Opportunity Memo. Return ONLY JSON.`,
      maxTokens: 1000,
    });

    const memoMatch = memoRaw.match(/\{[\s\S]*\}/);
    if (!memoMatch) throw new Error('Failed to parse generated JSON');
    
    const newCard = JSON.parse(memoMatch[0]);
    return NextResponse.json({ newCard });
  } catch (error: any) {
    console.error('Regenerate Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Apply merged card
  try {
    const { id } = await params;
    const { card } = await req.json();
    const updated = await (db as any).trendSignal.update({
      where: { id },
      data: { opportunityCard: JSON.stringify(card) }
    });
    return NextResponse.json({ signal: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
