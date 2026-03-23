'use client';

import { Idea, BoardSession, BoardVerdict } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScorePill } from '@/components/ui/ScorePill';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const verdictColors: Record<BoardVerdict, { bg: string, text: string, border: string }> = {
  go: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  conditional: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  pivot: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/30' },
  kill: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30' }
};

export function DecisionLog({ sessions, ideas }: { sessions: BoardSession[], ideas: Idea[] }) {
  if (sessions.length === 0) {
    return (
      <div className="p-12 border border-dashed border-border/50 rounded-xl bg-surface/30 text-center flex flex-col items-center">
        <span className="text-muted-foreground font-mono text-sm uppercase tracking-widest">No past decisions</span>
        <span className="text-xs text-muted-foreground mt-2 opacity-70">Complete board sessions to populate the log.</span>
      </div>
    );
  }

  return (
    <Card className="bg-surface border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-muted-foreground uppercase bg-muted/20 font-mono tracking-widest border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Idea Title</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Date</th>
              <th className="px-6 py-4 font-medium text-center">Score</th>
              <th className="px-6 py-4 font-medium w-[120px]">Verdict</th>
              <th className="px-6 py-4 font-medium hidden lg:table-cell">Learnings / Rationale</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => {
              const verdictStyle = verdictColors[session.decision];
              const idea = ideas.find(i => i.id === session.ideaId);
              if (!idea) return null;

              return (
                <tr key={session.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-foreground truncate block max-w-[200px] lg:max-w-[300px]">
                      {idea.title}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(session.sessionDate), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {idea.ventureScore ? <ScorePill score={idea.ventureScore} max={100} /> : <span className="text-muted-foreground">-</span>}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={cn("text-[10px] font-bold tracking-widest uppercase font-mono px-2", verdictStyle.bg, verdictStyle.text, verdictStyle.border)}>
                      {session.decision}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-muted-foreground truncate max-w-[400px]">
                    {session.learnings}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
