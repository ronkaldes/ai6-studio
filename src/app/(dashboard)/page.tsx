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
import { IntegrationsPanel } from '@/components/settings/IntegrationsPanel'
import { SkeletonLoader } from '@/components/workspace/SkeletonLoader'
import { AnalyticsDashboard } from '@/components/workspace/AnalyticsDashboard'
import { DuplicateCheckDialog } from '@/components/workspace/DuplicateCheckDialog'
import { useWorkspaceData } from '@/components/workspace/WorkspaceDataProvider'
import type { TabId } from '@/components/workspace/TabBar'
import type { Idea, TrendSignal, SimilarityMatch } from '@/types'

export default function WorkspacePage() {
  const { open: cmdOpen, setOpen: setCmdOpen, close: closeCmdPalette } = useCommandPalette()
  const { signals, ideas, campaigns, activeCampaignId, setActiveCampaignId, loading, scanState, scanMessage, refresh, triggerScan } = useWorkspaceData()

  // Navigation state
  const [activeView, setActiveView] = useState<ViewType>('inbox')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<'signal' | 'idea' | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [showSettings, setShowSettings] = useState(false)

  // Duplicate detection state
  const [dupCheckSignalId, setDupCheckSignalId] = useState<string | null>(null)
  const [dupMatches, setDupMatches] = useState<SimilarityMatch[]>([])
  const [dupSignalTitle, setDupSignalTitle] = useState('')
  const [dupChecking, setDupChecking] = useState(false)

  // Data state
  const [selectedItem, setSelectedItem] = useState<Idea | TrendSignal | null>(null)
  const [loadingItem, setLoadingItem] = useState(false)

  // Fetch selected item detail
  const fetchSelectedItem = useCallback(async () => {
    if (!selectedId || !selectedType) {
      setSelectedItem(null)
      return
    }
    setLoadingItem(true)
    try {
      if (selectedType === 'signal') {
        const sig = signals.find(s => s.id === selectedId)
        setSelectedItem(sig || null)
      } else {
        const idea = ideas.find(i => i.id === selectedId)
        setSelectedItem(idea || null)
      }
    } finally {
      setLoadingItem(false)
    }
  }, [selectedId, selectedType, signals, ideas])

  useEffect(() => { fetchSelectedItem() }, [fetchSelectedItem])

  // When switching views
  const handleViewChange = (view: ViewType) => {
    setActiveView(view)
    setShowSettings(false)
    if (view === 'analytics') {
      setSelectedId(null)
      setSelectedItem(null)
    }
  }

  const handleSelectItem = (id: string, type: 'signal' | 'idea') => {
    setSelectedId(id)
    setSelectedType(type)
    setShowSettings(false)
    // Auto-select appropriate tab
    if (type === 'idea') {
      const idea = ideas.find(i => i.id === id)
      if (idea?.stage === 'decision_gate') {
        setActiveTab('board-brief')
      } else {
        setActiveTab('overview')
      }
    }
  }

  const refreshData = () => {
    refresh()
  }

  // Actions
  const doPromote = async (signalId: string) => {
    try {
      await fetch('/api/signals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: signalId, pipeline_status: 'promoted' }),
      })
      await refresh()
      setActiveView('pipeline')
    } catch (e) {
      console.error('Promote failed:', e)
    }
  }

  const handlePromote = async (signalId: string) => {
    const sig = signals.find(s => s.id === signalId)
    if (!sig) return

    setDupChecking(true)
    setDupSignalTitle(sig.title)
    try {
      const res = await fetch('/api/signals/check-similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: sig.title, summary: sig.aiSummary || '' }),
      })
      const data = await res.json()
      if (data.similar && data.matches?.length > 0) {
        setDupCheckSignalId(signalId)
        setDupMatches(data.matches)
      } else {
        await doPromote(signalId)
      }
    } catch {
      // On error, proceed with promotion (don't block)
      await doPromote(signalId)
    } finally {
      setDupChecking(false)
    }
  }

  const handleArchive = async (signalId: string) => {
    try {
      await fetch('/api/signals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: signalId, pipeline_status: 'archived' }),
      })
      await refresh()
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
      await refresh()
      setActiveView('board')
      setActiveTab('board-brief')
    } catch (e) {
      console.error('Submit to board failed:', e)
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
          {dupChecking && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-dim)]">
              <div className="w-2 h-2 rounded-full bg-[var(--accent-highlight)] animate-pulse" />
              <span className="text-[11px] text-[var(--text-secondary)]">Checking for similar ideas...</span>
            </div>
          )}
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
      ? signals.find(s => s.id === idea.sourceSignalId) || null
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
            onSettingsClick={() => setShowSettings(prev => !prev)}
            signals={signals}
            ideas={ideas}
            campaigns={campaigns}
            activeCampaignId={activeCampaignId}
            setActiveCampaignId={setActiveCampaignId}
            loading={loading}
            scanState={scanState}
            scanMessage={scanMessage}
            onRetryScan={triggerScan}
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
                <IntegrationsPanel />
              </div>
            </div>
          ) : activeView === 'analytics' ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-5">
                <AnalyticsDashboard />
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
        ideas={ideas}
        signals={signals}
        onSelectItem={handleSelectItem}
        onViewChange={handleViewChange}
        onTriggerScan={triggerScan}
        scanning={scanState !== 'idle'}
      />
      {dupCheckSignalId && dupMatches.length > 0 && (
        <DuplicateCheckDialog
          matches={dupMatches}
          signalTitle={dupSignalTitle}
          onPromoteAnyway={async () => {
            const id = dupCheckSignalId
            setDupCheckSignalId(null)
            setDupMatches([])
            await doPromote(id)
          }}
          onViewExisting={(ideaId) => {
            setDupCheckSignalId(null)
            setDupMatches([])
            handleSelectItem(ideaId, 'idea')
            setActiveView('pipeline')
          }}
          onCancel={() => {
            setDupCheckSignalId(null)
            setDupMatches([])
          }}
        />
      )}
    </>
  )
}
