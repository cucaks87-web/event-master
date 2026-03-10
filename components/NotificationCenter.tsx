'use client';

import { ActivityLog, AppUser } from '@/lib/types';

function visibleForUser(log: ActivityLog, role: AppUser['role']) {
  if (role === 'super_admin') return true;
  if (role === 'admin') return log.entityType !== 'user';
  return log.entityType === 'reservation';
}

export function NotificationCenter({ logs, currentUser }: { logs: ActivityLog[]; currentUser: AppUser }) {
  const visible = logs.filter((log) => visibleForUser(log, currentUser.role)).slice(0, 6);

  return (
    <section className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Obaveštenja</p>
          <h3 className="text-lg font-semibold">Skorašnje promene</h3>
        </div>
        <span className="badge bg-slate-100 text-slate-700">{currentUser.role}</span>
      </div>

      <div className="space-y-3">
        {visible.length === 0 && <p className="text-sm text-slate-500">Još nema promena.</p>}
        {visible.map((log) => (
          <div key={log.id} className="rounded-2xl border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">{log.actorName}</p>
                <p className="text-sm text-slate-600">{log.payload}</p>
              </div>
              <span className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString('sr-RS')}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
