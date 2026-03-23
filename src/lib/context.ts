import { db } from './db';

// DEFAULT context — overridden by whatever is saved in DB via Settings UI
export const DEFAULT_STUDIO_CONTEXT = `
## Studio Identity
ai6 Labs is an independent startup studio. Domain-agnostic — can build ventures
in any category: AI, SaaS, developer tools, consumer, hardware, data platforms.
Core advantage: speed + structured validation. 90-day sprint model.

## What Makes a Good ai6 Venture
- Specific, evidenced customer pain — not "people want this"
- Working prototype possible in 90 days with 2–4 engineers
- Monetization path active within 12 months
- Specific "Why Now" trigger (not "AI is hot")
- Known distribution channel before sprint starts

## Team Capabilities
Full-stack web (Next.js, React, Node.js, Python), AI/ML integration (Claude API,
OpenAI, open source models), mobile (React Native), hardware prototyping available.

## Current Opportunity Themes
Update this section weekly after advisory board meeting.
Current: [NOT SET — update via Settings → Project Context]

## What We Are NOT Pursuing Right Now
- Pure research with no commercial path in 12 months
- Ventures requiring >$5M to reach first revenue
- Domains requiring regulatory approval unless fast-track exists
- Pure consumer social without a clear monetization wedge
`.trim();

export async function getStudioContext(): Promise<string> {
  try {
    const ctx = await db.projectContext.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    return ctx?.content ?? DEFAULT_STUDIO_CONTEXT;
  } catch {
    // Fallback if DB is unreachable during dev
    return DEFAULT_STUDIO_CONTEXT;
  }
}

// Utility: build full system prompt for any skill call
export function buildSystemPrompt(skillInstructions: string, context: string): string {
  return `${skillInstructions}\n\n---\n\n## Current Studio Context\n\n${context}`;
}
