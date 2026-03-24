import { runSkill, parseJSON } from '@/lib/claude';
import { getStudioContext, buildSystemPrompt } from '@/lib/context';
import { db } from '@/lib/db';
import { getBoiToolPrompt } from '@/lib/skills/boi-tools';
import type { UserPersona } from '@/types';

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.targetAudience || !body.researchQuestion) {
      return Response.json({ error: 'Missing required fields: targetAudience, researchQuestion' }, { status: 400 });
    }
    if (body.ideaId) {
      const idea = await db.idea.findUnique({ where: { id: body.ideaId } });
      if (!idea) return Response.json({ error: 'Idea not found' }, { status: 404 });
    }

    const context = await getStudioContext();
    const systemPrompt = buildSystemPrompt(getBoiToolPrompt('personas'), context);

    const raw = await runSkill({
      systemPrompt,
      userMessage: `Target Audience: ${body.targetAudience}\nResearch Question: ${body.researchQuestion}\n\nRespond with JSON only.`,
      maxTokens: 4096,
    });

    const result = parseJSON<UserPersona[]>(raw);

    if (body.ideaId) {
      await db.idea.update({
        where: { id: body.ideaId },
        data: { userPersonas: JSON.stringify(result) }
      });
    }

    return Response.json(result);
  } catch (error) {
    console.error('[tools/personas] Error:', error);
    return Response.json({ error: 'Failed to generate personas' }, { status: 500 });
  }
}
