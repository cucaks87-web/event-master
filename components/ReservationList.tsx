'use client';

import { AppUser, Hall, Reservation } from '@/lib/types';
import { currency, statusClasses, statusLabel, cn } from '@/lib/utils';
import { canSeeFinancials } from '@/lib/permissions';

export function ReservationList({
  title,
  currentUser,
  reservations,
  halls,
  onEdit
}: {
  title: string;
  currentUser: AppUser;
  reservations: Reservation[];
  halls: Hall[];
  onEdit: (reservation: Reservation) => void;
}) {
  return (
    <div className="card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-sm text-slate-500">Ukupno: {reservations.length}</span>
      </div>

      <div className="space-y-3">
        {reservations.length === 0 && <p className="text-sm text-slate-500">Nema događaja za izabrani dan.</p>}
        {reservations.map((reservation) => {
          const hallName = halls.find((hall) => hall.id === reservation.hallId)?.name ?? reservation.hallId;
          const remaining = Math.max(reservation.totalPrice - reservation.amountPaid, 0);
          return (
            <button key={reservation.id} onClick={() => onEdit(reservation)} className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{reservation.eventType}</p>
                <span className={cn('badge', statusClasses[reservation.status])}>{statusLabel[reservation.status]}</span>
                <span className="badge bg-slate-100 text-slate-700">{hallName}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{reservation.startTime}–{reservation.endTime} • {reservation.customerName || 'Bez klijenta'}</p>
              {canSeeFinancials(currentUser) && (
                <p className="mt-2 text-sm text-slate-600">Depozit: {currency(reservation.depositAmount)} • Plaćeno: {currency(reservation.amountPaid)} • Ostatak: {currency(remaining)}</p>
              )}
              <p className="mt-2 text-sm text-slate-500">Napomena: {reservation.note || '—'}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
