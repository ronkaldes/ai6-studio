import { runSkill, parseJSON } from '@/lib/claude';
import { getStudioContext, buildSystemPrompt } from '@/lib/context';
import { db } from '@/lib/db';
import { BOI_TOOL_PROMPTS } from '@/lib/skills/boi-tools';
import type { FutureScenario } from '@/types';

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.year || !body.industry || !body.sector) {
      return Response.json({ error: 'Missing required fields: year, industry, sector' }, { status: 400 });
    }
    if (body.year < 2025 || body.year > 2100) {
      return Response.json({ error: 'Year must be between 2025 and 2100' }, { status: 400 });
    }
    if (body.ideaId) {
      const idea = await db.idea.findUnique({ where: { id: body.ideaId } });
      if (!idea) return Response.json({ error: 'Idea not found' }, { status: 404 });
    }

    const context = await getStudioContext();
    const systemPrompt = buildSystemPrompt(BOI_TOOL_PROMPTS.futureScenarios, context);

    const raw = await runSkill({
      systemPrompt,
      userMessage: `Generate future scenarios for:\nYear: ${body.year}\nIndustry: ${body.industry}\nSector: ${body.sector}\n\nRespond with JSON only.`,
      maxTokens: 6144,
    });

    const parsed = parseJSON<{ scenarios: FutureScenario[] }>(raw);

    const run = await db.futureScenarioRun.create({
      data: {
        year: body.year,
        industry: body.industry,
        sector: body.sector,
        scenarios: JSON.stringify(parsed.scenarios),
        ideaId: body.ideaId || null,
      }
    });

    if (body.ideaId) {
      await db.idea.update({
        where: { id: body.ideaId },
        data: { futureScenarios: JSON.stringify(parsed.scenarios) }
      });
    }

    return Response.json({ ...parsed, id: run.id });
  } catch (error) {
    console.error('[tools/future-scenarios] Error:', error);
    return Response.json({ error: 'Failed to generate future scenarios' }, { status: 500 });
  }
}
