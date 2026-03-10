'use client';

import { SystemSettings } from '@/lib/types';

export function SystemSettingsPanel({
  settings,
  onSave
}: {
  settings: SystemSettings;
  onSave: (settings: SystemSettings) => void | Promise<void>;
}) {
  return (
    <div className="card p-4">
      <h2 className="mb-4 text-xl font-semibold">Sistemska podešavanja rezervacija</h2>
      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={settings.allowMultipleEventsPerDay}
            onChange={(e) => onSave({ allowMultipleEventsPerDay: e.target.checked })}
          />
          <span>
            <strong>Dozvoli više događaja u istom danu po sali</strong>
            <br />
            Ako je isključeno, po defaultu je dozvoljen samo jedan događaj po sali po danu. Ako je uključeno, moguća su više događaja istog dana u istoj sali, ali samo u različitim vremenskim terminima.
          </span>
        </label>
      </div>
    </div>
  );
}
