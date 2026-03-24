import { runSkill, parseJSON } from '@/lib/claude';
import { getStudioContext, buildSystemPrompt } from '@/lib/context';
import { db } from '@/lib/db';
import { BOI_TOOL_PROMPTS } from '@/lib/skills/boi-tools';
import type { AIStrategyMatrixResult } from '@/types';

export const maxDuration = 120;

const VALID_AMBITIONS = ['optimize', 'differentiate', 'transform', 'disrupt'];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.productOffering || !body.operationalModel || !body.aiAmbition || !body.competitiveLandscape) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!VALID_AMBITIONS.includes(body.aiAmbition)) {
      return Response.json({ error: `aiAmbition must be one of: ${VALID_AMBITIONS.join(', ')}` }, { status: 400 });
    }
    if (body.ideaId) {
      const idea = await db.idea.findUnique({ where: { id: body.ideaId } });
      if (!idea) return Response.json({ error: 'Idea not found' }, { status: 404 });
    }

    const context = await getStudioContext();
    const systemPrompt = buildSystemPrompt(BOI_TOOL_PROMPTS.strategyMatrix, context);

    const raw = await runSkill({
      systemPrompt,
      userMessage: `Product/Service: ${body.productOffering}\nOperational Model: ${body.operationalModel}\nAI Ambition: ${body.aiAmbition}\nCompetitive Landscape: ${body.competitiveLandscape}\n\nRespond with JSON only.`,
      maxTokens: 4096,
    });

    const result = parseJSON<AIStrategyMatrixResult>(raw);

    if (body.ideaId) {
      await db.idea.update({
        where: { id: body.ideaId },
        data: { aiStrategyMatrix: JSON.stringify(result) }
      });
    }

    return Response.json(result);
  } catch (error) {
    console.error('[tools/strategy-matrix] Error:', error);
    return Response.json({ error: 'Failed to generate strategy matrix' }, { status: 500 });
  }
}
