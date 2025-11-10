import { type ColumnDef } from "@tanstack/react-table";
import { ChevronDown, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Utility function to truncate text
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Utility function to format relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);

  if (diffInHours < 24) {
    if (diffInHours < 1) {
      return `${Math.floor(diffInMs / (1000 * 60))} minutes ago`;
    }
    return `${Math.floor(diffInHours)} hours ago`;
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Column definitions
export const ticketNoColumn = <T,>(header: string = "Ticket ID"): ColumnDef<T> => ({
  accessorKey: "ticket_no",
  header: ({ column }) => (
    <div className="flex items-center space-x-1">
      <span>{header}</span>
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting()}
        className="p-0 h-4 w-4"
      >
        <ChevronDown className="h-3 w-3" />
      </Button>
    </div>
  ),
  cell: ({ row }) => <div>{row.getValue("ticket_no")}</div>,
});

export const ticketTitleColumn = <T,>(header: string = "Title"): ColumnDef<T> => ({
  accessorKey: "title",
  header,
  cell: ({ row }) => (
    <div className="max-w-[300px] truncate" title={row.getValue("title")}>
      {truncateText(row.getValue("title"), 20)}
    </div>
  ),
  enableSorting: false,
});

export const descriptionColumn = <T,>(header: string = "Description"): ColumnDef<T> => ({
  accessorKey: "description",
  header,
  cell: ({ row }) => (
    <div
      className="max-w-[300px] truncate"
      title={row.getValue("description") || "N/A"}
    >
      {row.getValue("description")
        ? truncateText(row.getValue("description"), 20)
        : "N/A"}
    </div>
  ),
  enableSorting: false,
});

export const facilityColumn = <T,>(header: string = "Facility"): ColumnDef<T> => ({
  accessorKey: "facility",
  header,
  cell: ({ row }) => <div>{row.getValue("facility") || "N/A"}</div>,
  enableSorting: false,
});

export const sectionColumn = <T,>(header: string = "Section"): ColumnDef<T> => ({
  accessorKey: "sectionName",
  header: ({ column }) => (
    <div className="flex items-center space-x-1">
      <span>{header}</span>
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting()}
        className="p-0 h-4 w-4"
      >
        <ChevronDown className="h-3 w-3" />
      </Button>
    </div>
  ),
  cell: ({ row }) => <div>{row.getValue("sectionName")}</div>,
});

export const raisedByColumn = <T,>(header: string = "Raised By"): ColumnDef<T> => ({
  accessorKey: "raisedByName",
  header,
  cell: ({ row }) => <div>{row.getValue("raisedByName") || "N/A"}</div>,
  enableSorting: false,
});

export const statusColumn = <T,>(header: string = "Status"): ColumnDef<T> => ({
  accessorKey: "status",
  header: ({ column }) => (
    <div className="flex items-center space-x-1">
      <span>{header}</span>
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting()}
        className="p-0 h-4 w-4"
      >
        <ChevronDown className="h-3 w-3" />
      </Button>
    </div>
  ),
  cell: ({ row }) => {
    const status = row.getValue("status") as string;
    return (
      <Badge
        variant="outline"
        className={
          status === "open"
            ? "bg-blue-100 text-blue-800 border-blue-200"
            : status === "assigned"
              ? "bg-purple-100 text-purple-800 border-purple-200"
              : status === "in_progress"
                ? "bg-orange-100 text-orange-800 border-orange-200"
                : status === "pending"
                  ? "bg-gray-100 text-gray-800 border-gray-200"
                  : status === "resolved"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-gray-100 text-gray-800 border-gray-200"
        }
      >
        {status?.replace("_", " ")}
      </Badge>
    );
  },
});

export const createdAtColumn = <T,>(header: string = "Created"): ColumnDef<T> => ({
  accessorKey: "created_at",
  header: ({ column }) => (
    <div className="flex items-center space-x-1">
      <span>{header}</span>
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting()}
        className="p-0 h-4 w-4"
      >
        <ChevronDown className="h-3 w-3" />
      </Button>
    </div>
  ),
  cell: ({ row }) => {
    const createdAt = row.getValue("created_at") as string;
    const date = new Date(createdAt);
    return <div title={date.toLocaleString()}>{formatRelativeTime(createdAt)}</div>;
  },
});

export const updatedAtColumn = <T extends Record<string, unknown>,>(header: string = "Updated"): ColumnDef<T> => ({
  accessorKey: "updated_at",
  header: ({ column }) => (
    <div className="flex items-center space-x-1">
      <span>{header}</span>
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting()}
        className="p-0 h-4 w-4"
      >
        <ChevronDown className="h-3 w-3" />
      </Button>
    </div>
  ),
  cell: ({ row }) => {
    const updatedAt = row.original.updated_at;
    if (!updatedAt || typeof updatedAt !== 'string') return <div>N/A</div>;
    const date = new Date(updatedAt);
    return <div title={date.toLocaleString()}>{formatRelativeTime(updatedAt)}</div>;
  },
});

export const assignedToColumn = <T,>(header: string = "Assigned To"): ColumnDef<T> => ({
  accessorKey: "assigned_to",
  header,
  cell: ({ row }) => {
    const assignedTo = row.getValue("assigned_to");
    if (!assignedTo) return <div>Unassigned</div>;
    
    // Handle both string and object types
    if (typeof assignedTo === "object" && assignedTo !== null) {
      const user = assignedTo as { username?: string; first_name?: string; last_name?: string };
      const fullName = user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.username || "N/A";
      return <div>{fullName}</div>;
    }
    return <div>{String(assignedTo)}</div>;
  },
  enableSorting: false,
});

export const searchFieldColumn = <T,>(header: string = "Search Field"): ColumnDef<T> => ({
  accessorKey: "searchField",
  header,
  enableHiding: true,
});

// Action columns for different user roles
export function userActionsColumn<T>(options: {
  setSelectedTicket: (ticket: T) => void;
  setIsTicketDialogOpen: (open: boolean) => void;
}): ColumnDef<T> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const ticket = row.original;
      return (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-1"
          onClick={(e) => {
            e.stopPropagation();
            options.setSelectedTicket(ticket);
            options.setIsTicketDialogOpen(true);
          }}
        >
          <Eye className="mr-1 h-4 w-4" />
          <span>View</span>
        </Button>
      );
    },
  };
}

export function AdminActionsColumn<T>(options: {
  technicians: string[];
  statuses: string[];
  setSelectedTicket: (ticket: T) => void;
  setIsTicketDialogOpen: (open: boolean) => void;
  setActiveTab?: (tab: "view" | "edit") => void;
}): ColumnDef<T> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const ticket = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              options.setSelectedTicket(ticket);
              options.setActiveTab?.("view");
              options.setIsTicketDialogOpen(true);
            }}
          >
            <Eye className="mr-1 h-4 w-4" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              options.setSelectedTicket(ticket);
              options.setActiveTab?.("edit");
              options.setIsTicketDialogOpen(true);
            }}
          >
            <Edit className="mr-1 h-4 w-4" />
            Edit
          </Button>
        </div>
      );
    },
  };
}

export function technicianActionsColumn<T>(options: {
  handleBeginWork: (ticketId: number, ticketNo: string, event?: React.MouseEvent) => void;
  handleUpdateStatus: (ticketId: number, newStatus: string, event?: React.MouseEvent) => void;
  handleReopen: (ticketId: number, event?: React.MouseEvent) => void;
}): ColumnDef<T> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const ticket = row.original as T & { id: number; ticket_no: string; status: string };
      const status = ticket.status;

    if (status === "open" || status === "assigned") {
      return (
        <Button
          variant="default"
          size="sm"
          onClick={(e) => options.handleBeginWork(ticket.id, ticket.ticket_no, e)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Begin Work
        </Button>
      );
    }

    if (status === "in_progress") {
      return (
        <Select
          onValueChange={(value) => options.handleUpdateStatus(ticket.id, value)}
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Update Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Mark Pending</SelectItem>
            <SelectItem value="resolved">Mark Resolved</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (status === "pending") {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => options.handleReopen(ticket.id, e)}
        >
          Reopen
        </Button>
      );
    }

    return <div className="text-sm text-muted-foreground">No actions</div>;
  },
};
}
