'use client'

import { useState, useEffect } from 'react'
import { FunnelChart } from '@/components/analytics/FunnelChart'
import { StageTimeChart } from '@/components/analytics/StageTimeChart'
import { ScoreDistribution } from '@/components/analytics/ScoreDistribution'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import type { StudioAnalytics } from '@/types'

const PIE_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#22C55E', '#6366F1', '#EC4899']

export function AnalyticsDashboard() {
  const [data, setData] = useState<StudioAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-6">
        <h1 className="text-[20px] font-semibold tracking-tight">Studio Analytics</h1>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[200px] skeleton rounded-md" />
        ))}
      </div>
    )
  }

  const scanHistoryData = data.scanHistory.map(s => ({
    ...s,
    label: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  const killPieData = Object.entries(data.killRateByCategory).map(([name, value]) => ({ name, value }))

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight">Studio Analytics</h1>
        <p className="text-[12px] text-[var(--text-muted)] mt-1">Pipeline health, scoring accuracy, and decision metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Signal → Pipeline" value={`${data.conversionRate.rate}%`} sub={`${data.conversionRate.promoted} of ${data.conversionRate.total_signals} signals`} />
        <KPICard label="Sprint Success" value={`${data.sprintSuccessRate.rate}%`} sub={`${data.sprintSuccessRate.graduated} graduated of ${data.sprintSuccessRate.total_go} Go decisions`} />
        <KPICard label="Active Ideas" value={`${data.funnel.reduce((s, f) => s + f.count, 0)}`} sub="Across all stages" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Pipeline Funnel">
          <FunnelChart data={data.funnel} />
        </ChartCard>
        <ChartCard title="Avg Days Per Stage">
          <StageTimeChart data={data.avgDaysPerStage} />
        </ChartCard>
        <ChartCard title="Venture Score Distribution">
          <ScoreDistribution data={data.ventureScoreDistribution} />
        </ChartCard>

        {scanHistoryData.length > 0 && (
          <ChartCard title="Scan History">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scanHistoryData} margin={{ left: 0, right: 16 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#999' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#999' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#999' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ebebeb', borderRadius: 6, fontSize: 12 }} />
                  <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3B82F6" name="Signals" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#22C55E" name="Avg Score" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}

        {killPieData.length > 0 && (
          <ChartCard title="Kill Rate by Category">
            <div className="h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={killPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                    {killPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ebebeb', borderRadius: 6, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  )
}

function KPICard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-[var(--border-dim)] rounded-md p-4 bg-[var(--bg-surface)]">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">{label}</div>
      <div className="text-[28px] font-bold mt-1">{value}</div>
      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{sub}</div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--border-dim)] rounded-md p-4 bg-[var(--bg-surface)]">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">{title}</div>
      {children}
    </div>
  )
}
