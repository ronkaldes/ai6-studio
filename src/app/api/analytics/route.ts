import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [ideas, signalsRaw] = await Promise.all([
      db.idea.findMany(),
      db.trendSignal.findMany(),
    ]);
    const signals = signalsRaw as any[];

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

    // Scan history: group signals by runId
    const runMap = new Map<string, { date: string; scores: number[] }>();
    for (const s of signals) {
      if (!s.runId) continue;
      if (!runMap.has(s.runId)) {
        runMap.set(s.runId, { date: s.createdAt.toISOString(), scores: [] });
      }
      runMap.get(s.runId)!.scores.push(s.opportunityScore);
    }
    const scanHistory = Array.from(runMap.entries())
      .map(([runId, { date, scores }]) => ({
        runId,
        date,
        count: scores.length,
        avgScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Kill rate by category: cross-reference killed ideas with source signal category
    const killRateByCategory: Record<string, number> = {};
    const killedIdeas = ideas.filter(i => i.boardDecision === 'kill');
    for (const idea of killedIdeas) {
      if (idea.sourceSignalId) {
        const sig = signals.find(s => s.id === idea.sourceSignalId);
        const cat = sig?.category || 'uncategorized';
        killRateByCategory[cat] = (killRateByCategory[cat] || 0) + 1;
      } else {
        killRateByCategory['uncategorized'] = (killRateByCategory['uncategorized'] || 0) + 1;
      }
    }

    // Trending Topics: group signals by topicCluster
    const topicMap = new Map<string, { signals: any[] }>();
    for (const s of signals) {
      if (!s.topicCluster) continue;
      if (!topicMap.has(s.topicCluster)) {
        topicMap.set(s.topicCluster, { signals: [] });
      }
      topicMap.get(s.topicCluster)!.signals.push(s);
    }
    const trendingTopics = Array.from(topicMap.entries())
      .map(([name, { signals }]) => {
        const sorted = signals.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const scores = sorted.map(s => s.opportunityScore);
        const latestScore = scores[scores.length - 1];
        const avgScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
        
        let increases = 0;
        for (let i = Math.max(1, scores.length - 4); i < scores.length; i++) {
          if (scores[i] > (scores[i - 1] || 0)) increases++;
        }
        const isHeatingUp = increases >= 2;

        return { name, count: signals.length, avgScore, latestScore, isHeatingUp };
      })
      .sort((a, b) => b.latestScore - a.latestScore || b.avgScore - a.avgScore)
      .slice(0, 10);

    return NextResponse.json({
      funnel, avgDaysPerStage, ventureScoreDistribution, conversionRate, sprintSuccessRate,
      scanHistory, killRateByCategory, trendingTopics,
    });
  } catch (error) {
    console.error('[analytics] Error:', error);
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 });
  }
}
