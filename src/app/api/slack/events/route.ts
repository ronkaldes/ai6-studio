import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slack } from '@/lib/slack';
import crypto from 'crypto';

// Minimal Slack request verification
function verifySlackRequest(req: NextRequest, bodyText: string) {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) return false;

  const signature = req.headers.get('x-slack-signature');
  const timestamp = req.headers.get('x-slack-request-timestamp');

  if (!signature || !timestamp) return false;

  const time = parseInt(timestamp, 10);
  if (Math.abs(Date.now() / 1000 - time) > 300) return false; // > 5 mins difference

  const sigBasestring = `v0:${timestamp}:${bodyText}`;
  const mySignature = 'v0=' + crypto.createHmac('sha256', secret).update(sigBasestring).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(mySignature), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  // Check graceful degradation
  if (!process.env.SLACK_BOT_TOKEN) {
    return NextResponse.json({ error: 'Service Unavailable' }, { status: 503 });
  }

  const bodyText = await req.clone().text();
  
  // Verify signature if secret exists
  if (process.env.SLACK_SIGNING_SECRET && !verifySlackRequest(req, bodyText)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentType = req.headers.get('content-type') || '';
  let payload: any = {};

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const data = await req.formData();
    payload = Object.fromEntries(data.entries());
    
    // Sometimes Slack sends payload as JSON string inside payload field
    if (payload.payload) {
      payload = JSON.parse(payload.payload as string);
    }
  } else {
    payload = await req.json();
  }

  // Handle URL Verification
  if (payload.type === 'url_verification') {
    return NextResponse.json({ challenge: payload.challenge });
  }

  // Handle /ai6-idea Command
  if (payload.command === '/ai6-idea') {
    try {
      if (slack && process.env.SLACK_BOT_TOKEN) {
        await slack.views.open({
          trigger_id: payload.trigger_id,
          view: {
            type: 'modal',
            callback_id: 'idea_submission_modal',
            title: { type: 'plain_text', text: 'Submit Idea to ai6' },
            submit: { type: 'plain_text', text: 'Submit' },
            blocks: [
              {
                type: 'input',
                block_id: 'title_block',
                element: { type: 'plain_text_input', action_id: 'title_input' },
                label: { type: 'plain_text', text: 'Idea Title/URL' },
              },
              {
                type: 'input',
                block_id: 'problem_block',
                element: { type: 'plain_text_input', action_id: 'problem_input', multiline: true },
                label: { type: 'plain_text', text: 'Problem Statement' },
              },
              {
                type: 'input',
                block_id: 'category_block',
                element: { type: 'plain_text_input', action_id: 'category_input' },
                label: { type: 'plain_text', text: 'Category (e.g. Developer Tools, AI)' },
              }
            ]
          }
        });
      }
      return NextResponse.json({ response_type: 'ephemeral', text: 'Opening submission form...' });
    } catch (e) {
      console.error('Slack open modal error', e);
      return NextResponse.json({ response_type: 'ephemeral', text: 'Failed to open modal.' });
    }
  }

  // Handle Modal Submission
  if (payload.type === 'view_submission' && payload.view.callback_id === 'idea_submission_modal') {
    const values = payload.view.state.values;
    const title = values.title_block.title_input.value;
    const problem = values.problem_block.problem_input.value;
    const category = values.category_block.category_input.value;
    const userId = payload.user.id;

    try {
      const idea = await db.idea.create({
        data: {
          title,
          stage: 'signal', // mapped to Inbox technically
          submittedBy: userId,
          opportunityMemo: JSON.stringify({
            problem: problem,
            category: category,
          })
        }
      });

      if (slack && process.env.SLACK_BOT_TOKEN) {
        await slack.chat.postMessage({
          channel: userId,
          text: `Idea created: *${title}* — view in ai6 Studio (ID: \`${idea.id}\`)`
        });
      }
      
      return NextResponse.json({ response_action: 'clear' });
    } catch (e) {
      console.error('Slack idea submission error', e);
      return NextResponse.json({ response_action: 'errors', errors: { title_block: 'Failed to save idea' } });
    }
  }

  return NextResponse.json({ ok: true });
}
