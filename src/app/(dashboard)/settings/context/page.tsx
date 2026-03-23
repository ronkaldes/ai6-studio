import { ContextEditor } from '@/components/settings/ContextEditor';

export const dynamic = 'force-dynamic';

export default function ContextPage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto pt-2 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Studio Configuration</h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl">Manage core operational settings, integrations, and global AI behavior constraints.</p>
      </div>
      
      <ContextEditor />
    </div>
  );
}
