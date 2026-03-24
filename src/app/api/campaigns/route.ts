import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const campaigns = await db.campaign.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { signals: true }
        }
      }
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('[campaigns] GET error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    const campaign = await db.campaign.create({
      data: {
        name: json.name,
        domainFocus: json.domainFocus || null,
        minScore: json.minScore || 6,
        deadline: json.deadline ? new Date(json.deadline) : null,
        status: 'active'
      }
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('[campaigns] POST error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
