'use client'

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { Menu, PanelRight, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

interface WorkspaceContextType {
  leftCollapsed: boolean
  rightCollapsed: boolean
  toggleLeft: () => void
  toggleRight: () => void
  breakpoint: Breakpoint
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  leftCollapsed: false,
  rightCollapsed: false,
  toggleLeft: () => {},
  toggleRight: () => {},
  breakpoint: 'desktop',
})

export function useWorkspace() {
  return useContext(WorkspaceContext)
}

interface WorkspaceLayoutProps {
  left: ReactNode
  center: ReactNode
  right: ReactNode
}

export function WorkspaceLayout({ left, center, right }: WorkspaceLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(true)
  const [rightCollapsed, setRightCollapsed] = useState(true)
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [mobileRightOpen, setMobileRightOpen] = useState(false)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 768) {
        setBreakpoint('mobile')
        setLeftCollapsed(true)
        setRightCollapsed(true)
      } else if (w < 1024) {
        setBreakpoint('tablet')
        setLeftCollapsed(true)
        setRightCollapsed(true)
      } else {
        setBreakpoint('desktop')
        setLeftCollapsed(false)
        setRightCollapsed(false)
      }
      setMobileNavOpen(false)
      setMobileRightOpen(false)
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const toggleLeft = () => {
    if (breakpoint === 'mobile') {
      setMobileNavOpen(prev => !prev)
    } else {
      setLeftCollapsed(prev => !prev)
    }
  }

  const toggleRight = () => {
    if (breakpoint === 'mobile') {
      setMobileRightOpen(prev => !prev)
    } else {
      setRightCollapsed(prev => !prev)
    }
  }

  return (
    <WorkspaceContext.Provider value={{ leftCollapsed, rightCollapsed, toggleLeft, toggleRight, breakpoint }}>
      <div className="flex h-[100dvh] bg-[var(--bg-base)] text-[var(--text-primary)] relative">

        {/* Mobile overlay right panel */}
        {breakpoint === 'mobile' && mobileRightOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setMobileRightOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 w-80 z-50 bg-[var(--bg-surface)] border-l border-[var(--border-dim)] shadow-lg overflow-y-auto">
              {right}
            </div>
          </>
        )}

        {/* Mobile overlay nav */}
        {breakpoint === 'mobile' && mobileNavOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 z-50 bg-[var(--bg-surface)] border-r border-[var(--border-dim)] shadow-lg">
              {left}
            </div>
          </>
        )}

        {/* Left Panel — hidden on mobile, collapsible on tablet/desktop */}
        {breakpoint !== 'mobile' && (
          <div
            className={cn(
              'flex-shrink-0 border-r border-[var(--border-dim)] overflow-hidden transition-[width] duration-150 ease-out',
              leftCollapsed ? 'w-12' : 'w-60'
            )}
          >
            {left}
          </div>
        )}

        {/* Center Panel */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Mobile top bar */}
          {breakpoint === 'mobile' && (
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border-dim)] bg-[var(--bg-surface)]">
              <button onClick={toggleLeft} className="text-[var(--text-secondary)] cursor-pointer"><Menu size={18} /></button>
              <span className="text-[13px] font-semibold tracking-tight flex-1">ai6 Labs Studio</span>
              <button onClick={toggleRight} className="text-[var(--text-secondary)] cursor-pointer"><PanelRight size={18} /></button>
            </div>
          )}
          {center}
        </div>

        {/* Right Panel — hidden on mobile/tablet unless toggled */}
        {breakpoint === 'desktop' && (
          <div
            className={cn(
              'flex-shrink-0 border-l border-[var(--border-dim)] overflow-hidden transition-[width] duration-150 ease-out',
              rightCollapsed ? 'w-0' : 'w-80'
            )}
          >
            {right}
          </div>
        )}

        {/* Right panel as slide-over on tablet */}
        {breakpoint === 'tablet' && !rightCollapsed && (
          <>
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={toggleRight}
            />
            <div className="fixed inset-y-0 right-0 w-80 z-50 bg-[var(--bg-surface)] border-l border-[var(--border-dim)] shadow-lg">
              {right}
            </div>
          </>
        )}

        {/* Mobile FAB for right panel */}
        {breakpoint === 'mobile' && !mobileRightOpen && !mobileNavOpen && (
          <button
            onClick={() => setMobileRightOpen(true)}
            className="fixed bottom-5 right-5 z-30 w-12 h-12 rounded-full bg-[var(--accent)] text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label="Open context panel"
          >
            <MessageCircle size={20} />
          </button>
        )}
      </div>
    </WorkspaceContext.Provider>
  )
}
