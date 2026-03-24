import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slack } from '@/lib/slack';
import { subDays } from 'date-fns';

export async function GET() {
  // Graceful degradation check
  if (!process.env.SLACK_WEBHOOK_URL) {
    return NextResponse.json({ error: 'Slack Webhook Not Configured' }, { status: 503 });
  }

  try {
    const oneWeekAgo = subDays(new Date(), 7);

    // Compute stats
    const newSignals = await db.trendSignal.count({
      where: { createdAt: { gte: oneWeekAgo } }
    });

    const killedIdeas = await db.idea.count({
      where: { boardDecision: 'kill', updatedAt: { gte: oneWeekAgo } }
    });

    const pendingBoard = await db.idea.count({
      where: { stage: 'decision_gate' }
    });

    // Formatting Slack layout
    const blocks = [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'ai6 Studio Weekly Digest :robot_face:', emoji: true }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Here's what happened in the lab this week:\n• *${newSignals}* new signals scanned\n• *${killedIdeas}* ideas killed\n• *${pendingBoard}* ideas pending Board Review`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Go to Board', emoji: true },
            url: process.env.NEXT_PUBLIC_APP_URL || 'https://studio.ai6.com'
          }
        ]
      }
    ];

    // Send via webhook (Using straight fetch to the webhook URL)
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    });

    return NextResponse.json({ ok: true, stats: { newSignals, killedIdeas, pendingBoard } });
  } catch (error) {
    console.error('Slack digest error', error);
    return NextResponse.json({ error: 'Failed to generate digest' }, { status: 500 });
  }
}
