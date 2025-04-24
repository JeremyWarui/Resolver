export type Ticket = {
  id: number;
  title: string;
  section: number;
  facility: number;
  priority: "low" | "medium" | "high";
  status: "open" | "assigned" | "in progress" | "pending" | "resolved";
  createdAt: string;
  updatedAt: string | undefined;
  assignedTo: string | number;
  description: string | undefined;
  raisedBy: string | undefined;
  ticket_no: number | undefined;
};