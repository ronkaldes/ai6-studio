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
      router.push('/');
    } else {
      setError('Wrong password');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 p-8 rounded-xl bg-white border border-[#E5E5E5] shadow-sm"
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight" style={{ fontFamily: 'var(--font-sans)' }}>
            ai6 Labs Studio
          </h1>
          <p className="text-[14px] text-[#666666]">Enter team password to continue</p>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors bg-[#FAFAFA] border border-[#E5E5E5] text-[#0A0A0A] placeholder:text-[#999999] focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A]"
          style={{ fontFamily: 'var(--font-mono)' }}
        />

        {error && (
          <p className="text-sm text-center text-[#EF4444]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full py-3 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40 bg-[#0A0A0A] text-white hover:bg-[#1C1C1C] cursor-pointer"
        >
          {loading ? 'Entering...' : 'Enter Studio'}
        </button>
      </form>
    </div>
  );
}
