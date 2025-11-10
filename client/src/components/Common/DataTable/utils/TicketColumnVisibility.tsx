import type { VisibilityState } from '@tanstack/react-table';

/**
 * Configuration for ticket table column visibility
 */
export interface ColumnVisibilityConfig {
  role: 'admin' | 'user' | 'technician';
  hideDescription?: boolean;
  hideFacility?: boolean;
  hideUpdatedAt?: boolean;
  customVisibility?: Partial<VisibilityState>;
}

/**
 * Generates standardized column visibility configuration for ticket tables.
 * Provides sensible defaults based on role while allowing customization.
 * 
 * @param config - Configuration for role and visibility preferences
 * @returns VisibilityState object for TanStack Table
 * 
 * @example
 * const visibility = createTicketColumnVisibility({ role: 'admin' });
 * 
 * @example
 * const visibility = createTicketColumnVisibility({
 *   role: 'user',
 *   hideDescription: false, // Show description
 *   customVisibility: { priority: true } // Add custom column
 * });
 */
export function createTicketColumnVisibility(
  config: ColumnVisibilityConfig
): VisibilityState {
  const {
    role,
    hideDescription = true,
    hideFacility = false,
    hideUpdatedAt = true,
    customVisibility = {},
  } = config;

  // Base visibility common to all roles
  const baseVisibility: VisibilityState = {
    searchField: false, // Always hidden (used for search only)
    description: !hideDescription,
    facility: !hideFacility,
    updated_at: !hideUpdatedAt,
  };

  // Role-specific defaults based on user requirements
  const roleDefaults: Record<string, VisibilityState> = {
    admin: {
      ticket_no: true,        // Ticket ID
      title: true,            // Title
      facility: true,         // Facility
      sectionName: true,      // Section
      raised_by: true,        // Raised By
      status: true,           // Status
      created_at: true,       // Created At
      updated_at: true,       // Updated At
      assigned_to: true,      // Assigned To
      actions: true,          // Actions
      description: false,     // Hidden by default
    },
    user: {
      ticket_no: true,        // Ticket ID
      title: true,            // Title
      facility: true,         // Facility
      sectionName: true,      // Section
      raised_by: true,        // Raised By
      status: true,           // Status
      assigned_to: true,      // Assigned To
      created_at: true,       // Created At
      actions: true,          // Actions
      description: false,     // Hidden by default
      updated_at: false,      // Hidden by default
    },
    technician: {
      ticket_no: true,        // Ticket ID
      title: true,            // Title
      facility: true,         // Facility
      raised_by: true,        // Raised By
      status: true,           // Status
      created_at: true,       // Created At
      updated_at: true,       // Updated At
      actions: true,          // Actions
      sectionName: false,     // Hidden by default
      assigned_to: false,     // Hidden by default
      description: false,     // Hidden by default
    },
  };

  // Merge visibility states, filtering out undefined values
  const merged = {
    ...baseVisibility,
    ...roleDefaults[role],
    ...customVisibility,
  };

  // Filter out undefined values to satisfy VisibilityState type
  const result: VisibilityState = {};
  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
}
