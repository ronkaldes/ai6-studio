'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react';

const MESSAGES = [
  "Initializing scan...",
  "Searching GitHub trending...",
  "Scanning Reddit communities...",
  "Checking Product Hunt launches...",
  "Analyzing arXiv papers...",
  "Parsing Hacker News...",
  "Generating opportunity cards...",
];

export function ScanButton() {
  const [loading, setLoading] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMsgIdx(i => (i + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleScan = async () => {
    setLoading(true);
    setMsgIdx(0);
    try {
      const res = await fetch('/api/scan', { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      router.refresh(); // Reload grid to show new signals
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {loading && (
        <span className="text-[10px] text-primary font-mono uppercase tracking-widest animate-pulse hidden md:inline-block border border-primary/20 bg-primary/10 px-3 py-1.5 rounded">
          {MESSAGES[msgIdx]}
        </span>
      )}
      <Button 
        onClick={handleScan} 
        disabled={loading} 
        variant="default" 
        size="sm" 
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        {loading ? 'Scanning' : 'Run Scan'}
      </Button>
    </div>
  );
}
