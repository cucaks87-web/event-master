import { AppState } from '@/lib/types';

export const initialState: AppState = {
  currentUserId: '1',
  users: [
    { id: '1', fullName: 'Safet', role: 'user', email: 'safet@example.com', canCreateSuggestion: true, canViewFinancials: false, canViewActivityFeed: false },
    { id: '2', fullName: 'Goran', role: 'user', email: 'goran@example.com', canCreateSuggestion: true, canViewFinancials: false, canViewActivityFeed: false },
    { id: '3', fullName: 'Šišić', role: 'user', email: 'sisic@example.com', canCreateSuggestion: true, canViewFinancials: false, canViewActivityFeed: false },
    { id: '4', fullName: 'Dušan', role: 'user', email: 'dusan@example.com', canCreateSuggestion: false, canViewFinancials: false, canViewActivityFeed: false },
    { id: '5', fullName: 'Tamara', role: 'user', email: 'tamara@example.com', canCreateSuggestion: true, canViewFinancials: false, canViewActivityFeed: false },
    { id: '6', fullName: 'Dejan', role: 'admin', email: 'dejan@example.com', canCreateSuggestion: true, canViewFinancials: true, canViewActivityFeed: true },
    { id: '7', fullName: 'Saša', role: 'super_admin', email: 'sasa@example.com', canCreateSuggestion: true, canViewFinancials: true, canViewActivityFeed: true }
  ],
  halls: [
    { id: 'h1', name: 'VIP', capacity: 60, basePrice: 700 },
    { id: 'h2', name: 'Restoran', capacity: 120, basePrice: 900 },
    { id: 'h3', name: 'Master sala', capacity: 250, basePrice: 1500 }
  ],
  reservations: [
    {
      id: 'r1', hallId: 'h1', eventDate: '2026-03-14', startTime: '18:00', endTime: '23:00', eventType: 'Rođendan', customerName: 'Miloš J.', customerPhone: '+38160123456', guestCount: 70, totalPrice: 700, depositAmount: 200, amountPaid: 400, note: 'DJ i dekoracija uključeni', status: 'potvrdjeno_depozitom', createdBy: 'Dejan', updatedBy: 'Dejan'
    },
    {
      id: 'r2', hallId: 'h2', eventDate: '2026-03-20', startTime: '13:00', endTime: '17:00', eventType: 'Krštenje', customerName: 'Ana P.', customerPhone: '+38164111222', guestCount: 45, totalPrice: 900, depositAmount: 100, amountPaid: 100, note: 'Bez alkohola', status: 'ceka_potvrdu', createdBy: 'Safet', updatedBy: 'Safet'
    },
    {
      id: 'r3', hallId: 'h3', eventDate: '2026-03-22', startTime: '19:00', endTime: '23:59', eventType: 'Svadba', customerName: 'Ivana i Marko', customerPhone: '+38165111222', guestCount: 160, totalPrice: 1500, depositAmount: 400, amountPaid: 1200, note: 'Fotobudka i bend', status: 'u_potpunosti_placeno', createdBy: 'Saša', updatedBy: 'Saša'
    }
  ],
  activityLogs: [
    { id: 'l1', actionType: 'create', entityType: 'reservation', entityId: 'r1', actorName: 'Dejan', payload: 'Dodata rezervacija za VIP, 14.03.2026.', createdAt: '2026-03-01T10:00:00Z' },
    { id: 'l2', actionType: 'create', entityType: 'reservation', entityId: 'r2', actorName: 'Safet', payload: 'Predlog događaja za Restoran, 20.03.2026.', createdAt: '2026-03-02T09:30:00Z' },
    { id: 'l3', actionType: 'update', entityType: 'system', entityId: 'settings', actorName: 'Saša', payload: 'Podešeno: jedan događaj po sali po danu kao podrazumevano pravilo.', createdAt: '2026-03-04T17:45:00Z' }
  ],
  notifications: [
    { id: 'n1', message: 'Safet je dodao događaj koji čeka potvrdu.', audience: 'all', createdAt: '2026-03-02T09:30:00Z' },
    { id: 'n2', message: 'Saša prima sve sistemske promene.', audience: 'super_admin', createdAt: '2026-03-04T17:45:00Z' }
  ],
  systemSettings: {
    allowMultipleEventsPerDay: false
  }
};
