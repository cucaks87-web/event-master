'use client';

import { initialState } from '@/lib/demo-data';
import { APP_STORAGE_KEY } from '@/lib/env';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { getSessionEmail } from '@/lib/auth';
import { ActivityLog, AppState, AppUser, Hall, Reservation, SystemSettings } from '@/lib/types';

const supabase = getSupabaseBrowserClient();

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function loadLocalState(): AppState {
  if (typeof window === 'undefined') return initialState;
  const raw = window.localStorage.getItem(APP_STORAGE_KEY);
  return raw ? JSON.parse(raw) : initialState;
}

function saveLocalState(next: AppState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(next));
}

function pushAudit(
  state: AppState,
  actorName: string,
  actionType: ActivityLog['actionType'],
  entityType: ActivityLog['entityType'],
  entityId: string,
  payload: string
) {
  state.activityLogs = [
    {
      id: uid('log'),
      actionType,
      entityType,
      entityId,
      actorName,
      payload,
      createdAt: nowIso()
    },
    ...state.activityLogs
  ].slice(0, 200);
}

function localModeLabel() {
  return supabase ? 'supabase' : 'local';
}

export async function fetchAppData(): Promise<AppState> {
  if (!supabase) return loadLocalState();

  const [profilesRes, hallsRes, reservationsRes, logsRes, settingsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role, email, can_create_suggestion, can_view_financials, can_view_activity_feed')
      .order('full_name'),

    supabase
      .from('halls')
      .select('id, name, sort_order, is_active')
      .order('sort_order'),

    supabase
      .from('reservations')
      .select('*')
      .order('event_date')
      .order('start_time'),

    supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200),

    supabase
      .from('app_settings')
      .select('id, allow_multiple_events_per_day')
      .limit(1)
      .maybeSingle()
  ]);

  if (profilesRes.error || hallsRes.error || reservationsRes.error || logsRes.error || settingsRes.error) {
    console.error(
      'Supabase fetch error:',
      profilesRes.error || hallsRes.error || reservationsRes.error || logsRes.error || settingsRes.error
    );
    return loadLocalState();
  }

  const sessionEmail = await getSessionEmail().catch(() => null);

    const users: AppUser[] = (profilesRes.data ?? []).map((item: any) => ({
    id: item.id,
    fullName: item.full_name,
    role: item.role,
    email: item.email ?? '',
    canCreateSuggestion: item.can_create_suggestion ?? true,
    canViewFinancials: item.can_view_financials ?? item.role !== 'user',
    canViewActivityFeed: item.can_view_activity_feed ?? item.role !== 'user'
  }));

  const localCurrentUserId = loadLocalState().currentUserId;

  const matchedBySession = users.find(
    (user) => user.email && sessionEmail && user.email.toLowerCase() === sessionEmail.toLowerCase()
  )?.id;

  const matchedByLocal = users.find(
    (user) => user.id === localCurrentUserId
  )?.id;

  const currentUserId =
    matchedBySession ??
    matchedByLocal ??
    users[0]?.id ??
    initialState.currentUserId;

  const halls: Hall[] = (hallsRes.data ?? []).map((item: any) => ({
    id: item.id,
    name: item.name,
    capacity: 0,
    basePrice: 0
  }));

  const reservations: Reservation[] = (reservationsRes.data ?? []).map((item: any) => ({
    id: item.id,
    hallId: item.hall_id,
    eventDate: item.event_date,
    startTime: item.start_time?.slice(0, 5) ?? '12:00',
    endTime: item.end_time?.slice(0, 5) ?? '18:00',
    eventType: item.event_type,
    customerName: item.client_name ?? '',
    customerPhone: item.client_phone ?? '',
    guestCount: item.guest_count ?? 0,
    totalPrice: Number(item.price ?? 0),
    depositAmount: Number(item.deposit ?? 0),
    amountPaid: Number(item.paid ?? 0),
    note: item.note ?? '',
    status: item.status,
    createdBy: item.created_by ?? 'Sistem',
    updatedBy: item.updated_by ?? 'Sistem'
  }));

  const activityLogs: ActivityLog[] = (logsRes.data ?? []).map((item: any) => ({
    id: item.id,
    actionType: item.action,
    entityType: item.entity_type,
    entityId: item.entity_id,
    actorName: item.actor_id ?? 'Sistem',
    payload:
      typeof item.details === 'string'
        ? item.details
        : JSON.stringify(item.details ?? {}),
    createdAt: item.created_at
  }));

  const systemSettings: SystemSettings = {
    allowMultipleEventsPerDay: settingsRes.data?.allow_multiple_events_per_day ?? false
  };

  return {
    currentUserId,
    users,
    halls,
    reservations,
    activityLogs,
    notifications: [],
    systemSettings
  };
}

export async function saveReservation(currentState: AppState, reservation: Reservation, actor: AppUser) {
  if (!supabase) {
    const next = clone(currentState);
    const exists = next.reservations.some((item) => item.id === reservation.id);
    next.reservations = exists
      ? next.reservations.map((item) => (item.id === reservation.id ? reservation : item))
      : [reservation, ...next.reservations];
    pushAudit(
      next,
      actor.fullName,
      exists ? 'update' : 'create',
      'reservation',
      reservation.id,
      `${exists ? 'Ažuriran' : 'Dodat'} događaj ${reservation.eventType} (${localModeLabel()}).`
    );
    saveLocalState(next);
    return next;
  }

  const isNew = reservation.id.startsWith('r_');

  const payload = {
    ...(isNew ? {} : { id: reservation.id }),
    hall_id: reservation.hallId,
    event_date: reservation.eventDate,
    start_time: reservation.startTime,
    end_time: reservation.endTime,
    event_type: reservation.eventType,
    client_name: reservation.customerName,
    client_phone: reservation.customerPhone,
    guest_count: reservation.guestCount,
    price: reservation.totalPrice,
    deposit: reservation.depositAmount,
    paid: reservation.amountPaid,
    note: reservation.note,
    status: reservation.status,
    created_by: actor.id,
    updated_by: actor.id
  };

  const query = isNew
    ? supabase.from('reservations').insert(payload)
    : supabase.from('reservations').update(payload).eq('id', reservation.id);

  const { error } = await query;
  if (error) throw error;

  return fetchAppData();
}

export async function removeReservation(currentState: AppState, reservationId: string, actor: AppUser) {
  if (!supabase) {
    const next = clone(currentState);
    next.reservations = next.reservations.filter((item) => item.id !== reservationId);
    pushAudit(next, actor.fullName, 'delete', 'reservation', reservationId, `Obrisana rezervacija (${localModeLabel()}).`);
    saveLocalState(next);
    return next;
  }

  const { error } = await supabase.from('reservations').delete().eq('id', reservationId);
  if (error) throw error;

  return fetchAppData();
}

export async function saveUser(currentState: AppState, user: AppUser, actor: AppUser) {
  if (!supabase) {
    const next = clone(currentState);
    const exists = next.users.some((item) => item.id === user.id);
    next.users = exists ? next.users.map((item) => (item.id === user.id ? user : item)) : [...next.users, user];
    pushAudit(
      next,
      actor.fullName,
      exists ? 'update' : 'create',
      'user',
      user.id,
      `${exists ? 'Izmenjen' : 'Dodat'} korisnik ${user.fullName} (${localModeLabel()}).`
    );
    saveLocalState(next);
    return next;
  }

  const recordId = user.id.startsWith('u_') ? crypto.randomUUID() : user.id;

  const { error } = await supabase.from('profiles').upsert({
    id: recordId,
    full_name: user.fullName,
    email: user.email,
    role: user.role,
    can_create_suggestion: user.canCreateSuggestion ?? true,
    can_view_financials: user.canViewFinancials ?? user.role !== 'user',
    can_view_activity_feed: user.canViewActivityFeed ?? user.role !== 'user'
  });

  if (error) throw error;

  return fetchAppData();
}

export async function removeUser(currentState: AppState, userId: string, actor: AppUser) {
  if (!supabase) {
    const next = clone(currentState);
    next.users = next.users.filter((item) => item.id !== userId);
    pushAudit(next, actor.fullName, 'delete', 'user', userId, `Obrisan korisnik (${localModeLabel()}).`);
    saveLocalState(next);
    return next;
  }

  const { error } = await supabase.from('profiles').delete().eq('id', userId);
  if (error) throw error;

  return fetchAppData();
}

export async function saveSystemSettings(currentState: AppState, settings: SystemSettings, actor: AppUser) {
  if (!supabase) {
    const next = clone(currentState);
    next.systemSettings = settings;
    pushAudit(
      next,
      actor.fullName,
      'settings',
      'system',
      'settings',
      `Promenjeno podešavanje: allowMultipleEventsPerDay = ${
        settings.allowMultipleEventsPerDay ? 'uključeno' : 'isključeno'
      } (${localModeLabel()}).`
    );
    saveLocalState(next);
    return next;
  }

  const existing = await supabase
    .from('app_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (existing.error) throw existing.error;

  const payload = existing.data?.id
    ? {
        id: existing.data.id,
        allow_multiple_events_per_day: settings.allowMultipleEventsPerDay,
        updated_by: actor.id
      }
    : {
        allow_multiple_events_per_day: settings.allowMultipleEventsPerDay,
        updated_by: actor.id
      };

  const { error } = await supabase.from('app_settings').upsert(payload);
  if (error) throw error;

  return fetchAppData();
}

export async function switchActiveUser(currentState: AppState, userId: string) {
  const next = clone(currentState);
  next.currentUserId = userId;
  saveLocalState(next);
  return next;
}

export function resetLocalDemo() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(APP_STORAGE_KEY);
}