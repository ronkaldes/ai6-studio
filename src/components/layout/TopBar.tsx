'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ScanButton } from '@/components/trends/ScanButton';

export function TopBar() {
  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6 lg:px-8 shadow-sm relative z-20">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground hidden sm:inline-block mr-2">Last scan: 2h ago</span>
        <ScanButton />
        <Button size="sm" variant="outline" className="gap-2 border-primary/20 hover:bg-primary/10 text-primary bg-primary/5">
          New Idea
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
