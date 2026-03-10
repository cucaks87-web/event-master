import { AppUser, Role } from '@/lib/types';

function roleOf(input: Role | AppUser) {
  return typeof input === 'string' ? input : input.role;
}

export function canEdit(input: Role | AppUser) {
  const role = roleOf(input);
  return role === 'admin' || role === 'super_admin';
}

export function canManageUsers(input: Role | AppUser) {
  return roleOf(input) === 'super_admin';
}

export function canViewAudit(input: Role | AppUser) {
  return roleOf(input) === 'super_admin';
}

export function canSeeFinancials(input: Role | AppUser) {
  if (typeof input === 'string') {
    return input === 'admin' || input === 'super_admin';
  }
  return input.role === 'admin' || input.role === 'super_admin' || !!input.canViewFinancials;
}

export function canViewActivityFeed(input: Role | AppUser) {
  if (typeof input === 'string') {
    return input === 'admin' || input === 'super_admin';
  }
  return input.role === 'admin' || input.role === 'super_admin' || !!input.canViewActivityFeed;
}

export function canCreateSuggestion(input: AppUser) {
  return input.role !== 'user' || !!input.canCreateSuggestion;
}
