'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, Columns, CheckSquare, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const navigation = [
  { name: 'Trend Radar', href: '/trends', icon: TrendingUp },
  { name: 'Pipeline', href: '/pipeline', icon: Columns },
  { name: 'Validate', href: '/pipeline', icon: CheckSquare },
  { name: 'Board Room', href: '/board', icon: Users },
  { name: 'Settings', href: '/settings/context', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[64px] md:w-[240px] flex-col border-r border-border bg-sidebar transition-all duration-300">
      <div className="flex h-16 items-center justify-center md:justify-start md:px-6">
        <Link href="/" className="font-mono text-2xl font-bold text-primary">
          <span className="hidden md:inline">ai6 Labs</span>
          <span className="md:hidden">ai6</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-2 py-3 md:py-2 text-sm font-medium rounded-md md:rounded-none transition-colors relative',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary hidden md:block" />
              )}
              <item.icon
                className={cn('h-5 w-5 flex-shrink-0 md:mr-3 mx-auto', isActive ? 'text-primary' : 'text-muted-foreground')}
                aria-hidden="true"
              />
              <span className="hidden md:block">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary shrink-0 mx-auto md:mx-0">
            R
          </div>
          <div className="hidden md:flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-foreground">Ron</span>
            <span className="truncate text-xs text-muted-foreground">ron@ai6labs.com</span>
          </div>
          <Badge variant="outline" className="hidden md:flex ml-auto text-[10px] px-1 h-5">Lead</Badge>
        </div>
      </div>
    </div>
  );
}
