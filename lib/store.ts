'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchAppData, removeReservation, removeUser, resetLocalDemo, saveReservation, saveSystemSettings, saveUser, switchActiveUser } from '@/lib/repository';
import { AppState, AppUser, Reservation } from '@/lib/types';
import { initialState } from '@/lib/demo-data';

export function useAppStore() {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const next = await fetchAppData();
      setState(next);
    } catch (err: any) {
      setError(err?.message ?? 'Greška pri učitavanju podataka.');
    } finally {
      setReady(true);
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === state.currentUserId) ?? state.users[0],
    [state.currentUserId, state.users]
  );

  async function switchUser(userId: string) {
    const next = await switchActiveUser(state, userId);
    setState(next);
  }

  async function upsertReservation(input: Reservation) {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const next = await saveReservation(state, input, currentUser);
      setState(next);
    } catch (err: any) {
      setError(err?.message ?? 'Nije moguće sačuvati rezervaciju.');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteReservation(id: string) {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const next = await removeReservation(state, id, currentUser);
      setState(next);
    } catch (err: any) {
      setError(err?.message ?? 'Nije moguće obrisati rezervaciju.');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function persistUser(input: AppUser) {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const next = await saveUser(state, input, currentUser);
      setState(next);
    } catch (err: any) {
      setError(err?.message ?? 'Nije moguće sačuvati korisnika.');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function destroyUser(id: string) {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const next = await removeUser(state, id, currentUser);
      setState(next);
    } catch (err: any) {
      setError(err?.message ?? 'Nije moguće obrisati korisnika.');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateSystemSettings(input: AppState['systemSettings']) {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const next = await saveSystemSettings(state, input, currentUser);
      setState(next);
    } catch (err: any) {
      setError(err?.message ?? 'Nije moguće sačuvati sistemska podešavanja.');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function resetDemo() {
    resetLocalDemo();
    refresh();
  }

  return {
    ready,
    loading,
    error,
    state,
    currentUser,
    refresh,
    switchUser,
    addReservation: upsertReservation,
    updateReservation: upsertReservation,
    deleteReservation,
    saveUser: persistUser,
    deleteUser: destroyUser,
    updateSystemSettings,
    resetDemo
  };
}
