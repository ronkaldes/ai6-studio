import { NextResponse } from 'next/server';
import { runSkill, parseJSON } from '@/lib/claude';
import { getStudioContext, buildSystemPrompt } from '@/lib/context';
import { db } from '@/lib/db';
import { TREND_SCAN_SYSTEM } from '@/lib/skills/trend-scanner';
import type { TrendSignal } from '@/types';

export const maxDuration = 120; // seconds — required for Vercel

export async function POST() {
  const start = Date.now();

  try {
    const context = await getStudioContext();
    const systemPrompt = buildSystemPrompt(TREND_SCAN_SYSTEM, context);

    const raw = await runSkill({
      systemPrompt,
      userMessage: `Run a full trend intelligence scan. Today is ${new Date().toISOString()}.
Return JSON only — no prose, no markdown.`,
      enableWebSearch: true,
      maxTokens: 8192,
    });

    const result = parseJSON<{ signals: TrendSignal[]; scan_metadata: Record<string, unknown> }>(raw);
    const runId = crypto.randomUUID();

    // Persist all signals to DB
    const saved = await db.trendSignal.createMany({
      data: result.signals.map((s) => ({
        source: s.source,
        title: s.title,
        url: s.url,
        velocitySignal: s.velocitySignal,
        opportunityScore: s.opportunityScore,
        category: s.category,
        aiSummary: s.aiSummary,
        opportunityCard: s.opportunityCard ? JSON.stringify(s.opportunityCard) : undefined,
        pipelineStatus: 'new',
        runId,
      })),
    });

    return NextResponse.json({
      run_id: runId,
      signals_found: result.signals.length,
      signals_above_threshold: result.signals.filter((s) => s.opportunityScore >= 7).length,
      scan_duration_ms: Date.now() - start,
      signals: result.signals,
    });
  } catch (error) {
    console.error('[scan] error:', error);
    return NextResponse.json(
      { error: 'Scan failed', details: String(error) },
      { status: 500 },
    );
  }
}
