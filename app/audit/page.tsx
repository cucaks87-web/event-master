'use client';

import { AuditLogPanel } from '@/components/AuditLogPanel';
import { Header } from '@/components/Header';
import { useAppStore } from '@/lib/store';
import { RouteGuard } from '@/components/RouteGuard';

export default function AuditPage() {
  const { ready, error, state, currentUser, resetDemo } = useAppStore();

  if (!ready) return <main className="p-6">Učitavanje...</main>;

  return (
    <RouteGuard allow={['super_admin']}>
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
      <Header currentUser={currentUser} onReset={resetDemo} />
      {error && <div className="card p-4 text-sm text-red-700">{error}</div>}
      <AuditLogPanel logs={state.activityLogs} />
    </main>
    </RouteGuard>
  );
}
