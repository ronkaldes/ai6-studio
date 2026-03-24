import { App } from '@slack/bolt';

export const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN || '',
  signingSecret: process.env.SLACK_SIGNING_SECRET || '',
});

// Using this client to send messages
export const slack = slackApp.client;
