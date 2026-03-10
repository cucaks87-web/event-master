import { ReservationStatus } from '@/lib/types';

export const statusLabel: Record<ReservationStatus, string> = {
  upit: 'Upit',
  ceka_potvrdu: 'Čeka potvrdu',
  rezervisano: 'Rezervisano',
  potvrdjeno_depozitom: 'Potvrđeno depozitom',
  u_potpunosti_placeno: 'U potpunosti plaćeno',
  realizovano: 'Realizovano',
  otkazano: 'Otkazano'
};

export const statusClasses: Record<ReservationStatus, string> = {
  upit: 'bg-slate-100 text-slate-700',
  ceka_potvrdu: 'bg-amber-100 text-amber-800',
  rezervisano: 'bg-red-100 text-red-700',
  potvrdjeno_depozitom: 'bg-blue-100 text-blue-700',
  u_potpunosti_placeno: 'bg-emerald-100 text-emerald-700',
  realizovano: 'bg-violet-100 text-violet-700',
  otkazano: 'bg-slate-200 text-slate-700'
};

export function currency(value: number) {
  return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString));
}

export function formatDateTime(dateString: string) {
  return new Intl.DateTimeFormat('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
}

export function monthLabel(date: Date) {
  return new Intl.DateTimeFormat('sr-RS', { month: 'long', year: 'numeric' }).format(date);
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
