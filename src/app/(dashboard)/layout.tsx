import { WorkspaceDataProvider } from '@/components/workspace/WorkspaceDataProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceDataProvider>{children}</WorkspaceDataProvider>
}
