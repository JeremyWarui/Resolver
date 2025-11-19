import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Technician {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  sections: number[]; // Array of section IDs
}

interface TechnicianSelectProps {
  value: number | null | undefined;
  onValueChange: (value: number | null) => void;
  technicians: Technician[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  includeUnassigned?: boolean;
}

/**
 * Reusable technician select dropdown component
 * Provides consistent technician selection across the application
 * Note: Technicians should be pre-filtered by the parent component using backend API
 */
export function TechnicianSelect({
  value,
  onValueChange,
  technicians,
  disabled = false,
  placeholder = "Select technician",
  className = "w-full",
  includeUnassigned = true,
}: TechnicianSelectProps) {
  const handleValueChange = (val: string) => {
    if (val === "unassigned") {
      onValueChange(null);
    } else {
      onValueChange(parseInt(val));
    }
  };

  return (
    <Select
      onValueChange={handleValueChange}
      value={value?.toString() || (includeUnassigned ? "unassigned" : "")}
      disabled={disabled || technicians.length === 0}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={technicians.length === 0 ? "No technicians available" : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeUnassigned && (
          <SelectItem value="unassigned">Unassigned</SelectItem>
        )}
        {technicians.map((tech) => (
          <SelectItem key={tech.id} value={tech.id.toString()}>
            {tech.first_name} {tech.last_name} (@{tech.username})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
