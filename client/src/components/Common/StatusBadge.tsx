import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType = 'open' | 'in-progress' | 'resolved' | 'assigned' | 'pending' | 'closed' | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

/**
 * A reusable status badge component that displays different colors based on the status
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusConfig = (status: StatusType) => {
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'open':
        return { color: 'bg-blue-100 text-blue-800 hover:bg-blue-200', label: 'Open' };
      case 'in progress':
        return { color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200', label: 'In Progress' };
      case 'assigned':
        return { color: 'bg-purple-100 text-purple-800 hover:bg-purple-200', label: 'Assigned' };
      case 'resolved':
        return { color: 'bg-green-100 text-green-800 hover:bg-green-200', label: 'Resolved' };
      case 'closed':
        return { color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', label: 'Closed' };
      case 'pending':
        return { color: 'bg-orange-100 text-orange-800 hover:bg-orange-200', label: 'Pending' };
      default:
        return { color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', label: status };
    }
  };

  const { color, label } = getStatusConfig(status);

  return (
    <Badge 
      className={cn(
        "font-medium",
        color,
        className
      )}
      variant="outline"
    >
      {label}
    </Badge>
  );
};

export default StatusBadge;