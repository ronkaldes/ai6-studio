'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Idea, TrendSignal, Campaign } from '@/types'

type ScanState = 'idle' | 'loading' | 'error'

interface WorkspaceData {
  signals: TrendSignal[]
  ideas: Idea[]
  campaigns: Campaign[]
  activeCampaignId: string | null
  setActiveCampaignId: (id: string | null) => void
  loading: boolean
  error: string | null
  scanState: ScanState
  scanMessage: string | null
  refresh: () => Promise<void>
  triggerScan: () => Promise<void>
}

const WorkspaceDataContext = createContext<WorkspaceData>({
  signals: [],
  ideas: [],
  campaigns: [],
  activeCampaignId: null,
  setActiveCampaignId: () => {},
  loading: true,
  error: null,
  scanState: 'idle',
  scanMessage: null,
  refresh: async () => {},
  triggerScan: async () => {},
})

export function useWorkspaceData() {
  return useContext(WorkspaceDataContext)
}

const SCAN_MESSAGES = [
  'Searching GitHub Trending...',
  'Scanning Reddit threads...',
  'Checking Product Hunt...',
  'Reviewing arXiv papers...',
  'Browsing Hacker News...',
  'Scoring signals with Claude...',
  'Generating opportunity cards...',
]

export function WorkspaceDataProvider({ children }: { children: ReactNode }) {
  const [signals, setSignals] = useState<TrendSignal[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [scanMessage, setScanMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [sigRes, ideaRes, campRes] = await Promise.all([
        fetch('/api/signals'),
        fetch('/api/ideas'),
        fetch('/api/campaigns'),
      ])
      if (!sigRes.ok || !ideaRes.ok || !campRes.ok) throw new Error('Failed to fetch data')
      const sigData = await sigRes.json()
      const ideaData = await ideaRes.json()
      const campData = await campRes.json()
      
      setSignals(sigData.signals || [])
      setIdeas(ideaData.ideas || [])
      setCampaigns(campData || [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch data')
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  const triggerScan = useCallback(async () => {
    setScanState('loading')
    setScanMessage(SCAN_MESSAGES[0])
    let msgIndex = 0
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % SCAN_MESSAGES.length
      setScanMessage(SCAN_MESSAGES[msgIndex])
    }, 5000)

    try {
      const url = activeCampaignId ? `/api/scan?campaignId=${activeCampaignId}` : '/api/scan'
      const res = await fetch(url, { method: 'POST' })
      clearInterval(interval)
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Scan failed')
      }
      const data = await res.json()
      setScanState('idle')
      setScanMessage(`Scan complete: ${data.signals_found ?? 0} signals found`)
      setTimeout(() => setScanMessage(null), 5000)
      await fetchData()
    } catch (e) {
      clearInterval(interval)
      setScanState('error')
      setScanMessage(e instanceof Error ? e.message : 'Scan failed')
    }
  }, [fetchData, activeCampaignId])

  useEffect(() => {
    setLoading(true)
    fetchData().finally(() => setLoading(false))
  }, [fetchData])

  return (
    <WorkspaceDataContext.Provider value={{
      signals, ideas, campaigns, activeCampaignId, setActiveCampaignId, loading, error, scanState, scanMessage, refresh, triggerScan,
    }}>
      {children}
    </WorkspaceDataContext.Provider>
  )
}
