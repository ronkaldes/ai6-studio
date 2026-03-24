'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, Loader2, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface ToolPanelProps {
  title: string;
  icon: LucideIcon;
  description: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  isGenerated: boolean;
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
  onRegenerate: () => void;
  inputForm: ReactNode;
  children: ReactNode;
}

export function ToolPanel({
  title, icon: Icon, description, accentColor, accentBg, accentBorder,
  isGenerated, isLoading, error, onGenerate, onRegenerate,
  inputForm, children,
}: ToolPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      'border-l-[3px] rounded-md transition-all overflow-hidden border border-[var(--border-dim)]',
      accentBorder,
      expanded ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-surface)]/50 hover:bg-[var(--bg-surface)]/80'
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <div className={cn('p-1.5 rounded-md', accentBg)}>
          <Icon className={cn('h-3.5 w-3.5', accentColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[12px] text-[var(--text-primary)]">{title}</h3>
          <p className="text-[10px] text-[var(--text-muted)] truncate">{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isGenerated && (
            <span className={cn('text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full', accentBg, accentColor)}>
              Generated
            </span>
          )}
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-[var(--text-muted)]" /> : <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-[var(--border-dim)] pt-3">
              {error && (
                <div className="mb-3 p-2 bg-[rgba(239,68,68,0.1)] border-l-2 border-[var(--score-kill)] text-[var(--score-kill)] text-[11px]">
                  {error}
                </div>
              )}

              {!isGenerated && !isLoading && (
                <div className="space-y-3">
                  {inputForm}
                  <div className="flex justify-end">
                    <button onClick={onGenerate} disabled={isLoading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--bg-elevated)] text-[11px] font-medium hover-surface disabled:opacity-30">
                      <Icon className="h-3 w-3" /> Generate
                    </button>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <Loader2 className={cn('h-6 w-6 animate-spin', accentColor)} />
                  <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest">
                    Generating {title.toLowerCase()}...
                  </span>
                </div>
              )}

              {isGenerated && !isLoading && (
                <div className="space-y-3">
                  {children}
                  <div className="flex justify-end pt-2 border-t border-[var(--border-dim)]">
                    <button onClick={onRegenerate} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] transition-colors">
                      <RotateCw className="h-3 w-3" /> Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
