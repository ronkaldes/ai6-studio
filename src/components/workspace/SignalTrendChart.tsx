import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { TrendSignal } from '@/types';
import { format } from 'date-fns';

interface SignalTrendChartProps {
  currentSignal: TrendSignal;
  allSignals: TrendSignal[];
}

export function SignalTrendChart({ currentSignal, allSignals }: SignalTrendChartProps) {
  if (!currentSignal.topicCluster) return null;

  const clusterSignals = allSignals
    .filter(s => s.topicCluster === currentSignal.topicCluster)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (clusterSignals.length < 2) return null;

  const data = clusterSignals.map(s => ({
    date: format(new Date(s.createdAt), 'MMM d'),
    score: s.opportunityScore,
    fullDate: s.createdAt
  }));

  // Determine if "Heating Up"
  // 3+ consecutive score increases
  let consecutiveIncreases = 0;
  let isHeatingUp = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i].score > data[i - 1].score) {
      consecutiveIncreases++;
      if (consecutiveIncreases >= 2) { // 3 points = 2 increases
        isHeatingUp = true;
      }
    } else if (data[i].score < data[i-1].score) {
      consecutiveIncreases = 0;
    }
  }

  return (
    <div className="mt-6 border-t border-[var(--border-dim)] pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Topic Trend: {currentSignal.topicCluster}</span>
           {isHeatingUp && (
             <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 text-[9px] font-bold border border-orange-100 animate-pulse">
               HEATING UP
             </span>
           )}
        </div>
      </div>
      
      <div className="h-[120px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              hide={false} 
              fontSize={9} 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'var(--text-muted)' }}
            />
            <YAxis 
              domain={[0, 10]} 
              hide 
            />
            <Tooltip 
              contentStyle={{ fontSize: '10px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-dim)' }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke={isHeatingUp ? "#F97316" : "var(--accent-highlight)"} 
              strokeWidth={2} 
              dot={{ r: 3, fill: isHeatingUp ? "#F97316" : "var(--accent-highlight)" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-[var(--text-muted)] mt-1">
        Based on {clusterSignals.length} signals in this cluster over {data[0].date} - {data[data.length-1].date}.
      </p>
    </div>
  );
}
