import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [ideas, signals] = await Promise.all([
      db.idea.findMany(),
      db.trendSignal.findMany(),
    ]);

    const stageLabels: Record<string, string> = {
      signal: 'Signal', refining: 'Refining', validating: 'Validating',
      decision_gate: 'Decision Gate', active_sprint: 'Active Sprint', graduated: 'Graduated',
    };

    const funnel = Object.entries(stageLabels).map(([stage, label]) => ({
      stage, label, count: ideas.filter(i => i.stage === stage).length,
    }));

    const avgDaysPerStage: Record<string, number> = {};
    for (const stage of Object.keys(stageLabels)) {
      const inStage = ideas.filter(i => i.stage === stage);
      avgDaysPerStage[stage] = inStage.length > 0
        ? Math.round(inStage.reduce((sum, i) => sum + i.daysInStage, 0) / inStage.length)
        : 0;
    }

    const scored = ideas.filter(i => i.ventureScore != null);
    const ranges = ['0-20', '21-40', '41-60', '61-80', '81-100'];
    const ventureScoreDistribution = ranges.map(range => {
      const [min, max] = range.split('-').map(Number);
      return { range, count: scored.filter(i => i.ventureScore! >= min && i.ventureScore! <= max).length };
    });

    const totalSignals = signals.length;
    const promoted = signals.filter(s => s.pipelineStatus === 'promoted').length;
    const conversionRate = { total_signals: totalSignals, promoted, rate: totalSignals > 0 ? Math.round((promoted / totalSignals) * 100) : 0 };

    const goDecisions = ideas.filter(i => i.boardDecision === 'go');
    const graduated = ideas.filter(i => i.stage === 'graduated' && i.boardDecision === 'go');
    const sprintSuccessRate = {
      total_go: goDecisions.length,
      graduated: graduated.length,
      rate: goDecisions.length > 0 ? Math.round((graduated.length / goDecisions.length) * 100) : 0,
    };

    return NextResponse.json({ funnel, avgDaysPerStage, ventureScoreDistribution, conversionRate, sprintSuccessRate });
  } catch (error) {
    console.error('[analytics] Error:', error);
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 });
  }
}
