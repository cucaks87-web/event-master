'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppUser, Hall, Reservation, ReservationStatus } from '@/lib/types';
import { canCreateSuggestion, canEdit, canSeeFinancials } from '@/lib/permissions';

const allStatuses: ReservationStatus[] = ['upit', 'ceka_potvrdu', 'rezervisano', 'potvrdjeno_depozitom', 'u_potpunosti_placeno', 'realizovano', 'otkazano'];

function blankReservation(selectedDate: string, currentUser: AppUser, halls: Hall[]): Reservation {
  return {
    id: `r_${Math.random().toString(36).slice(2, 10)}`,
    hallId: halls[0]?.id ?? 'h1',
    eventDate: selectedDate,
    startTime: '12:00',
    endTime: '18:00',
    eventType: '',
    customerName: '',
    customerPhone: '',
    guestCount: 0,
    totalPrice: halls[0]?.basePrice ?? 0,
    depositAmount: 0,
    amountPaid: 0,
    note: '',
    status: currentUser.role === 'user' ? 'ceka_potvrdu' : 'rezervisano',
    createdBy: currentUser.fullName,
    updatedBy: currentUser.fullName
  };
}

export function ReservationForm({
  currentUser,
  halls,
  selectedDate,
  existing,
  onSubmit,
  onDelete,
  conflictCheck
}: {
  currentUser: AppUser;
  halls: Hall[];
  selectedDate: string;
  existing?: Reservation | null;
  onSubmit: (reservation: Reservation) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  conflictCheck: (reservation: Reservation) => boolean;
}) {
  const [form, setForm] = useState<Reservation>(blankReservation(selectedDate, currentUser, halls));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setForm(existing ?? blankReservation(selectedDate, currentUser, halls));
  }, [existing, selectedDate, currentUser, halls]);

  const editable = canEdit(currentUser);
  const suggestionAllowed = canCreateSuggestion(currentUser);
  const financialsVisible = canSeeFinancials(currentUser);
  const readOnlyExisting = !!existing && !editable;
  const creatingLocked = !existing && currentUser.role === 'user' && !suggestionAllowed;
  const formLocked = readOnlyExisting || creatingLocked;
  const remaining = useMemo(() => Math.max(form.totalPrice - form.amountPaid, 0), [form.totalPrice, form.amountPaid]);

  function update<K extends keyof Reservation>(key: K, value: Reservation[K]) {
    if (formLocked) return;
    setForm((prev) => ({ ...prev, [key]: value, updatedBy: currentUser.fullName }));
  }

  function submit() {
    setError('');
    setSuccess('');
    if (formLocked) return;
    if (!form.eventType.trim()) return setError('Unesi tip događaja.');
    if (conflictCheck(form)) return setError('Rezervacija već postoji za izabranu salu i termin.');
    Promise.resolve(onSubmit(form))
      .then(() => {
        setSuccess(existing ? 'Uspešno ste izmenili rezervaciju.' : currentUser.role === 'user' ? 'Uspešno ste uneli predlog rezervacije.' : 'Uspešno ste uneli rezervaciju.');
        if (!existing) setForm(blankReservation(selectedDate, currentUser, halls));
      })
      .catch(() => setError('Došlo je do greške pri čuvanju rezervacije.'));
  }

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{existing ? (readOnlyExisting ? 'Pregled događaja' : 'Izmena događaja') : suggestionAllowed || editable ? 'Dodavanje događaja' : 'Pregled dana'}</h3>
        <span className="text-sm text-slate-500">Datum: {selectedDate}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <select className="rounded-xl border border-slate-300 px-4 py-3 disabled:bg-slate-50" value={form.hallId} onChange={(e) => update('hallId', e.target.value)} disabled={formLocked}>
          {halls.map((hall) => <option key={hall.id} value={hall.id}>{hall.name}</option>)}
        </select>
        <input className="rounded-xl border border-slate-300 px-4 py-3 disabled:bg-slate-50" placeholder="Vrsta događaja" value={form.eventType} onChange={(e) => update('eventType', e.target.value)} disabled={formLocked} />
        <input className="rounded-xl border border-slate-300 px-4 py-3 disabled:bg-slate-50" type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} disabled={formLocked} />
        <input className="rounded-xl border border-slate-300 px-4 py-3 disabled:bg-slate-50" type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} disabled={formLocked} />
        <input className="rounded-xl border border-slate-300 px-4 py-3 disabled:bg-slate-50" placeholder="Klijent" value={form.customerName} onChange={(e) => update('customerName', e.target.value)} disabled={formLocked} />
        <input className="rounded-xl border border-slate-300 px-4 py-3 disabled:bg-slate-50" placeholder="Telefon" value={form.customerPhone} onChange={(e) => update('customerPhone', e.target.value)} disabled={formLocked} />
        <input className="rounded-xl border border-slate-300 px-4 py-3 disabled:bg-slate-50" type="number" placeholder="Broj gostiju" value={form.guestCount} onChange={(e) => update('guestCount', Number(e.target.value))} disabled={formLocked} />
        {editable ? (
          <select className="rounded-xl border border-slate-300 px-4 py-3" value={form.status} onChange={(e) => update('status', e.target.value as ReservationStatus)}>
            {allStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        ) : (
          <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600" value={form.status} disabled />
        )}
        {financialsVisible && (
          <>
            <input className="rounded-xl border border-slate-300 px-4 py-3" type="number" placeholder="Ukupna cena" value={form.totalPrice} onChange={(e) => update('totalPrice', Number(e.target.value))} disabled={!editable} />
            <input className="rounded-xl border border-slate-300 px-4 py-3" type="number" placeholder="Depozit" value={form.depositAmount} onChange={(e) => update('depositAmount', Number(e.target.value))} disabled={!editable} />
            <input className="rounded-xl border border-slate-300 px-4 py-3" type="number" placeholder="Ukupno plaćeno" value={form.amountPaid} onChange={(e) => update('amountPaid', Number(e.target.value))} disabled={!editable} />
            <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600" value={remaining} disabled />
          </>
        )}
      </div>

      <textarea className="mt-3 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 disabled:bg-slate-50" placeholder="Napomena" value={form.note} onChange={(e) => update('note', e.target.value)} disabled={formLocked} />
      {currentUser.role === 'user' && !suggestionAllowed && !existing && <p className="mt-2 text-sm text-amber-700">Za ovog korisnika je unos događaja isključen. Super admin može da ga uključi ili isključi u sekciji Korisnici i prava.</p>}
      {currentUser.role === 'user' && suggestionAllowed && <p className="mt-2 text-sm text-amber-700">Korisnici mogu da pošalju samo novi predlog. Postojeće događaje pregledaju bez izmene i bez finansija, osim ako im Super admin to posebno dozvoli.</p>}
      {success && <p className="mt-2 text-sm text-emerald-700">{success}</p>}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-3">
        {!formLocked && <button onClick={submit} className="rounded-xl bg-blue-700 px-5 py-3 font-medium text-white">{existing ? 'Sačuvaj izmenu' : currentUser.role === 'user' ? 'Pošalji predlog' : 'Dodaj događaj'}</button>}
        {existing && editable && onDelete && <button onClick={() => onDelete(existing.id)} className="rounded-xl bg-red-50 px-5 py-3 font-medium text-red-700">Obriši</button>}
      </div>
    </div>
  );
}
