'use client'

import { useState, useEffect } from 'react'
import { FunnelChart } from '@/components/analytics/FunnelChart'
import { StageTimeChart } from '@/components/analytics/StageTimeChart'
import { ScoreDistribution } from '@/components/analytics/ScoreDistribution'
import type { StudioAnalytics } from '@/types'

export default function AnalyticsPage() {
  const [data, setData] = useState<StudioAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div className="max-w-[1200px] mx-auto p-6">
        <h1 className="text-[20px] font-semibold mb-6">Studio Analytics</h1>
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[200px] skeleton rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight">Studio Analytics</h1>
        <p className="text-[12px] text-[var(--text-muted)] mt-1">Pipeline health, scoring accuracy, and decision metrics.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Signal → Pipeline" value={`${data.conversionRate.rate}%`} sub={`${data.conversionRate.promoted} of ${data.conversionRate.total_signals} signals`} />
        <KPICard label="Sprint Success" value={`${data.sprintSuccessRate.rate}%`} sub={`${data.sprintSuccessRate.graduated} graduated of ${data.sprintSuccessRate.total_go} Go decisions`} />
        <KPICard label="Active Ideas" value={`${data.funnel.reduce((s, f) => s + f.count, 0)}`} sub="Across all stages" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Pipeline Funnel">
          <FunnelChart data={data.funnel} />
        </ChartCard>
        <ChartCard title="Avg Days Per Stage">
          <StageTimeChart data={data.avgDaysPerStage} />
        </ChartCard>
        <ChartCard title="Venture Score Distribution">
          <ScoreDistribution data={data.ventureScoreDistribution} />
        </ChartCard>
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
