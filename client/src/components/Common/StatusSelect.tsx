import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Ticket } from "@/types";
import { ALL_TICKET_STATUSES, ASSIGNMENT_STATUSES, STATUS_LABELS } from "@/constants/tickets";

interface StatusSelectProps {
  value: Ticket['status'];
  onValueChange: (value: Ticket['status']) => void;
  /** Limit to assignment-related statuses (open, assigned, in_progress) */
  assignmentMode?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Reusable status select dropdown component
 * Provides consistent status options across the application
 */
export function StatusSelect({
  value,
  onValueChange,
  assignmentMode = false,
  disabled = false,
  placeholder = "Select status",
  className = "w-64",
}: StatusSelectProps) {
  const statuses = assignmentMode ? ASSIGNMENT_STATUSES : ALL_TICKET_STATUSES;

  return (
    <Select
      onValueChange={onValueChange}
      value={value}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status} value={status}>
            {STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
