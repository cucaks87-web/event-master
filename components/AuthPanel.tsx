'use client';

import { useState } from 'react';
import { sendMagicLink, signInWithPassword } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/env';

export function AuthPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handlePasswordLogin() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await signInWithPassword(email, password);
      setMessage('Uspešna prijava. Otvori dashboard.');
    } catch (err: any) {
      setError(err?.message ?? 'Prijava nije uspela.');
    } finally {
      setBusy(false);
    }
  }

  async function handleMagicLink() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await sendMagicLink(email);
      setMessage('Magic link je poslat na email adresu.');
    } catch (err: any) {
      setError(err?.message ?? 'Slanje magic linka nije uspelo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Supabase Auth</p>
      <h2 className="mt-2 text-2xl font-bold">Prava prijava</h2>
      <p className="mt-3 text-sm text-slate-600">
        {isSupabaseConfigured()
          ? 'Ovde je pripremljen email/password i magic-link login. Posle prijave sistem pokušava da poveže nalog sa profilom po email adresi.'
          : 'Unesi Supabase podatke u .env.local da bi ovaj panel radio.'}
      </p>

      <div className="mt-5 grid gap-3">
        <input
          className="rounded-xl border border-slate-300 px-4 py-3"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!isSupabaseConfigured() || busy}
        />
        <input
          className="rounded-xl border border-slate-300 px-4 py-3"
          placeholder="Lozinka"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!isSupabaseConfigured() || busy}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={handlePasswordLogin} disabled={!isSupabaseConfigured() || busy || !email || !password} className="rounded-xl bg-blue-700 px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">
          Prijava lozinkom
        </button>
        <button onClick={handleMagicLink} disabled={!isSupabaseConfigured() || busy || !email} className="rounded-xl bg-slate-100 px-5 py-3 font-medium text-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
          Pošalji magic link
        </button>
      </div>

      {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
