'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Idea, TrendSignal } from '@/types'

type ScanState = 'idle' | 'loading' | 'error'

interface WorkspaceData {
  signals: TrendSignal[]
  ideas: Idea[]
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [scanMessage, setScanMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [sigRes, ideaRes] = await Promise.all([
        fetch('/api/signals'),
        fetch('/api/ideas'),
      ])
      if (!sigRes.ok || !ideaRes.ok) throw new Error('Failed to fetch data')
      const sigData = await sigRes.json()
      const ideaData = await ideaRes.json()
      setSignals(sigData.signals || [])
      setIdeas(ideaData.ideas || [])
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
      const res = await fetch('/api/scan', { method: 'POST' })
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
  }, [fetchData])

  useEffect(() => {
    setLoading(true)
    fetchData().finally(() => setLoading(false))
  }, [fetchData])

  return (
    <WorkspaceDataContext.Provider value={{
      signals, ideas, loading, error, scanState, scanMessage, refresh, triggerScan,
    }}>
      {children}
    </WorkspaceDataContext.Provider>
  )
}
