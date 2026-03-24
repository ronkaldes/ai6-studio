'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function ScoreDistribution({ data }: { data: { range: string; count: number }[] }) {
  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#999' }} />
          <YAxis tick={{ fontSize: 11, fill: '#999' }} allowDecimals={false} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ebebeb', borderRadius: 6, fontSize: 12 }} />
          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
