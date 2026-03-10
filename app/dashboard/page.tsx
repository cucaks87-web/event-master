'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarMonth } from '@/components/CalendarMonth';
import { Header } from '@/components/Header';
import { ReservationForm } from '@/components/ReservationForm';
import { ReservationList } from '@/components/ReservationList';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useAppStore } from '@/lib/store';
import { Reservation } from '@/lib/types';
import { canCreateSuggestion, canEdit, canViewActivityFeed } from '@/lib/permissions';
import { RouteGuard } from '@/components/RouteGuard';
import { isSupabaseConfigured } from '@/lib/env';

function toMonthDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return new Date('2026-03-01');
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default function DashboardPage() {
  const {
    ready,
    loading,
    error,
    state,
    currentUser,
    addReservation,
    updateReservation,
    deleteReservation,
    resetDemo
  } = useAppStore();

  const [month, setMonth] = useState(new Date('2026-03-01'));
  const [selectedDate, setSelectedDate] = useState('2026-03-14');
  const [selectedHallId, setSelectedHallId] = useState('all');
  const [editing, setEditing] = useState<Reservation | null>(null);

  useEffect(() => {
    if (!selectedDate) return;
    setMonth(toMonthDate(selectedDate));
  }, [selectedDate]);

  const selectedReservations = useMemo(
    () =>
      state.reservations.filter((reservation) => {
        const hallOk = selectedHallId === 'all' || reservation.hallId === selectedHallId;
        return reservation.eventDate === selectedDate && hallOk;
      }),
    [state.reservations, selectedDate, selectedHallId]
  );

  async function handleSubmit(reservation: Reservation) {
    if (!currentUser) return;

    if (editing && !canEdit(currentUser)) return;

    if (editing) {
      await updateReservation(reservation);
    } else {
      await addReservation(reservation);
    }

    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!currentUser) return;
    if (!canEdit(currentUser)) return;

    await deleteReservation(id);
    setEditing(null);
  }

  function conflictCheck(candidate: Reservation) {
    return state.reservations.some((reservation) => {
      if (reservation.id === candidate.id) return false;
      if (reservation.hallId !== candidate.hallId || reservation.eventDate !== candidate.eventDate) return false;

      if (!state.systemSettings.allowMultipleEventsPerDay) return true;

      return candidate.startTime < reservation.endTime && reservation.startTime < candidate.endTime;
    });
  }

  function jumpToDate(date: string) {
    setSelectedDate(date);
    setMonth(toMonthDate(date));
    setEditing(null);
  }

  if (!ready) {
    return <main className="p-6">Učitavanje...</main>;
  }

  if (!currentUser) {
    return (
      <RouteGuard allow={['user', 'admin', 'super_admin']}>
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="card p-6">
            <h1 className="text-xl font-semibold text-slate-900">Korisnik nije učitan</h1>
            <p className="mt-2 text-sm text-slate-600">
              Profil nije pronađen ili sesija još nije učitana. Osveži stranicu i proveri da li si prijavljen
              korisnikom koji postoji u tabeli <code>profiles</code>.
            </p>
          </div>
        </main>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allow={['user', 'admin', 'super_admin']}>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
        <Header currentUser={currentUser} onReset={resetDemo} />

        <div className="card flex flex-wrap items-center gap-3 p-4 text-sm text-slate-600">
          <span className="badge bg-slate-100 text-slate-700">
            Režim: {isSupabaseConfigured() ? 'Supabase' : 'Demo localStorage'}
          </span>

          {loading && <span>Sinhronizacija u toku…</span>}
          {error && <span className="text-red-700">{error}</span>}

          {currentUser.role === 'user' && !canCreateSuggestion(currentUser) && (
            <span className="badge bg-amber-100 text-amber-800">
              Ovom korisniku je isključen unos događaja
            </span>
          )}
        </div>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            {canViewActivityFeed(currentUser) && (
              <NotificationCenter logs={state.activityLogs} currentUser={currentUser} />
            )}

            <div className="card flex flex-wrap items-center gap-3 p-4">
              <button
                onClick={() => jumpToDate(new Date().toISOString().slice(0, 10))}
                className="rounded-xl bg-slate-100 px-4 py-2"
              >
                Danas
              </button>

              <select
                className="rounded-xl border border-slate-300 px-4 py-2"
                value={selectedHallId}
                onChange={(e) => setSelectedHallId(e.target.value)}
              >
                <option value="all">Sve sale</option>
                {state.halls.map((hall) => (
                  <option key={hall.id} value={hall.id}>
                    {hall.name}
                  </option>
                ))}
              </select>

              <div className="text-sm text-slate-500">Jedan kalendar • više rezervacija po salama</div>

              <div className="ml-auto flex flex-wrap gap-2 text-sm">
                <span className="badge bg-emerald-50 text-emerald-700">Slobodno</span>
                <span className="badge bg-red-100 text-red-700">Rezervisano</span>
                <span className="badge bg-amber-100 text-amber-800">Čeka potvrdu</span>
                <span className="badge bg-blue-100 text-blue-700">Potvrđeno</span>
              </div>
            </div>

            <CalendarMonth
              month={month}
              reservations={state.reservations}
              halls={state.halls}
              selectedHallId={selectedHallId}
              selectedDate={selectedDate}
              onPrev={() => setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              onNext={() => setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              onChangeMonth={(year, monthIndex) => setMonth(new Date(year, monthIndex, 1))}
              onGoToDate={jumpToDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setEditing(null);
              }}
            />
          </div>

          <div className="space-y-4">
            <ReservationList
              title="Događaji za izabrani dan"
              currentUser={currentUser}
              reservations={selectedReservations}
              halls={state.halls}
              onEdit={(reservation) => setEditing(reservation)}
            />

            <ReservationForm
              currentUser={currentUser}
              halls={state.halls}
              selectedDate={selectedDate}
              existing={editing}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
              conflictCheck={conflictCheck}
            />
          </div>
        </section>
      </main>
    </RouteGuard>
  );
}