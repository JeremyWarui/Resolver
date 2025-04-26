import { useState, useMemo } from "react";
import { type ColumnDef, type VisibilityState } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Edit,
  UserPlus,
  Printer,
  Trash2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import DataTable component
import DataTable from "@/components/Common/DataTable";

// Import GraphQL hook instead of services
import useGraphQLTickets from "@/hooks/useGraphQLTickets";
import useGraphQLTechnicians from "@/hooks/useGraphQLTechnicians";

const allStatuses = [
  "open",
  "assigned",
  "in progress",
  "pending",
  "resolved",
];

// Add constant arrays for all sections and all technicians based on data.json
const allSections = [
  "HVAC",
  "IT",
  "Plumbing", 
  "Electrical",
  "Structural",
  "Mechanical",
  "Kitchen",
  "Grounds",
  "Security"
];

function AllTicketsTable() {
  // Table state and filters
  const [sorting, setSorting] = useState([
    { id: 'id', desc: true } // Default sorting by ID in descending order
  ]);
  
  // Set initial column visibility - hide certain columns by default
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: true,
    ticket_no: true,
    title: true,
    sectionName: true,
    raisedBy: true,
    status: true,
    priority: false,
    createdAt: true,
    assignedTo: true,
    updatedAt: false,
    description: false,
    facility: false,
    actions: true,
    searchField: false, // Always hide the search field column
  });
  
  // Pagination state for server side pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [technicianFilter, setTechnicianFilter] = useState("all");

  // Use GraphQL hooks instead of fetching directly
  const { 
    tickets, 
    totalTickets, 
    sections, 
    loading: ticketsLoading 
  } = useGraphQLTickets({
    page: pageIndex,
    pageSize,
    status: statusFilter === "all" ? null : statusFilter,
    section: sectionFilter === "all" ? null : sectionFilter,
    technician: technicianFilter === "all" ? null : technicianFilter,
    sortField: 'id',
    sortDirection: 'desc'
  });

  // Use GraphQL hooks to fetch technicians
  const { 
    technicians: allTechniciansData,
    loading: techniciansLoading 
  } = useGraphQLTechnicians({
    pageSize: 100, // Get a large batch of technicians
  });

  // Extract all technician names from the fetched data
  const allAvailableTechnicians = useMemo(() => {
    return allTechniciansData.map(tech => tech.name);
  }, [allTechniciansData]);

  // Build a lookup map from section id to section name
  const sectionMap = useMemo(() => {
    return sections.reduce((map, section) => {
      map[section.id] = section.name;
      return map;
    }, {});
  }, [sections]);

  // Add a searchable field to each ticket that combines ID and title
  const dataWithSectionNames = useMemo(() => {
    return tickets.map((ticket) => ({
      ...ticket,
      sectionName: sectionMap[ticket.section] || "Unknown",
      searchField: `${String(ticket.id).toLowerCase()} ${ticket.title.toLowerCase()}`,
    }));
  }, [tickets, sectionMap]);

  // Unique values for filters
  const uniqueTechnicians = useMemo(() => {
    return [
      ...new Set(dataWithSectionNames.map((ticket) => ticket.assignedTo)),
    ];
  }, [dataWithSectionNames]);
  
  const uniqueUsers = useMemo(() => {
    return [
      ...new Set(
        dataWithSectionNames
          .map((ticket) => ticket.raisedBy)
          .filter((value) => Boolean(value))
      ),
    ];
  }, [dataWithSectionNames]);

  // Function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  // Define table columns
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "ticket_no",
      header: "Ticket ID",
      cell: ({ row }) => <div>{row.getValue("ticket_no")}</div>,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate" title={row.getValue("title")}>
          {truncateText(row.getValue("title"), 20)}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div
          className="max-w-[300px] truncate"
          title={row.getValue("description") || "N/A"}
        >
          {truncateText(row.getValue("description"), 20)}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "facility",
      header: "Facility",
      cell: ({ row }) => <div>{row.getValue("facility")}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "sectionName",
      header: "Section",
      cell: ({ row }) => <div>{row.getValue("sectionName")}</div>,
    },
    {
      accessorKey: "raisedBy",
      header: "Raised By",
      cell: ({ row }) => <div>{row.getValue("raisedBy") || "N/A"}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: "Status",
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
                  : status === "in progress"
                    ? "bg-orange-100 text-orange-800 border-orange-200"
                    : status === "pending"
                      ? "bg-gray-100 text-gray-800 border-gray-200"
                      : "bg-green-100 text-green-800 border-green-200"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        return (
          <Badge
            variant="outline"
            className={
              priority === "high"
                ? "bg-red-100 text-red-800 border-red-200"
                : priority === "medium"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                  : "bg-green-100 text-green-800 border-green-200"
            }
          >
            {priority}
          </Badge>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        const date = new Date(createdAt);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        return (
          <div title={date.toLocaleString()}>
            {diffInHours < 24
              ? diffInHours < 1
                ? `${Math.floor(diffInMs / (1000 * 60))} minutes ago`
                : `${Math.floor(diffInHours)} hours ago`
              : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
          </div>
        );
      },
    },
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
      cell: ({ row }) => <div>{row.getValue("assignedTo") || "Unassigned"}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => {
        const updatedAt = row.original.updatedAt;
        if (!updatedAt) return <div>N/A</div>;
        const date = new Date(updatedAt);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        return (
          <div title={date.toLocaleString()}>
            {diffInHours < 24
              ? diffInHours < 1
                ? `${Math.floor(diffInMs / (1000 * 60))} minutes ago`
                : `${Math.floor(diffInHours)} hours ago`
              : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
          </div>
        );
      },
    },
    {
      accessorKey: "searchField",
      header: "Search Field",
      enableHiding: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const ticket = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => alert(`View details for ticket ${ticket.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => alert(`Edit ticket ${ticket.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit ticket
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign to
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {allAvailableTechnicians.map((tech) => (
                    <DropdownMenuItem
                      key={tech}
                      onClick={() =>
                        alert(`Assigned ticket ${ticket.id} to ${tech}`)
                      }
                    >
                      {tech}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Change status
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {allStatuses.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() =>
                        alert(`Changed ticket ${ticket.id} status to ${status}`)
                      }
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => alert(`Print ticket ${ticket.id}`)}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => alert(`Delete ticket ${ticket.id}`)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Create additional filters component for the admin datatable
  const additionalFilters = (
    <>
      <Select
        onValueChange={(value) => {
          setTechnicianFilter(value);
          setPageIndex(0);
        }}
        value={technicianFilter}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by technician">
            {technicianFilter === "all" ? "All Technicians" : technicianFilter}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Technicians</SelectItem>
          {allAvailableTechnicians.length > 0 
            ? allAvailableTechnicians.map((technician) => (
              <SelectItem key={technician} value={technician}>
                {technician}
              </SelectItem>
            ))
            : uniqueTechnicians.map((technician) => (
              <SelectItem key={technician} value={technician}>
                {technician}
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => {
          // Handle user filter
          console.log(`User filter changed to ${value}`);
          // This would normally update state and filter data
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by user" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          {uniqueUsers.map((user) => (
            <SelectItem key={user} value={user}>
              {user}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );

  // Determine if we're loading data
  const loading = ticketsLoading || techniciansLoading;

  // Create filter options for the DataTable
  const filterOptions = {
    label: "Filter by section",
    options: [
      { label: "All Sections", value: "all" },
      ...allSections.map((section) => ({
        label: section,
        value: section,
      })),
    ],
    defaultValue: sectionFilter,
    onFilterChange: (value) => {
      setSectionFilter(value);
      setPageIndex(0);
    },
  };

  // Define status filter options
  const statusFilterOptions = {
    label: "Filter by status",
    options: [
      { label: "All Statuses", value: "all" },
      ...allStatuses.map((status) => ({
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: status,
      })),
    ],
    defaultValue: statusFilter,
    onFilterChange: (value) => {
      setStatusFilter(value);
      setPageIndex(0);
    },
  };

  // Handler for column visibility changes
  const handleColumnVisibilityChange = (newVisibility: VisibilityState) => {
    setColumnVisibility(newVisibility);
  };

  // Function to handle page changes
  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  // Function to handle page size changes
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    // Reset page index when page size changes
    setPageIndex(0);
  };

  return (
    <DataTable
      variant="admin"
      columns={columns}
      data={dataWithSectionNames}
      searchPlaceholder="Search by ID or title..."
      emptyStateMessage="No tickets found"
      emptyStateDescription="Try changing your filters or check back later"
      defaultSorting={[{ id: 'id', desc: true }]}
      defaultPageSize={pageSize}
      initialColumnVisibility={columnVisibility}
      filterOptions={statusFilterOptions}
      additionalFilters={additionalFilters}
      manualPagination={true}
      totalItems={totalTickets}
      loading={loading}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onColumnVisibilityChange={handleColumnVisibilityChange}
    />
  );
}

export default AllTicketsTable;
