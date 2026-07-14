import apiClient from './client';
import type { UserRole } from '@/types';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'currentUser';

// ── Backend JWT response shape ────────────────────────────────────────────────

interface JWTUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  home_campus_name?: string | null;
  primary_department_name?: string | null;
  active_role: {
    id?: number;
    role: UserRole;
    section_id?: number | null;
    campus_department_id?: number | null;
    department_id?: number | null;
    is_primary?: boolean;
    valid_until?: string | null;
  } | null;
}

interface JWTLoginResponse {
  user: JWTUser;
  accessToken: string;
}

// ── Flat shape returned to callers and stored in localStorage ─────────────────
// Keeps the same surface as the old DRF token response so all callers
// (LoginForm, useAuth, useUserData) require no changes.

export interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  primary_campus_id: number | null;
  primary_department_id: number | null;
  sections: number[];
  home_campus_name: string | null;
  primary_department_name: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  campus_id: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function flattenJWT(data: JWTLoginResponse): LoginResponse {
  const ar = data.user.active_role;

  // campus_id comes from the JWT claim (set from UserProfile) — authoritative
  // for all roles including pure requesters where active_role is null.
  let tokenCampusId: number | null = null;
  try {
    const payload = JSON.parse(atob(data.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    tokenCampusId = typeof payload.campus_id === 'number' ? payload.campus_id : null;
  } catch { /* ignore decode errors */ }

  return {
    token: data.accessToken,
    user_id: data.user.id,
    username: data.user.username,
    email: data.user.email,
    role: ar?.role ?? 'user',
    first_name: data.user.first_name,
    last_name: data.user.last_name,
    primary_campus_id: tokenCampusId,
    primary_department_id: ar?.department_id ?? null,
    sections: ar?.section_id != null ? [ar.section_id] : [],
    home_campus_name: data.user.home_campus_name ?? null,
    primary_department_name: data.user.primary_department_name ?? null,
  };
}

function persistSession(data: LoginResponse): void {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      id: data.user_id,
      username: data.username,
      email: data.email,
      role: data.role,
      first_name: data.first_name,
      last_name: data.last_name,
      primary_campus_id: data.primary_campus_id,
      primary_department_id: data.primary_department_id,
      sections: data.sections ?? [],
      home_campus_name: data.home_campus_name,
      primary_department_name: data.primary_department_name,
    })
  );
}

// ── Auth API ──────────────────────────────────────────────────────────────────

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await apiClient.post<JWTLoginResponse>('/auth/login/', credentials);
  const flat = flattenJWT(data);
  persistSession(flat);
  return flat;
}

export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<JWTLoginResponse>('/auth/register/', payload);
  const flat = flattenJWT(data);
  persistSession(flat);
  return flat;
}

export interface PublicCampus {
  id: number;
  name: string;
  code: string;
}

export async function getPublicCampuses(): Promise<PublicCampus[]> {
  const { data } = await apiClient.get<PublicCampus[]>('/auth/campuses/');
  return data;
}

export async function switchRoleApi(roleAssignmentId: number): Promise<LoginResponse> {
  const { data } = await apiClient.post<JWTLoginResponse>('/auth/switch-role/', { roleAssignmentId });
  const flat = flattenJWT(data);
  persistSession(flat);
  return flat;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout/');
  } catch {
    // Always clear local session even if server call fails
  } finally {
    clearSession();
  }
}

export interface RoleAssignment {
  id: number;
  role: string;
  section_id: number | null;
  campus_department_id: number | null;
  department_id: number | null;
  is_primary: boolean;
  valid_from: string | null;
  valid_until: string | null;
}

export interface MeResponse extends LoginResponse {
  role_assignments: RoleAssignment[];
}

export async function getProfile(): Promise<MeResponse> {
  const { data } = await apiClient.get<JWTLoginResponse & { role_assignments?: RoleAssignment[] }>('/auth/me/');
  const flat = flattenJWT(data);
  return { ...flat, role_assignments: data.role_assignments ?? [] };
}

export async function updateProfile(
  payload: Partial<RegisterPayload>
): Promise<LoginResponse> {
  const { data } = await apiClient.put<JWTLoginResponse>('/auth/profile/', payload);
  return flattenJWT(data);
}

// ── Sync helpers (read localStorage, no API call) ─────────────────────────────

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): LoginResponse | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoginResponse;
  } catch {
    return null;
  }
}

export function getUserRole(): UserRole | null {
  return getCurrentUser()?.role ?? null;
}

export function hasRole(roles: UserRole | UserRole[]): boolean {
  const role = getUserRole();
  if (!role) return false;
  return Array.isArray(roles) ? roles.includes(role) : role === roles;
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('refreshToken');
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('user'); // old key used by legacy code
}
