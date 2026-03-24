'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { FunnelStage } from '@/types'

const COLORS = ['#6B7280', '#3B82F6', '#8B5CF6', '#F59E0B', '#22C55E', '#10B981']

export function FunnelChart({ data }: { data: FunnelStage[] }) {
  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
          <XAxis type="number" tick={{ fontSize: 11, fill: '#999' }} />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#666' }} width={80} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ebebeb', borderRadius: 6, fontSize: 12 }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
