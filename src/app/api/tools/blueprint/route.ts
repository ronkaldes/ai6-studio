import { runSkill, parseJSON } from '@/lib/claude';
import { getStudioContext, buildSystemPrompt } from '@/lib/context';
import { db } from '@/lib/db';
import { BOI_TOOL_PROMPTS } from '@/lib/skills/boi-tools';
import type { AIBlueprintResult } from '@/types';

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.industry || !body.adoptionLevel || !body.goals || !body.dataInfra || !body.challenges) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (body.ideaId) {
      const idea = await db.idea.findUnique({ where: { id: body.ideaId } });
      if (!idea) return Response.json({ error: 'Idea not found' }, { status: 404 });
    }

    const context = await getStudioContext();
    const systemPrompt = buildSystemPrompt(BOI_TOOL_PROMPTS.blueprint, context);

    const goalsStr = Array.isArray(body.goals) ? body.goals.join(', ') : body.goals;
    const challengesStr = Array.isArray(body.challenges) ? body.challenges.join(', ') : body.challenges;

    const raw = await runSkill({
      systemPrompt,
      userMessage: `Industry: ${body.industry}\nCurrent AI Adoption Level: ${body.adoptionLevel}\nTransformation Goals: ${goalsStr}\nData Infrastructure: ${body.dataInfra}\nKey Challenges: ${challengesStr}\n\nRespond with JSON only.`,
      maxTokens: 8192,
    });

    const result = parseJSON<AIBlueprintResult>(raw);

    if (body.ideaId) {
      await db.idea.update({
        where: { id: body.ideaId },
        data: { aiBlueprint: JSON.stringify(result) }
      });
    }

    return Response.json(result);
  } catch (error) {
    console.error('[tools/blueprint] Error:', error);
    return Response.json({ error: 'Failed to generate blueprint' }, { status: 500 });
  }
}
