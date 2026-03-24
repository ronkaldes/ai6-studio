import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';
import { runSkill } from '@/lib/claude';
import { getOpportunityMemoPrompt } from '@/lib/skills/opportunity-memo';

export const maxDuration = 120; // Allow 2 mins for web fetch & Claude generation

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

function classifyDomain(urlStr: string) {
  try {
    const d = new URL(urlStr).hostname;
    if (d.includes('github')) return 'github';
    if (d.includes('reddit')) return 'reddit';
    if (d.includes('twitter') || d.includes('x.com')) return 'twitter';
    if (d.includes('ycombinator')) return 'hacker_news';
    return d;
  } catch {
    return 'manual';
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const source = classifyDomain(url);
    
    // Fetch page text
    const fetchRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const htmlText = await fetchRes.text();
    
    // Naively strip scripts and styles to save tokens
    const bodyMatch = htmlText.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let readableText = bodyMatch ? bodyMatch[1] : htmlText;
    readableText = readableText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    readableText = readableText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    readableText = readableText.replace(/<[^>]+>/g, ' '); // remove all remaining tags
    readableText = readableText.replace(/\s{2,}/g, ' ').slice(0, 15000); // compress whitespace and limit to ~15k chars

    // Call Claude
    const sysPrompt = `
You are an expert startup studio analyst.
Read the user-provided web content.
Generate a TrendSignal JSON with the following schema:
{
  "title": string (A concise, punchy title based on the content),
  "aiSummary": string (Exactly 2 concise sentences summarizing the key innovation, problem, or technology described),
  "category": string (e.g. "DevTools", "AI", "Fintech"),
  "opportunityScore": number (1-10, predicting the venture viability)
}
Return ONLY valid raw JSON without markdown code blocks.
`;

    const completion = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 500,
      system: sysPrompt,
      messages: [{ role: 'user', content: readableText }]
    });

    const responseText = (completion.content[0] as any).text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Claude returned invalid JSON');
    
    let parsed: any = {};
    try { parsed = JSON.parse(jsonMatch[0]); } catch(e) { throw new Error('Failed to parse generated JSON'); }

    // If score >= 7, also generate an opportunityCard
    let opportunityCard = null;
    if (parsed.opportunityScore >= 7) {
      // Create opportunity card using standard skill prompt
      const memoRaw = await runSkill({
        systemPrompt: getOpportunityMemoPrompt(),
        userMessage: `Based on this scraped article payload:\nTitle: ${parsed.title}\nSummary: ${parsed.aiSummary}\nCategory: ${parsed.category}\n\nGenerate an Opportunity Memo. Return ONLY JSON.`,
        maxTokens: 1000,
      });
      // Try to parse the memo
      const memoMatch = memoRaw.match(/\{[\s\S]*\}/);
      if (memoMatch) {
         try { opportunityCard = JSON.parse(memoMatch[0]); } catch(e) {}
      }
    }

    const signal = await db.trendSignal.create({
      data: {
        source,
        title: parsed.title,
        url,
        aiSummary: parsed.aiSummary,
        category: parsed.category,
        opportunityScore: parsed.opportunityScore,
        opportunityCard: opportunityCard ? JSON.stringify(opportunityCard) : null,
        pipelineStatus: 'new' // Automatically appears in Inbox
      }
    });

    return NextResponse.json({ signal });

  } catch (error: any) {
    console.error('Import URL Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
