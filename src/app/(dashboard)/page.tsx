'use client'

import { useState, useEffect, useCallback } from 'react'
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout'
import { Navigator, type ViewType } from '@/components/workspace/Navigator'
import { DetailView } from '@/components/workspace/DetailView'
import { ContextPanel } from '@/components/workspace/ContextPanel'
import { CommandPalette, useCommandPalette } from '@/components/workspace/CommandPalette'
import { OverviewTab } from '@/components/workspace/tabs/OverviewTab'
import { ScoringTab } from '@/components/workspace/tabs/ScoringTab'
import { AssumptionsTab } from '@/components/workspace/tabs/AssumptionsTab'
import { ExperimentsTab } from '@/components/workspace/tabs/ExperimentsTab'
import { BoardBriefTab } from '@/components/workspace/tabs/BoardBriefTab'
import { ContextEditor } from '@/components/settings/ContextEditor'
import { SkeletonLoader } from '@/components/workspace/SkeletonLoader'
import type { TabId } from '@/components/workspace/TabBar'
import type { Idea, TrendSignal } from '@/types'

export default function WorkspacePage() {
  const { open: cmdOpen, setOpen: setCmdOpen, close: closeCmdPalette } = useCommandPalette()

  // Navigation state
  const [activeView, setActiveView] = useState<ViewType>('inbox')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<'signal' | 'idea' | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [showSettings, setShowSettings] = useState(false)

  // Data state
  const [selectedItem, setSelectedItem] = useState<Idea | TrendSignal | null>(null)
  const [allSignals, setAllSignals] = useState<TrendSignal[]>([])
  const [allIdeas, setAllIdeas] = useState<Idea[]>([])
  const [loadingItem, setLoadingItem] = useState(false)

  // Fetch all data for command palette and navigator
  const fetchAllData = useCallback(async () => {
    try {
      const [sigRes, ideaRes] = await Promise.all([
        fetch('/api/signals'),
        fetch('/api/ideas'),
      ])
      const sigData = await sigRes.json()
      const ideaData = await ideaRes.json()
      setAllSignals(sigData.signals || [])
      setAllIdeas(ideaData.ideas || [])
    } catch (e) {
      console.error('Failed to fetch data:', e)
    }
  }, [])

  useEffect(() => { fetchAllData() }, [fetchAllData])

  // Fetch selected item detail
  const fetchSelectedItem = useCallback(async () => {
    if (!selectedId || !selectedType) {
      setSelectedItem(null)
      return
    }
    setLoadingItem(true)
    try {
      if (selectedType === 'signal') {
        const sig = allSignals.find(s => s.id === selectedId)
        setSelectedItem(sig || null)
      } else {
        const idea = allIdeas.find(i => i.id === selectedId)
        setSelectedItem(idea || null)
      }
    } finally {
      setLoadingItem(false)
    }
  }, [selectedId, selectedType, allSignals, allIdeas])

  useEffect(() => { fetchSelectedItem() }, [fetchSelectedItem])

  // When switching to board view, auto-select board-brief tab
  const handleViewChange = (view: ViewType) => {
    setActiveView(view)
    setShowSettings(false)
  }

  const handleSelectItem = (id: string, type: 'signal' | 'idea') => {
    setSelectedId(id)
    setSelectedType(type)
    setShowSettings(false)
    // Auto-select appropriate tab
    if (type === 'idea') {
      const idea = allIdeas.find(i => i.id === id)
      if (idea?.stage === 'decision_gate') {
        setActiveTab('board-brief')
      } else {
        setActiveTab('overview')
      }
    }
  }

  const refreshData = () => {
    fetchAllData()
  }

  // Actions
  const handlePromote = async (signalId: string) => {
    try {
      await fetch('/api/signals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: signalId, pipeline_status: 'promoted' }),
      })
      await fetchAllData()
      // Switch to pipeline view to see the new idea
      setActiveView('pipeline')
    } catch (e) {
      console.error('Promote failed:', e)
    }
  }

  const handleArchive = async (signalId: string) => {
    try {
      await fetch('/api/signals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: signalId, pipeline_status: 'archived' }),
      })
      await fetchAllData()
      setSelectedId(null)
      setSelectedItem(null)
    } catch (e) {
      console.error('Archive failed:', e)
    }
  }

  const handleSubmitToBoard = async (ideaId: string) => {
    try {
      await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: ideaId, step: 6, data: { submitted_by: 'Ron' } }),
      })
      await fetchAllData()
      setActiveView('board')
      setActiveTab('board-brief')
    } catch (e) {
      console.error('Submit to board failed:', e)
    }
  }

  const handleTriggerScan = async () => {
    try {
      await fetch('/api/scan', { method: 'POST' })
      await fetchAllData()
      setActiveView('inbox')
    } catch (e) {
      console.error('Scan failed:', e)
    }
  }

  // Render tab content
  const renderTabContent = () => {
    if (loadingItem) return <SkeletonLoader lines={6} />
    if (showSettings) return <ContextEditor />
    if (!selectedItem) return null

    // Signal detail (no tabs)
    if (selectedType === 'signal') {
      const sig = selectedItem as TrendSignal
      return (
        <div className="space-y-4 max-w-2xl">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">AI Summary</div>
          <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">{sig.aiSummary}</p>
          {sig.opportunityCard && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-md p-4 text-[12px] space-y-2">
              {sig.opportunityCard.problem && <div><strong>Problem:</strong> {sig.opportunityCard.problem}</div>}
              {sig.opportunityCard.why_now && <div><strong>Why Now:</strong> {sig.opportunityCard.why_now}</div>}
              {sig.opportunityCard.studio_angle && <div><strong>Studio Angle:</strong> {sig.opportunityCard.studio_angle}</div>}
              {sig.opportunityCard.sprint_hypothesis && <div><strong>Sprint Hypothesis:</strong> {sig.opportunityCard.sprint_hypothesis}</div>}
              {sig.opportunityCard.kill_risks && (
                <div><strong className="text-[var(--score-kill)]">Kill Risks:</strong> {sig.opportunityCard.kill_risks.join(', ')}</div>
              )}
            </div>
          )}
        </div>
      )
    }

    // Idea tabs
    const idea = selectedItem as Idea
    const sourceSignal = idea.sourceSignalId
      ? allSignals.find(s => s.id === idea.sourceSignalId) || null
      : null

    switch (activeTab) {
      case 'overview':
        return <OverviewTab idea={idea} sourceSignal={sourceSignal} onRefreshIdea={refreshData} />
      case 'scoring':
        return <ScoringTab idea={idea} onRefreshIdea={refreshData} />
      case 'assumptions':
        return <AssumptionsTab idea={idea} onRefreshIdea={refreshData} />
      case 'experiments':
        return <ExperimentsTab idea={idea} onRefreshIdea={refreshData} />
      case 'board-brief':
        return <BoardBriefTab idea={idea} />
      default:
        return null
    }
  }

  return (
    <>
      <WorkspaceLayout
        left={
          <Navigator
            activeView={activeView}
            onViewChange={handleViewChange}
            selectedId={selectedId}
            onSelectItem={handleSelectItem}
          />
        }
        center={
          showSettings ? (
            <div className="flex flex-col h-full">
              <div className="px-5 py-3 border-b panel-border">
                <h1 className="text-[15px] font-semibold tracking-tight">Settings</h1>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <ContextEditor />
              </div>
            </div>
          ) : (
            <DetailView
              item={selectedItem}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onPromote={selectedType === 'signal' ? handlePromote : undefined}
              onArchive={selectedType === 'signal' ? handleArchive : undefined}
              onSubmitToBoard={handleSubmitToBoard}
            >
              {renderTabContent()}
            </DetailView>
          )
        }
        right={
          <ContextPanel
            item={selectedItem}
            activeTab={activeTab}
            onRefreshData={refreshData}
          />
        }
      />
      <CommandPalette
        open={cmdOpen}
        onClose={closeCmdPalette}
        ideas={allIdeas}
        signals={allSignals}
        onSelectItem={handleSelectItem}
        onViewChange={handleViewChange}
        onTriggerScan={handleTriggerScan}
      />
    </>
  )
}
