import { runSkill, parseJSON } from '@/lib/claude';
import { getStudioContext, buildSystemPrompt } from '@/lib/context';
import { db } from '@/lib/db';
import { getBoiToolPrompt } from '@/lib/skills/boi-tools';
import type { AISimulationResult } from '@/types';

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.scenario || !body.budget || !body.dataStrategy || !body.businessGoal || !body.integrationApproach) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (body.ideaId) {
      const idea = await db.idea.findUnique({ where: { id: body.ideaId } });
      if (!idea) return Response.json({ error: 'Idea not found' }, { status: 404 });
    }

    const context = await getStudioContext();
    const systemPrompt = buildSystemPrompt(getBoiToolPrompt('simulation'), context);

    const raw = await runSkill({
      systemPrompt,
      userMessage: `AI Transformation Scenario: ${body.scenario}\nInvestment Budget: ${body.budget}\nData Strategy: ${body.dataStrategy}\nPrimary Business Goal: ${body.businessGoal}\nIntegration Approach: ${body.integrationApproach}\n\nRespond with JSON only.`,
      maxTokens: 6144,
    });

    const result = parseJSON<AISimulationResult>(raw);

    if (body.ideaId) {
      await db.idea.update({
        where: { id: body.ideaId },
        data: { aiSimulation: JSON.stringify(result) }
      });
    }

    return Response.json(result);
  } catch (error) {
    console.error('[tools/simulation] Error:', error);
    return Response.json({ error: 'Failed to run simulation' }, { status: 500 });
  }
}
