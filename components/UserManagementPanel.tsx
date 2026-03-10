'use client';

import { useState } from 'react';
import { AppUser, Role } from '@/lib/types';

const roles: Role[] = ['user', 'admin', 'super_admin'];

const blankUser: AppUser = {
  id: '',
  fullName: '',
  role: 'user',
  email: '',
  canCreateSuggestion: true,
  canViewFinancials: false,
  canViewActivityFeed: false
};

export function UserManagementPanel({
  users,
  onSave,
  onDelete
}: {
  users: AppUser[];
  onSave: (user: AppUser) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}) {
  const [form, setForm] = useState<AppUser>(blankUser);

  function normalized(user: AppUser): AppUser {
    if (user.role === 'admin' || user.role === 'super_admin') {
      return { ...user, canCreateSuggestion: true, canViewFinancials: true, canViewActivityFeed: true };
    }
    return user;
  }

  function submit() {
    if (!form.fullName.trim()) return;
    onSave(normalized({ ...form, id: form.id || `u_${Math.random().toString(36).slice(2, 10)}` }));
    setForm(blankUser);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="card p-4">
        <h2 className="mb-4 text-xl font-semibold">Korisnici</h2>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{user.fullName}</p>
                  <p className="text-sm text-slate-600">{user.email} • {user.role}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Predlog: {user.canCreateSuggestion ? 'da' : 'ne'} • Finansije: {user.canViewFinancials ? 'da' : 'ne'} • Izmene panel: {user.canViewActivityFeed ? 'da' : 'ne'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setForm(user)} className="rounded-xl bg-slate-100 px-4 py-2">Izmeni</button>
                  <button onClick={() => onDelete(user.id)} className="rounded-xl bg-red-50 px-4 py-2 text-red-700">Obriši</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-4 text-xl font-semibold">Dodaj / izmeni korisnika</h2>
        <div className="space-y-3">
          <input className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Ime i prezime" value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} />
          <input className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="E-mail" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          <select className="w-full rounded-xl border border-slate-300 px-4 py-3" value={form.role} onChange={(e) => setForm((prev) => normalized({ ...prev, role: e.target.value as Role }))}>
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-medium">Prava prikaza i unosa</p><p className="mt-1 text-xs text-slate-500">Super admin može za svakog običnog korisnika da uključi ili isključi unos predloga, finansije i prikaz izmena.</p>
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.canCreateSuggestion ?? false} onChange={(e) => setForm((prev) => ({ ...prev, canCreateSuggestion: e.target.checked }))} disabled={form.role !== 'user'} />
                Može da doda predlog događaja
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.canViewFinancials ?? false} onChange={(e) => setForm((prev) => ({ ...prev, canViewFinancials: e.target.checked }))} disabled={form.role !== 'user'} />
                Može da vidi depozit, cene i uplate
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.canViewActivityFeed ?? false} onChange={(e) => setForm((prev) => ({ ...prev, canViewActivityFeed: e.target.checked }))} disabled={form.role !== 'user'} />
                Može da vidi spisak izmena / aktivnosti
              </label>
            </div>
            {form.role !== 'user' && <p className="mt-3 text-xs text-slate-500">Za admin i super admin ova prava su automatski uključena.</p>}
          </div>
          <button onClick={submit} className="rounded-xl bg-blue-700 px-5 py-3 font-medium text-white">Sačuvaj korisnika</button>
        </div>
      </div>
    </div>
  );
}
