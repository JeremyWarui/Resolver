/**
 * Standard DRF (Django REST Framework) paginated response format
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Standard API response wrapper for non-paginated responses
 */
export interface ApiResponse<T> {
  data: T;
}
