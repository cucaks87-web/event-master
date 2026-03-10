'use client';

import { LoginSelector } from '@/components/LoginSelector';
import { AuthPanel } from '@/components/AuthPanel';
import { useAppStore } from '@/lib/store';
import { isSupabaseConfigured } from '@/lib/env';

export default function LoginPage() {
  const { ready, state, switchUser } = useAppStore();

  if (!ready) return <main className="p-6">Učitavanje...</main>;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
      <div className="grid w-full gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Prijava / izbor korisnika</p>
          <h1 className="mt-2 text-3xl font-bold">Pokreni aplikaciju</h1>
          <p className="mt-3 text-sm text-slate-600">
            {isSupabaseConfigured()
              ? 'Supabase je podešen. Demo izbor korisnika ostaje uključen dok ne povežeš pravi Auth flow.'
              : 'Aplikacija je trenutno u demo modu. Izaberi korisnika i nastavi na kalendar.'}
          </p>
        </div>
        <div className="grid gap-6">
          <LoginSelector users={state.users} currentUserId={state.currentUserId} onChange={switchUser} />
          <AuthPanel />
        </div>
      </div>
    </main>
  );
}
