import { runSkill, parseJSON } from '@/lib/claude';
import { getStudioContext, buildSystemPrompt } from '@/lib/context';
import { db } from '@/lib/db';
import { getBoiToolPrompt } from '@/lib/skills/boi-tools';
import type { BusinessReinventionResult } from '@/types';

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.company || !body.industry || !body.challenge) {
      return Response.json({ error: 'Missing required fields: company, industry, challenge' }, { status: 400 });
    }
    if (body.ideaId) {
      const idea = await db.idea.findUnique({ where: { id: body.ideaId } });
      if (!idea) return Response.json({ error: 'Idea not found' }, { status: 404 });
    }

    const context = await getStudioContext();
    const systemPrompt = buildSystemPrompt(getBoiToolPrompt('businessReinvention'), context);

    const raw = await runSkill({
      systemPrompt,
      userMessage: `Company: ${body.company}\nIndustry: ${body.industry}\nMain Challenge: ${body.challenge}\n\nRespond with JSON only.`,
      maxTokens: 6144,
    });

    const result = parseJSON<BusinessReinventionResult>(raw);

    if (body.ideaId) {
      await db.idea.update({
        where: { id: body.ideaId },
        data: { businessReinvention: JSON.stringify(result) }
      });
    }

    return Response.json(result);
  } catch (error) {
    console.error('[tools/business-reinvention] Error:', error);
    return Response.json({ error: 'Failed to generate business reinvention insights' }, { status: 500 });
  }
}
