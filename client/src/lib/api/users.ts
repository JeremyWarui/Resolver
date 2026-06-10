import apiClient from './client';
import type {
  User,
  CreateUserPayload,
  UsersResponse,
  RoleAssignment,
  CreateRoleAssignmentPayload,
  UpdateRoleAssignmentPayload,
} from '@/types';

/**
 * ⚠️ DEPRECATED: User management endpoints (/users/, /users/{id}/, etc.) do not exist on the backend.
 * 
 * User/role management must be done through:
 * - /auth/me/ - Get current authenticated user profile
 * - /users/{id}/role-assignments/ - List/manage role assignments for a user
 * 
 * Per CLAUDE.md §28 Reconciliation, user management calls have been removed from the frontend.
 * The following functions are kept as stubs for reference but should not be called.
 */

export interface UserListParams {
  role?: string;
  sections?: number;
  page?: number;
  page_size?: number;
}

/**
 * ⚠️ STUB: /users/ endpoint does not exist
 * @deprecated - User listing is not supported via the API
 */
export async function getUsers(_params?: UserListParams): Promise<UsersResponse> {
  throw new Error(
    'User listing endpoint (/users/) is not available. ' +
    'Use /auth/me/ for current user or /users/{id}/role-assignments/ for role management.'
  );
}

/**
 * ⚠️ STUB: /users/{id}/ endpoint does not exist
 * @deprecated - User detail is not supported via the API
 */
export async function getUserById(_id: number): Promise<User> {
  throw new Error(
    'User detail endpoint (/users/{id}/) is not available. ' +
    'Use /auth/me/ for current user profile.'
  );
}

/**
 * ⚠️ STUB: User creation is not available
 * @deprecated - Use Django admin for user management
 */
export async function createUser(_payload: CreateUserPayload): Promise<User> {
  throw new Error(
    'User creation via API is not available. Create users through Django admin.'
  );
}

/**
 * ⚠️ STUB: User updates via /users/{id}/ do not exist
 * @deprecated - Use Django admin or role-assignment endpoints
 */
export async function updateUser(_id: number, _payload: Partial<User>): Promise<User> {
  throw new Error(
    'User update endpoint (/users/{id}/) is not available. ' +
    'Manage roles via /users/{id}/role-assignments/ instead.'
  );
}

/**
 * ⚠️ STUB: User deletion is not available
 * @deprecated - Use Django admin
 */
export async function deleteUser(_id: number): Promise<void> {
  throw new Error('User deletion via API is not available.');
}

/**
 * ⚠️ STUB: Assignable users endpoint does not exist
 * @deprecated - Use /sections/{id}/technicians/ for section-scoped technicians
 */
export async function getAssignableUsers(
  _params?: { section_id?: number }
): Promise<{ results: User[] }> {
  throw new Error(
    'Assignable users endpoint (/assignable-users/) is not available. ' +
    'Use /sections/{id}/technicians/ to get technicians for a specific section.'
  );
}

export async function getRoleAssignments(userId: number): Promise<RoleAssignment[]> {
  const { data } = await apiClient.get<RoleAssignment[]>(`/users/${userId}/role-assignments/`);
  return data;
}

export async function createRoleAssignment(
  userId: number,
  payload: CreateRoleAssignmentPayload
): Promise<RoleAssignment> {
  const { data } = await apiClient.post<RoleAssignment>(
    `/users/${userId}/role-assignments/`,
    payload
  );
  return data;
}

export async function updateRoleAssignment(
  userId: number,
  raId: number,
  payload: UpdateRoleAssignmentPayload
): Promise<RoleAssignment> {
  const { data } = await apiClient.patch<RoleAssignment>(
    `/users/${userId}/role-assignments/${raId}/`,
    payload
  );
  return data;
}

export async function deleteRoleAssignment(userId: number, raId: number): Promise<void> {
  await apiClient.delete(`/users/${userId}/role-assignments/${raId}/`);
}

const usersService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAssignableUsers,
  getRoleAssignments,
  createRoleAssignment,
  updateRoleAssignment,
  deleteRoleAssignment,
};

export default usersService;
