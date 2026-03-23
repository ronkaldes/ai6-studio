import { ValidationStepper } from '@/components/validate/ValidationStepper';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ValidatePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const idea = await db.idea.findUnique({ where: { id: params.id }, include: { signals: true } });
  
  if (!idea) return notFound();

  return (
    <div className="w-full max-w-[1200px] mx-auto pt-2 h-full flex flex-col">
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Validation Sprint</h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl">Deep AI-powered validation sequence for <span className="text-foreground font-semibold px-2 py-0.5 bg-muted/50 rounded inline-block border border-border/50">{idea.title}</span>.</p>
      </div>
      
      <div className="flex-1 min-h-0 bg-transparent flex flex-col">
        {/* Pass complex object cleanly without null relation issues */}
        <ValidationStepper initialIdea={JSON.parse(JSON.stringify(idea))} />
      </div>
    </div>
  );
}
