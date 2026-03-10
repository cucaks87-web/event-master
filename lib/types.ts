export type Role = 'user' | 'admin' | 'super_admin';

export type ReservationStatus =
  | 'upit'
  | 'ceka_potvrdu'
  | 'rezervisano'
  | 'potvrdjeno_depozitom'
  | 'u_potpunosti_placeno'
  | 'realizovano'
  | 'otkazano';

export interface AppUser {
  id: string;
  fullName: string;
  role: Role;
  email: string;
  canCreateSuggestion?: boolean;
  canViewFinancials?: boolean;
  canViewActivityFeed?: boolean;
}

export interface Hall {
  id: string;
  name: string;
  capacity: number;
  basePrice: number;
}

export interface Reservation {
  id: string;
  hallId: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  eventType: string;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  totalPrice: number;
  depositAmount: number;
  amountPaid: number;
  note: string;
  status: ReservationStatus;
  createdBy: string;
  updatedBy: string;
}

export interface NotificationItem {
  id: string;
  message: string;
  audience: 'all' | 'admin' | 'super_admin';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  actionType: 'create' | 'update' | 'delete' | 'auth' | 'settings';
  entityType: 'reservation' | 'user' | 'system';
  entityId: string;
  actorName: string;
  payload: string;
  createdAt: string;
}

export interface SystemSettings {
  allowMultipleEventsPerDay: boolean;
}

export interface AppState {
  currentUserId: string;
  users: AppUser[];
  halls: Hall[];
  reservations: Reservation[];
  activityLogs: ActivityLog[];
  notifications: NotificationItem[];
  systemSettings: SystemSettings;
}
