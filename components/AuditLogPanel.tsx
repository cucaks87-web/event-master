'use client';

import { ActivityLog } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

export function AuditLogPanel({ logs }: { logs: ActivityLog[] }) {
  return (
    <div className="card p-4">
      <h2 className="mb-4 text-xl font-semibold">Audit log</h2>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge bg-slate-100 text-slate-700">{log.actionType}</span>
              <span className="badge bg-slate-100 text-slate-700">{log.entityType}</span>
              <p className="font-medium">{log.actorName}</p>
            </div>
            <p className="mt-2 text-sm text-slate-700">{log.payload}</p>
            <p className="mt-2 text-xs text-slate-500">{formatDateTime(log.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
