import { db } from './db';
import { runSkill, parseJSON } from './claude';

export async function clusterSignals(runId: string) {
  try {
    const newSignals = await (db as any).trendSignal.findMany({ where: { runId } });
    if (newSignals.length === 0) return;

    // Get unique cluster names from recent signals
    const existingClusters = await (db as any).trendSignal.findMany({
      where: { topicCluster: { not: null } },
      distinct: ['topicCluster'],
      select: { topicCluster: true },
      take: 50,
      orderBy: { createdAt: 'desc' }
    });

    const clusterNames = existingClusters.map((c: any) => c.topicCluster);

    const prompt = `
You are a Topic Clustering Assistant. Your goal is to group new venture signals into semantic topics for trend tracking.

EXISTING TOPICS:
${clusterNames.length > 0 ? clusterNames.join(', ') : 'None yet'}

NEW SIGNALS:
${newSignals.map((s: any) => `- ID: ${s.id}, Title: ${s.title}, Summary: ${s.aiSummary}`).join('\n')}

INSTRUCTIONS:
1. For each new signal, decide if it fits an EXISTING TOPIC or needs a NEW TOPIC (2-3 words, descriptive, e.g., "AI Developer Experience", "Crypto Infrastructure", "Sustainable SaaS").
2. Be precise but allow some grouping of related ideas.
3. Respond ONLY with a JSON object: { "assignments": [{ "id": "signal_id", "topic": "topic_name" }] }
`;

    const raw = await runSkill({
      systemPrompt: "You are a professional research analyst focused on venture capital and emerging technology. Return ONLY JSON.",
      userMessage: prompt,
      maxTokens: 4000
    });

    const result = parseJSON<{ assignments: { id: string; topic: string }[] }>(raw);
    
    if (result.assignments) {
      for (const assignment of result.assignments) {
        await (db as any).trendSignal.update({
          where: { id: assignment.id },
          data: { topicCluster: assignment.topic }
        });
      }
    }
    console.log(`[clustering] Assigned ${result.assignments?.length || 0} signals to clusters for run ${runId}`);
  } catch (e) {
    console.error('[clustering] failed:', e);
  }
}
