import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, summary } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Fetch all existing ideas with titles and memo snippets
    const existingIdeas = await db.idea.findMany({
      select: {
        id: true,
        title: true,
        opportunityMemo: true,
      },
    });

    if (existingIdeas.length === 0) {
      return NextResponse.json({ similar: false, matches: [] });
    }

    // Build comparison list: title + first 100 chars of memo
    const ideaSummaries = existingIdeas.map(idea => {
      let memoSnippet = '';
      if (idea.opportunityMemo) {
        try {
          const parsed = JSON.parse(idea.opportunityMemo);
          const problem = parsed.problem || '';
          memoSnippet = problem.slice(0, 100);
        } catch {
          memoSnippet = idea.opportunityMemo.slice(0, 100);
        }
      }
      return `- ID: ${idea.id} | Title: "${idea.title}" | Summary: "${memoSnippet}"`;
    }).join('\n');

    const client = new Anthropic();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Compare this new signal against the existing ideas in our pipeline. Are any semantically similar (addressing the same problem space, market, or solution approach)?

New signal:
- Title: "${title}"
- Summary: "${summary || 'N/A'}"

Existing ideas:
${ideaSummaries}

Respond with ONLY valid JSON, no markdown fences:
{
  "similar": boolean,
  "matches": [
    {
      "ideaId": "the matching idea's ID",
      "title": "the matching idea's title",
      "reason": "1 sentence explaining why it's similar"
    }
  ]
}

If no ideas are similar, return {"similar": false, "matches": []}.
Only flag ideas that are genuinely similar in problem space — not just tangentially related.`,
      }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    // Strip any markdown fences if present
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    try {
      const result = JSON.parse(cleaned);
      return NextResponse.json(result);
    } catch {
      return NextResponse.json({ similar: false, matches: [], _raw: cleaned });
    }
  } catch (error) {
    console.error('[check-similar] Error:', error);
    return NextResponse.json({ error: 'Failed to check for similar ideas' }, { status: 500 });
  }
}
