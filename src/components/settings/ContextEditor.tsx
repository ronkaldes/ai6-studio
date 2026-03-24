'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';

export function ContextEditor() {
  const [content, setContent] = useState('');
  const [stageGates, setStageGates] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/context')
      .then(res => res.json())
      .then(data => {
        setContent(data.content || '');
        setStageGates(data.stageGates || JSON.stringify({
          signal_to_refining: { required: [] },
          refining_to_validating: { required: ["opportunityMemo"] },
          validating_to_decision_gate: { required: ["ventureScore>=55", "experimentComplete>=1"] },
          decision_gate_to_active_sprint: { required: ["boardDecision:go|conditional"] },
          active_sprint_to_graduated: { required: ["sprintEndDate"] }
        }, null, 2));
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      await fetch('/api/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, stageGates })
      });
      setMsg('Studio context updated successfully. AI will use this immediately.');
      setTimeout(() => setMsg(''), 5000);
    } catch(err) {
      setMsg('Error saving context.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-24 flex flex-col items-center justify-center text-muted-foreground"><Loader2 className="animate-spin h-8 w-8 mb-4 opacity-50" /> <span className="font-mono text-sm uppercase tracking-widest">Loading Context Engine</span></div>;
  }

  return (
    <Card className="p-6 md:p-10 bg-surface border-border flex flex-col gap-8 shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/50 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <span className="text-primary italic font-serif">⚙</span> Global AI Context
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            This markdown document defines the Studio's parameters, constraints, and thesis. It is injected into every agent prompt across the platform to ensure extreme alignment.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 shrink-0">
          {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Save className="mr-2 h-5 w-5" />}
          {saving ? 'Syncing...' : 'Deploy Context'}
        </Button>
      </div>

      {msg && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-md text-primary text-sm font-medium flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {msg}
        </div>
      )}

      <div className="relative">
        <Textarea 
          value={content}
          onChange={e => setContent(e.target.value)}
          className="min-h-[500px] font-mono text-sm leading-relaxed p-6 bg-background border-border/50 focus:border-primary resize-y shadow-inner whitespace-pre-wrap"
          placeholder="Define your studio context..."
        />
        <div className="absolute top-2 right-4 text-[10px] text-muted-foreground font-mono uppercase tracking-widest pointer-events-none opacity-50">
          Markdown Supported
        </div>
      </div>

      <div className="flex flex-col border-t border-border/50 pt-8 mt-4 gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            Stage Gates Configuration
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            Configure the required JSON rules for ideas to advance through the pipeline.
          </p>
        </div>
        <div className="relative">
          <Textarea 
            value={stageGates}
            onChange={e => setStageGates(e.target.value)}
            className="min-h-[300px] font-mono text-sm leading-relaxed p-6 bg-background border-border/50 focus:border-primary resize-y shadow-inner whitespace-pre-wrap"
            placeholder="Define stage gates config JSON..."
          />
          <div className="absolute top-2 right-4 text-[10px] text-muted-foreground font-mono uppercase tracking-widest pointer-events-none opacity-50">
            JSON Required
          </div>
        </div>
      </div>
    </Card>
  );
}
