import { cn } from '@/lib/utils';

export function ScorePill({ score, max = 10, className }: { score: number, max?: number, className?: string }) {
  // Only apply verdict colors at verdict-level thresholds
  let scoreColor: string | null = null;
  if (max === 10) {
    if (score >= 7) scoreColor = 'var(--score-go)';
    else if (score >= 5) scoreColor = 'var(--score-cond)';
    else if (score >= 3) scoreColor = 'var(--score-pivot)';
    else scoreColor = 'var(--score-kill)';
  } else {
    // 0-100 venture score
    if (score >= 75) scoreColor = 'var(--score-go)';
    else if (score >= 55) scoreColor = 'var(--score-cond)';
    else if (score >= 35) scoreColor = 'var(--score-pivot)';
    else scoreColor = 'var(--score-kill)';
  }

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded font-bold border shrink-0 tabular-nums text-center text-[11px] bg-background",
        className
      )}
      style={{ borderColor: scoreColor, color: scoreColor }}
    >
      {score}{max === 10 ? '/10' : ''}
    </span>
  );
}
