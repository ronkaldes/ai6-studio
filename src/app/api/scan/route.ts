import { NextResponse, type NextRequest } from 'next/server';
import { runSkill, parseJSON } from '@/lib/claude';
import { getStudioContext, buildSystemPrompt } from '@/lib/context';
import { db } from '@/lib/db';
import { getTrendScanPrompt } from '@/lib/skills/trend-scanner';
import { clusterSignals } from '@/lib/clustering';
import type { TrendSignal } from '@/types';

export const maxDuration = 120; // seconds — required for Vercel

export async function POST(req: NextRequest) {
  const start = Date.now();
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get('campaignId');

  try {
    let focusInstruction = '';
    if (campaignId) {
      const campaign = await (db as any).campaign.findUnique({ where: { id: campaignId } });
      if (campaign?.domainFocus) {
        focusInstruction = `\n\nCRITICAL DIRECTIVE:\nThis scan is operating under a specific campaign focus: "${campaign.domainFocus}".\nYou MUST prioritize and heavily index signals that match this domain. Ensure the bulk of your results reflect this focus context.`;
      }
    }

    const context = await getStudioContext();
    const systemPrompt = buildSystemPrompt(getTrendScanPrompt() + focusInstruction, context);

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
        campaignId: campaignId || null,
      })),
    });
    
    // Perform semantic topic clustering
    await clusterSignals(runId);

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
