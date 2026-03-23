import { cn } from '@/lib/utils';

export function ScorePill({ score, max = 10, className }: { score: number, max?: number, className?: string }) {
  let scoreColor = 'var(--score-kill)';
  if (max === 10) {
    if (score >= 7) scoreColor = 'var(--score-go)';
    else if (score >= 5) scoreColor = 'var(--score-cond)';
  } else {
    // 0-100 venture score
    if (score >= 75) scoreColor = 'var(--score-go)';
    else if (score >= 55) scoreColor = 'var(--score-cond)';
    else if (score >= 35) scoreColor = 'var(--score-pivot)';
  }

  return (
    <span 
      className={cn("px-2.5 py-0.5 rounded-full font-bold border-2 shrink-0 tabular-nums text-center text-[13px] bg-background", className)}
      style={{ borderColor: scoreColor, color: scoreColor }}
    >
      {score}{max === 10 ? '/10' : ''}
    </span>
  );
}
