'use client';

import Link from 'next/link';
import { AppUser } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/env';
import { signOutSupabase } from '@/lib/auth';
import { canManageUsers, canViewAudit } from '@/lib/permissions';

export function Header({ currentUser, onReset }: { currentUser: AppUser; onReset: () => void }) {
  async function handleSignOut() {
    try {
      await signOutSupabase();
      window.location.href = '/login';
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <header className="card flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Rezervacije sala</p>
        <h1 className="text-2xl font-bold">Dobrodošao, {currentUser.fullName}</h1>
        <p className="text-sm text-slate-600">Uloga: {currentUser.role}</p>
      </div>
      <nav className="flex flex-wrap gap-2 text-sm font-medium">
        <Link href="/dashboard" className="rounded-xl bg-slate-100 px-4 py-2">Kalendar</Link>
        {canManageUsers(currentUser.role) && <Link href="/settings" className="rounded-xl bg-slate-100 px-4 py-2">Korisnici i prava</Link>}
        {canViewAudit(currentUser.role) && <Link href="/audit" className="rounded-xl bg-slate-100 px-4 py-2">Audit log</Link>}
        <Link href="/login" className="rounded-xl bg-slate-100 px-4 py-2">Promeni korisnika</Link>
        {isSupabaseConfigured() && <button onClick={handleSignOut} className="rounded-xl bg-slate-100 px-4 py-2">Odjava</button>}
        <button onClick={onReset} className="rounded-xl bg-red-50 px-4 py-2 text-red-700">Reset demo</button>
      </nav>
    </header>
  );
}
