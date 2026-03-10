'use client';

import { useRouter } from 'next/navigation';
import { AppUser } from '@/lib/types';

export function LoginSelector({ users, currentUserId, onChange }: { users: AppUser[]; currentUserId: string; onChange: (id: string) => void | Promise<void> }) {
  const router = useRouter();

  return (
    <div className="card max-w-xl p-6">
      <h2 className="text-xl font-semibold">Izaberi korisnika</h2>
      <p className="mt-2 text-sm text-slate-600">Ovaj ekran simulira login. U v2.4 su zaključane stranice po ulozi, pa korisnik vidi samo ono što mu pripada.</p>
      <select
        className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3"
        value={currentUserId}
        onChange={(e) => onChange(e.target.value)}
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>{user.fullName} — {user.role}</option>
        ))}
      </select>
      <button
        onClick={() => router.push('/dashboard')}
        className="mt-4 rounded-xl bg-blue-700 px-5 py-3 font-medium text-white"
      >
        Uđi u aplikaciju
      </button>
    </div>
  );
}
