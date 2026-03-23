'use client';

import { useState } from 'react';
import { Idea, BoardVote, BoardVerdict } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const BOARD_MEMBERS = ['Pankaj', 'Offir', 'Leor', 'Leeor', 'Asher', 'Ron'];
const VERDICTS: { id: BoardVerdict; label: string; color: string; bg: string }[] = [
  { id: 'go', label: 'GO', color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'conditional', label: 'CONDITIONAL', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'pivot', label: 'PIVOT', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'kill', label: 'KILL', color: 'text-destructive', bg: 'bg-destructive/10' }
];

export function VotingInterface({ idea, onComplete }: { idea: Idea, onComplete: () => void }) {
  const [votes, setVotes] = useState<BoardVote[]>([]);
  const [activeMember, setActiveMember] = useState(BOARD_MEMBERS[0]);
  const [currentVerdict, setCurrentVerdict] = useState<BoardVerdict | null>(null);
  const [currentRationale, setCurrentRationale] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVoteSubmit = () => {
    if (!currentVerdict || !currentRationale.trim()) return;
    
    setVotes(prev => {
      const newVotes = prev.filter(v => v.member_name !== activeMember);
      newVotes.push({
        member_name: activeMember,
        member_email: `${activeMember.toLowerCase()}@ai6labs.com`,
        verdict: currentVerdict,
        rationale: currentRationale,
        voted_at: new Date().toISOString()
      });
      return newVotes;
    });

    setCurrentVerdict(null);
    setCurrentRationale('');
    const unvoted = BOARD_MEMBERS.find(m => m !== activeMember && !votes.find(v => v.member_name === m && v.member_name !== activeMember));
    if (unvoted) setActiveMember(unvoted);
  };

  const handleSaveDecision = async () => {
    setLoading(true);
    // Determine consensus (most frequent vote)
    const counts = votes.reduce((acc, v) => ({ ...acc, [v.verdict]: (acc[v.verdict] || 0) + 1 }), {} as Record<string, number>);
    const consensus = Object.entries(counts).sort((a,b) => b[1] - a[1])[0][0] as BoardVerdict;
    
    try {
      await fetch('/api/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea_id: idea.id,
          votes,
          decision: consensus,
          learnings: 'Recorded automatically from board votes.'
        })
      });
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-surface border-border shadow-md w-full flex flex-col gap-6 mt-4">
      <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
        <span className="italic font-serif text-primary">III.</span> Board Voting Protocol
      </h2>
      
      <div className="flex gap-2 flex-wrap">
        {BOARD_MEMBERS.map(member => {
          const hasVoted = votes.some(v => v.member_name === member);
          const isActive = activeMember === member;
          return (
            <Button
              key={member}
              variant={isActive ? 'default' : hasVoted ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setActiveMember(member)}
              className={cn("text-xs font-mono uppercase tracking-widest", hasVoted && !isActive && "opacity-50")}
            >
              {member} {hasVoted && '✓'}
            </Button>
          );
        })}
      </div>

      <div className="flex flex-col gap-5 bg-muted/20 p-5 rounded-md border border-border/50 shadow-inner">
        <h3 className="font-bold text-sm text-foreground/80">Casting vote for: <span className="text-primary font-mono uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20 ml-2">{activeMember}</span></h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {VERDICTS.map(v => (
            <Button
              key={v.id}
              variant="outline"
              className={cn("h-12 text-[10px] sm:text-xs font-bold tracking-widest transition-all", 
                currentVerdict === v.id ? cn(v.bg, v.color, "border-current shadow-md scale-[1.02] ring-2 ring-current ring-offset-2 ring-offset-background") : "hover:border-foreground/30"
              )}
              onClick={() => setCurrentVerdict(v.id)}
            >
              {v.label}
            </Button>
          ))}
        </div>

        <Textarea 
          placeholder="Rationale (required)..." 
          value={currentRationale} 
          onChange={e => setCurrentRationale(e.target.value)}
          className="bg-background border-border text-sm min-h-[90px] focus:border-primary"
        />

        <div className="flex justify-end">
           <Button onClick={handleVoteSubmit} disabled={!currentVerdict || !currentRationale.trim() || loading} className="px-8 shadow-md">
             Record Vote
           </Button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-border mt-2">
        <div className="text-sm">
          <span className="font-mono text-muted-foreground mr-2 uppercase tracking-widest text-[10px]">Votes Cast:</span> 
          <span className="font-bold font-display text-lg">{votes.length} <span className="text-muted-foreground text-sm font-sans font-normal">/ {BOARD_MEMBERS.length}</span></span>
        </div>
        <Button onClick={handleSaveDecision} disabled={votes.length === 0 || loading} size="lg" className="bg-primary hover:bg-primary/90 px-8 shadow-lg shadow-primary/20">
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : null}
          Log Final Decision
        </Button>
      </div>
    </Card>
  );
}
