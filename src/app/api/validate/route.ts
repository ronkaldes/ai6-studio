import { NextRequest, NextResponse } from 'next/server';
import { runAgent, runSkill, parseJSON } from '@/lib/claude';
import { getStudioContext, buildSystemPrompt } from '@/lib/context';
import { AGENT_PROMPTS } from '@/lib/skills/validator';
import { OPPORTUNITY_MEMO_PROMPT } from '@/lib/skills/opportunity-memo';
import { db } from '@/lib/db';
import type { AgentScore, OpportunityMemo, AssumptionItem } from '@/types';

export const maxDuration = 120; // Required for Vercel

export async function POST(req: NextRequest) {
  const { idea_id, step, data } = await req.json() as {
    idea_id: string;
    step: 1 | 2 | 3 | 4 | 5 | 6;
    data: Record<string, unknown>;
  };

  const idea = await db.idea.findUniqueOrThrow({ where: { id: idea_id } });
  const context = await getStudioContext();

  switch (step) {
    case 1: {
      const systemPrompt = buildSystemPrompt(`
You validate problem statements for a startup studio.
Check: Is the problem specific? Is there a named customer type? Is there a
clear description of what they do today instead? 
Respond JSON: { "complete": boolean, "feedback": "1 sentence if incomplete",
"refined_problem": "improved version if complete" }`, context);

      const result = await runAgent<{ complete: boolean; feedback: string; refined_problem: string }>(
        systemPrompt,
        data.problem_statement as string,
      );
      return NextResponse.json(result);
    }

    case 2: {
      const systemPrompt = buildSystemPrompt(OPPORTUNITY_MEMO_PROMPT, context);
      const raw = await runSkill({
        systemPrompt,
        userMessage: `Generate an Opportunity Memo for:\n\nTitle: ${idea.title}\nProblem: ${data.validated_problem}\n\nReturn JSON only.`,
        maxTokens: 2048,
      });
      const memo = parseJSON<OpportunityMemo>(raw);
      await db.idea.update({ where: { id: idea_id }, data: { opportunityMemo: JSON.stringify(memo) } });
      return NextResponse.json(memo);
    }

    case 3: {
      const ideaDescription = `Title: ${idea.title}\nMemo: ${JSON.stringify(idea.opportunityMemo)}`;
      const agentResults = await Promise.all(
        Object.entries(AGENT_PROMPTS).map(([name, promptFn]) =>
          runAgent<AgentScore>(promptFn(context), ideaDescription)
            .then((result) => ({ ...result, dimension: name }))
            .catch((err) => ({ dimension: name, error: String(err) } as unknown as AgentScore)),
        ),
      );
      await db.idea.update({ where: { id: idea_id }, data: { dvfScores: JSON.stringify(agentResults) } });
      return NextResponse.json({ agents: agentResults });
    }

    case 4: {
      const systemPrompt = buildSystemPrompt(`
Generate 8 key assumptions for a startup idea. For each, estimate:
- importance (0.0–1.0): how critical is this to success?
- evidence (0.0–1.0): how much evidence exists that it's true?
Top-left (high importance, low evidence) = test first.
Respond JSON: { "assumptions": [{ "id": "a1", "text": "...", "importance": 0.0-1.0, "evidence": 0.0-1.0 }] }`, context);

      const raw = await runSkill({
        systemPrompt,
        userMessage: `Idea: ${idea.title}\nMemo: ${JSON.stringify(idea.opportunityMemo)}\n\nReturn JSON only.`,
      });
      const { assumptions } = parseJSON<{ assumptions: AssumptionItem[] }>(raw);
      await db.idea.update({ where: { id: idea_id }, data: { assumptionMap: JSON.stringify(assumptions) } });
      return NextResponse.json({ assumptions });
    }

    case 5: {
      await db.idea.update({ where: { id: idea_id }, data: { experiments: JSON.stringify(data.experiments) } });
      return NextResponse.json({ ok: true });
    }

    case 6: {
      const scores = idea.dvfScores ? JSON.parse(idea.dvfScores) as AgentScore[] : null;
      const ventureScore = scores ? computeVentureScore(scores) : null;
      await db.idea.update({
        where: { id: idea_id },
        data: {
          stage: 'decision_gate',
          ventureScore,
          submittedBy: data.submitted_by as string,
        },
      });
      return NextResponse.json({ ventureScore, stage: 'decision_gate' });
    }

    default:
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
  }
}

function computeVentureScore(scores: AgentScore[]): number {
  // Extract individual dimensions from agent results, apply weights
  const get = (agent: string, field: string): number => {
    const a = scores.find((s) => s.dimension === agent);
    return ((a as any)?.[field] as number) ?? 3;
  };

  const desirability      = (get('market_analyst', 'desirability') + get('customer_advocate', 'user_desirability')) / 2;
  const strategicFit      = get('market_analyst', 'market_size');
  const marketSize        = get('market_analyst', 'market_size');
  const techFeasibility   = get('technical_architect', 'feasibility');
  const revenuePath       = get('vc_evaluator', 'revenue_path');
  const distribution      = get('distribution_strategist', 'distribution_leverage');
  const whyNow            = get('vc_evaluator', 'viability');

  const raw =
    desirability    * 0.20 +
    strategicFit    * 0.20 +
    marketSize      * 0.15 +
    techFeasibility * 0.15 +
    revenuePath     * 0.15 +
    distribution    * 0.10 +
    whyNow          * 0.05;

  return Math.round((raw / 5) * 100);
}
