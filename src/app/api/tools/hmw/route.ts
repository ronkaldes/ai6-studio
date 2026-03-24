import { runSkill, parseJSON } from '@/lib/claude';
import { getStudioContext, buildSystemPrompt } from '@/lib/context';
import { db } from '@/lib/db';
import { getBoiToolPrompt } from '@/lib/skills/boi-tools';
import type { HMWStatement } from '@/types';

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.targetAudience || !body.problemDescription) {
      return Response.json({ error: 'Missing required fields: targetAudience, problemDescription' }, { status: 400 });
    }
    if (body.ideaId) {
      const idea = await db.idea.findUnique({ where: { id: body.ideaId } });
      if (!idea) return Response.json({ error: 'Idea not found' }, { status: 404 });
    }

    const context = await getStudioContext();
    const systemPrompt = buildSystemPrompt(getBoiToolPrompt('hmw'), context);

    const raw = await runSkill({
      systemPrompt,
      userMessage: `Target Audience: ${body.targetAudience}\nProblem: ${body.problemDescription}\n\nRespond with JSON only.`,
      maxTokens: 2048,
    });

    const result = parseJSON<HMWStatement[]>(raw);

    if (body.ideaId) {
      await db.idea.update({
        where: { id: body.ideaId },
        data: { hmwStatements: JSON.stringify(result) }
      });
    }

    return Response.json(result);
  } catch (error) {
    console.error('[tools/hmw] Error:', error);
    return Response.json({ error: 'Failed to generate HMW statements' }, { status: 500 });
  }
}
