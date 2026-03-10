'use client';

import { Hall, Reservation } from '@/lib/types';
import { cn, monthLabel, statusClasses } from '@/lib/utils';

function startOfMonthGrid(currentMonth: Date) {
  const first = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startDay = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - startDay);
  return start;
}

function hallSummary(reservations: Reservation[]) {
  if (reservations.length === 0) return { label: 'Slobodno', className: 'bg-emerald-50 text-emerald-700' };
  if (reservations.some((item) => item.status === 'ceka_potvrdu' || item.status === 'upit')) {
    return { label: 'Na čekanju', className: 'bg-amber-100 text-amber-800' };
  }
  if (reservations.some((item) => item.status === 'potvrdjeno_depozitom' || item.status === 'u_potpunosti_placeno' || item.status === 'realizovano')) {
    return { label: reservations.length > 1 ? `${reservations.length} termina` : 'Potvrđeno', className: 'bg-blue-100 text-blue-700' };
  }
  return { label: reservations.length > 1 ? `${reservations.length} termina` : 'Rezervisano', className: 'bg-red-100 text-red-700' };
}

export function CalendarMonth({
  month,
  reservations,
  halls,
  selectedHallId,
  selectedDate,
  onPrev,
  onNext,
  onSelectDate,
  onChangeMonth,
  onGoToDate
}: {
  month: Date;
  reservations: Reservation[];
  halls: Hall[];
  selectedHallId: string;
  selectedDate: string;
  onPrev: () => void;
  onNext: () => void;
  onSelectDate: (date: string) => void;
  onChangeMonth: (year: number, monthIndex: number) => void;
  onGoToDate: (date: string) => void;
}) {
  const days = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
  const start = startOfMonthGrid(month);
  const visible = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
  const visibleHalls = selectedHallId === 'all' ? halls : halls.filter((hall) => hall.id === selectedHallId);
  const yearOptions = Array.from({ length: 8 }, (_, index) => new Date().getFullYear() - 1 + index);

  function reservationsForDate(date: Date) {
    const iso = date.toISOString().slice(0, 10);
    return reservations.filter((reservation) => {
      const hallOk = selectedHallId === 'all' || reservation.hallId === selectedHallId;
      return reservation.eventDate === iso && hallOk;
    });
  }

  return (
    <div className="card p-4">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onPrev} className="rounded-xl bg-slate-100 px-4 py-2">←</button>
          <h2 className="min-w-[140px] text-xl font-semibold capitalize">{monthLabel(month)}</h2>
          <button onClick={onNext} className="rounded-xl bg-slate-100 px-4 py-2">→</button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
          <select
            className="rounded-xl border border-slate-300 px-4 py-2"
            value={month.getMonth()}
            onChange={(e) => onChangeMonth(month.getFullYear(), Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index} value={index}>
                {new Intl.DateTimeFormat('sr-RS', { month: 'long' }).format(new Date(2026, index, 1))}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-300 px-4 py-2"
            value={month.getFullYear()}
            onChange={(e) => onChangeMonth(Number(e.target.value), month.getMonth())}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <input
            type="date"
            className="rounded-xl border border-slate-300 px-4 py-2"
            value={selectedDate}
            onChange={(e) => onGoToDate(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
        {days.map((day) => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {visible.map((date) => {
          const iso = date.toISOString().slice(0, 10);
          const items = reservationsForDate(date);
          const isCurrentMonth = date.getMonth() === month.getMonth();
          const isSelected = selectedDate === iso;

          return (
            <button
              key={iso}
              onClick={() => onSelectDate(iso)}
              className={cn(
                'min-h-28 rounded-2xl border p-2 text-left transition',
                isCurrentMonth ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 text-slate-400',
                isSelected && 'ring-2 ring-blue-600'
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold">{date.getDate()}</div>
                {items.length > 0 && <div className="text-[10px] font-medium text-slate-500">{items.length}</div>}
              </div>

              <div className="space-y-1">
                {visibleHalls.map((hall) => {
                  const hallReservations = items.filter((reservation) => reservation.hallId === hall.id);
                  const summary = hallSummary(hallReservations);
                  return (
                    <div key={hall.id} className={cn('rounded-xl px-2 py-1 text-[11px] font-medium', summary.className)}>
                      <span className="mr-1 font-semibold">{hall.name}</span>
                      <span>{summary.label}</span>
                    </div>
                  );
                })}

                {selectedHallId !== 'all' && items.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {items.slice(0, 2).map((reservation) => (
                      <div key={reservation.id} className={cn('truncate rounded-xl px-2 py-1 text-[11px] font-medium', statusClasses[reservation.status])}>
                        {reservation.startTime} {reservation.eventType}
                      </div>
                    ))}
                    {items.length > 2 && <div className="text-[11px] text-slate-500">+ još {items.length - 2}</div>}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
