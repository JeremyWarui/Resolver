export function getStaffLabel(
  staffLabel: string | undefined | null,
  fallback = 'Technician'
): string {
  return staffLabel || fallback
}
