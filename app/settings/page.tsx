'use client';

import { Header } from '@/components/Header';
import { UserManagementPanel } from '@/components/UserManagementPanel';
import { SystemSettingsPanel } from '@/components/SystemSettingsPanel';
import { useAppStore } from '@/lib/store';
import { RouteGuard } from '@/components/RouteGuard';

export default function SettingsPage() {
  const { ready, loading, error, state, currentUser, saveUser, deleteUser, updateSystemSettings, resetDemo } = useAppStore();

  if (!ready) return <main className="p-6">Učitavanje...</main>;

  return (
    <RouteGuard allow={['super_admin']}>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
        <Header currentUser={currentUser} onReset={resetDemo} />
        <div className="card p-4 text-sm text-slate-600">
          {loading ? 'Čuvanje promena…' : 'Upravljanje korisnicima, pravima i sistemskim pravilima.'}
          {error && <span className="ml-3 text-red-700">{error}</span>}
        </div>
        <SystemSettingsPanel settings={state.systemSettings} onSave={updateSystemSettings} />
        <UserManagementPanel users={state.users} onSave={saveUser} onDelete={deleteUser} />
      </main>
    </RouteGuard>
  );
}
