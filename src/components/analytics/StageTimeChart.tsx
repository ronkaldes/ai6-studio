'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const LABELS: Record<string, string> = {
  signal: 'Signal', refining: 'Refining', validating: 'Validating',
  decision_gate: 'Decision', active_sprint: 'Sprint', graduated: 'Graduated',
}

export function StageTimeChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([stage, days]) => ({
    stage: LABELS[stage] || stage, days,
  }))

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ left: 20 }}>
          <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#999' }} />
          <YAxis tick={{ fontSize: 11, fill: '#999' }} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ebebeb', borderRadius: 6, fontSize: 12 }} />
          <Bar dataKey="days" fill="#6366F1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
