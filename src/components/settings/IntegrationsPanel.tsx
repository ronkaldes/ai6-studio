'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface SlackStatus {
  configured: boolean;
  details: {
    botToken: boolean;
    webhookUrl: boolean;
    signingSecret: boolean;
  }
}

export function IntegrationsPanel() {
  const [status, setStatus] = useState<SlackStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/slack/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Card className="p-6 bg-surface border-border shadow-md">
        <div className="flex items-center justify-center p-4">
          <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8 bg-surface border-border flex flex-col gap-6 shadow-md mt-6">
      <div className="border-b border-border/50 pb-4">
        <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
          Integrations
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Manage connections to external tools and services.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Slack Integration */}
        <div className="border border-border/50 rounded-lg p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#4A154B] flex flex-col items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Slack App</h3>
                <p className="text-xs text-muted-foreground">Slash commands and weekly digest</p>
              </div>
            </div>
            
            {status?.configured ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-semibold">
                <CheckCircle2 size={14} /> Active
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-semibold">
                <XCircle size={14} /> Not Configured
              </div>
            )}
          </div>

          {!status?.configured && status?.details && (
            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md border border-border/30 mt-2">
              <p className="font-semibold mb-1 text-foreground">Missing Environment Variables:</p>
              <ul className="list-disc pl-4 space-y-1">
                {!status.details.botToken && <li><code>SLACK_BOT_TOKEN</code></li>}
                {!status.details.webhookUrl && <li><code>SLACK_WEBHOOK_URL</code></li>}
                {!status.details.signingSecret && <li><code>SLACK_SIGNING_SECRET</code></li>}
              </ul>
              <p className="mt-3">Configure these in your <code>.env.local</code> to enable Slack features.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
