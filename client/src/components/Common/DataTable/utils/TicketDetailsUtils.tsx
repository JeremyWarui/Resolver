/**
 * Shared utilities for ticket details display and management
 * This file contains only actively used utilities - obsolete dialog components removed
 */

// Helper to get status badge variant styling
export const getStatusBadgeVariant = (status: string) => {
  const variants: Record<string, string> = {
    open: "bg-blue-100 text-blue-800 border-blue-200",
    assigned: "bg-purple-100 text-purple-800 border-purple-200",
    in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
    pending: "bg-orange-100 text-orange-800 border-orange-200",
    resolved: "bg-green-100 text-green-800 border-green-200",
    closed: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return variants[status] || "bg-gray-100 text-gray-800 border-gray-200";
};
