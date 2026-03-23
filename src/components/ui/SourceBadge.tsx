import { Badge } from '@/components/ui/badge';

const sourceMeta: Record<string, { label: string; color: string }> = {
  github: { label: 'GitHub', color: '#6E40C9' },
  reddit: { label: 'Reddit', color: '#FF4500' },
  producthunt: { label: 'PH', color: '#CC4400' },
  arxiv: { label: 'arXiv', color: '#B91C1C' },
  hn: { label: 'HN', color: '#F97316' },
  manual: { label: 'Manual', color: '#64748B' },
};

export function SourceBadge({ source }: { source: string }) {
  const meta = sourceMeta[source] || sourceMeta.manual;
  return (
    <Badge 
      variant="outline" 
      style={{ backgroundColor: `${meta.color}15`, borderColor: meta.color, color: meta.color }}
      className="text-[10px] px-2 py-0 border leading-relaxed h-[22px] uppercase tracking-wider font-mono font-bold"
    >
      {meta.label}
    </Badge>
  );
}
