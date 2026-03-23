'use client'

import { useState, createContext, useContext, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface WorkspaceContextType {
  leftCollapsed: boolean
  rightCollapsed: boolean
  toggleLeft: () => void
  toggleRight: () => void
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  leftCollapsed: false,
  rightCollapsed: false,
  toggleLeft: () => {},
  toggleRight: () => {},
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
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)

  const toggleLeft = () => setLeftCollapsed(prev => !prev)
  const toggleRight = () => setRightCollapsed(prev => !prev)

  return (
    <WorkspaceContext.Provider value={{ leftCollapsed, rightCollapsed, toggleLeft, toggleRight }}>
      <div className="flex h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
        {/* Left Panel — Navigator */}
        <div
          className={cn(
            'flex-shrink-0 border-r panel-border overflow-hidden transition-[width] duration-150 ease-out',
            leftCollapsed ? 'w-12' : 'w-60'
          )}
        >
          {left}
        </div>

        {/* Center Panel — Detail */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {center}
        </div>

        {/* Right Panel — Context */}
        <div
          className={cn(
            'flex-shrink-0 border-l panel-border overflow-hidden transition-[width] duration-150 ease-out',
            rightCollapsed ? 'w-0' : 'w-80'
          )}
        >
          {right}
        </div>
      </div>
    </WorkspaceContext.Provider>
  )
}
