import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = (await req.json()) as { password: string };
  const studioPassword = process.env.STUDIO_PASSWORD;

  if (!studioPassword || password !== studioPassword) {
    console.error('[auth/login] STUDIO_PASSWORD defined:', !!studioPassword);
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('studio_token', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}
