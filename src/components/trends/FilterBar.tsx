'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

const sources = ['all', 'github', 'reddit', 'producthunt', 'arxiv', 'hn'];
const categories = ['all', 'ai', 'developer_tools', 'consumer', 'hardware', 'data', 'saas', 'other'];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSource = searchParams.get('source') || 'all';
  const currentCategory = searchParams.get('category') || 'all';
  const minScore = Number(searchParams.get('min_score') || 0);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all' || value === '0') {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  const setParam = (name: string, value: string) => {
    router.push(`?${createQueryString(name, value)}`, { scroll: false });
  };

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-surface p-5 rounded-xl border border-border mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mr-2">Source:</span>
        {sources.map(s => (
          <Badge 
            key={s} 
            variant={currentSource === s ? 'default' : 'outline'}
            className={cn("cursor-pointer hover:bg-primary/80 uppercase text-[10px] h-6", currentSource === s && "bg-primary text-primary-foreground")}
            onClick={() => setParam('source', s)}
          >
            {s}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
        <div className="flex items-center gap-4 min-w-[200px]">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest w-24">Min Score: {minScore}</span>
          <Slider 
            defaultValue={[minScore]} 
            max={10} 
            step={1}
            className="w-[120px]"
            onValueChange={(vals) => setParam('min_score', (Array.isArray(vals) ? vals[0] : vals).toString())}
          />
        </div>

        <select 
          className="bg-background border border-border text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary uppercase tracking-wider text-[11px] font-mono cursor-pointer"
          value={currentCategory}
          onChange={(e) => setParam('category', e.target.value)}
        >
          <option value="all">ALL CATEGORIES</option>
          {categories.filter(c => c !== 'all').map(c => (
            <option key={c} value={c}>{c.replace('_', ' ')}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
