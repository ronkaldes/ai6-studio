import { NextResponse } from 'next/server';

export async function GET() {
  const hasToken = !!process.env.SLACK_BOT_TOKEN;
  const hasWebhook = !!process.env.SLACK_WEBHOOK_URL;
  const hasSecret = !!process.env.SLACK_SIGNING_SECRET;

  return NextResponse.json({
    configured: hasToken && hasWebhook && hasSecret,
    details: {
      botToken: hasToken,
      webhookUrl: hasWebhook,
      signingSecret: hasSecret,
    }
  });
}
