import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 120;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: NextRequest) {
  const { idea_id, votes, decision, learnings } = await req.json();

  const session = await db.boardSession.create({
    data: {
      ideaId: idea_id,
      attendees: JSON.stringify(Array.from(new Set(votes.map((v: any) => v.member_name)))),
      decision,
      votes: JSON.stringify(votes),
      learnings: learnings || null,
    }
  });

  const stageMap: Record<string, string> = {
    go: 'active_sprint',
    conditional: 'validating',
    pivot: 'refining',
    kill: 'graduated',
  }
  const newStage = stageMap[decision] || 'active_sprint'

  const updatedIdea = await db.idea.update({
    where: { id: idea_id },
    data: {
      stage: newStage,
      daysInStage: 0,
      boardDecision: decision,
      boardRationale: learnings,
      boardVotes: JSON.stringify(votes)
    }
  });

  // 3A. Learnings Library - Auto-create Learning for 'kill' decisions
  if (decision === 'kill' && learnings) {
    try {
      const completion = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 300,
        system: "You are an expert startup studio analyst. Extract the primary reason for killing an idea into a sharp, 1-sentence key learning. Also provide 2-3 relevant tags/categories.",
        messages: [{
          role: 'user',
          content: `Synthesize a 1-sentence key learning from this board rationale: "${learnings}". Return JSON with keys: "keySentence" (string) and "tags" (string array).`
        }]
      });

      const responseText = (completion.content[0] as any).text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      let parsed = { keySentence: "Board killed the idea.", tags: ["killed"] };
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }

      // Try to extract category from opportunityMemo if it exists
      let category = null;
      try {
        if (typeof updatedIdea.opportunityMemo === 'string') {
          const ops = JSON.parse(updatedIdea.opportunityMemo as string);
          category = ops?.category;
        } else if (updatedIdea.opportunityMemo) {
          category = (updatedIdea.opportunityMemo as any).category;
        }
      } catch (e) {}

      await (db as any).learning.create({
        data: {
          ideaId: updatedIdea.id,
          ideaTitle: updatedIdea.title,
          category: category || 'General',
          killReason: learnings,
          keySentence: parsed.keySentence,
          tags: parsed.tags
        }
      });
    } catch (e) {
      console.error('Failed to auto-create learning record', e);
    }
  }

  return NextResponse.json({ session });
}
