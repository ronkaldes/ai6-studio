import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeIdea } from '@/lib/serialize-idea';
import { checkStageGate } from '@/lib/stage-gates';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await req.json();

  if (data.stage) {
    const existingIdea = await db.idea.findUnique({ where: { id: params.id } });
    const context = await db.projectContext.findFirst({ orderBy: { createdAt: 'desc' } });
    
    if (existingIdea && existingIdea.stage !== data.stage) {
      // Parse JSON fields if necessary for check (e.g. experiments, opportunityMemo)
      const parseField = (field: any) => {
        if (typeof field === 'string' && field.startsWith('{') || field.startsWith('[')) {
          try { return JSON.parse(field); } catch (e) { return field; }
        }
        return field;
      };
      
      const parsedIdea = {
        ...existingIdea,
        opportunityMemo: parseField(existingIdea.opportunityMemo),
        experiments: parseField(existingIdea.experiments)
      };

      const gateResult = checkStageGate(parsedIdea, existingIdea.stage, data.stage, (context as any)?.stageGates);
      
      if (!gateResult.allowed) {
        return NextResponse.json({ blocked: true, reason: gateResult.reason }, { status: 400 });
      }
    }
  }

  const idea = await db.idea.update({
    where: { id: params.id },
    data: {
      ...(data.stage && { stage: data.stage, daysInStage: 0 }),
      ...(data.dvfScores && { dvfScores: JSON.stringify(data.dvfScores) }),
    }
  });

  return NextResponse.json({ idea: serializeIdea(idea) });
}
