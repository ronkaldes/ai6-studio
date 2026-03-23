import { FilterBar } from '@/components/trends/FilterBar';
import { SignalGrid } from '@/components/trends/SignalGrid';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function TrendsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const source = searchParams.source as string;
  const category = searchParams.category as string;
  const minScore = Number(searchParams.min_score) || 0;

  const signals = await db.trendSignal.findMany({
    where: {
      pipelineStatus: 'new',
      ...(source && source !== 'all' ? { source } : {}),
      ...(category && category !== 'all' ? { category } : {}),
      ...(minScore > 0 ? { opportunityScore: { gte: minScore } } : {})
    },
    orderBy: { opportunityScore: 'desc' },
    take: 50
  });

  return (
    <div className="max-w-[1200px] mx-auto w-full pt-2">
      <div className="flex flex-col mb-8 gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Trend Radar</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">Automated daily discovery of tech signals scored for venture opportunity potential.</p>
      </div>
      
      <FilterBar />
      <SignalGrid signals={signals as any} />
    </div>
  );
}
