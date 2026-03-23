'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/trends');
    } else {
      setError('Wrong password');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0F1C' }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 p-8 rounded-xl"
        style={{ background: '#111827', border: '1px solid #1F2D45' }}
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold" style={{ color: '#F1F5F9', fontFamily: 'var(--font-sans)' }}>
            ai6 Labs Studio
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '14px' }}>Enter team password to continue</p>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
          style={{
            background: '#1A2235',
            border: '1px solid #2D3F5A',
            color: '#F1F5F9',
            fontFamily: 'var(--font-mono)',
          }}
        />

        {error && (
          <p className="text-sm text-center" style={{ color: '#EF4444' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full py-3 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
          style={{ background: '#3B82F6', color: '#FFFFFF' }}
        >
          {loading ? 'Entering...' : 'Enter Studio'}
        </button>
      </form>
    </div>
  );
}
