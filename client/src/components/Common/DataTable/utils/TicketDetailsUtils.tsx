import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Edit, MessageSquare, Loader2, User } from "lucide-react";
import type { Ticket, Comment, Section, Facility } from "@/types";

// Form schema for ticket editing
const ticketFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  section_id: z.number({ required_error: "Section is required" }),
  facility_id: z.number({ required_error: "Facility is required" }),
});

// Helper to get status badge variant
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

// Helper to format date
export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Dialog Header Component
interface DialogHeaderProps {
  ticket: Ticket;
}

export const DialogHeaderComponent = ({ ticket }: DialogHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle className="text-2xl">Ticket - {ticket.ticket_no}</DialogTitle>
      <DialogDescription>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className={getStatusBadgeVariant(ticket.status)}>
            {ticket.status.toUpperCase()}
          </Badge>
          <span className="text-sm text-gray-500">
            Created: {formatDate(ticket.created_at)}
          </span>
        </div>
      </DialogDescription>
    </DialogHeader>
  );
};

// View Ticket Details Component
interface ViewTicketDetailsProps {
  ticket: Ticket;
  isTechnician?: boolean; // Kept for compatibility but no longer used
}

export const ViewTicketDetails = ({ ticket }: ViewTicketDetailsProps) => {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-lg font-medium">Title</h3>
        <p className="text-gray-700">{ticket.title}</p>
      </div>

      <div>
        <h3 className="text-lg font-medium">Description</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
      </div>

      <hr />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Section</h3>
          <p className="text-gray-900">{ticket.section || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Facility</h3>
          <p className="text-gray-900">{ticket.facility || "N/A"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Raised By</h3>
          <p className="text-gray-900">{ticket.raised_by || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
          <p className="text-gray-900">
            {ticket.assigned_to
              ? `${ticket.assigned_to.first_name} ${ticket.assigned_to.last_name}`
              : "Unassigned"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Created At</h3>
          <p className="text-gray-900">{formatDate(ticket.created_at)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
          <p className="text-gray-900">{formatDate(ticket.updated_at)}</p>
        </div>
      </div>
    </div>
  );
};

// Edit Ticket Form Component
interface EditTicketDetailsFormProps {
  ticket: Ticket;
  sections: Section[];
  facilities: Facility[];
  onSubmit: (updatedTicket: Ticket) => Promise<void>;
  isSubmitting: boolean;
  handleCancelEdit: () => void;
}

export const EditTicketDetailsForm = ({
  ticket,
  sections,
  facilities,
  onSubmit,
  isSubmitting: isSubmittingProp,
  handleCancelEdit,
}: EditTicketDetailsFormProps) => {
  const form = useForm<z.infer<typeof ticketFormSchema>>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: ticket?.title || "",
      description: ticket?.description || "",
      section_id: ticket?.section_id || 0,
      facility_id: ticket?.facility_id || 0,
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(isSubmittingProp);

  useEffect(() => {
    if (ticket) {
      form.reset({
        title: ticket.title || "",
        description: ticket.description || "",
        section_id: ticket.section_id || 0,
        facility_id: ticket.facility_id || 0,
      });
    }
  }, [ticket, form]);

  const handleSubmit = async (values: z.infer<typeof ticketFormSchema>) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...ticket,
        ...values,
      });
    } catch (error) {
      console.error("Failed to update ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter ticket title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter ticket description"
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <hr />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="section_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id.toString()}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facility_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facility</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select facility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {facilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id.toString()}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleCancelEdit}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// Comment Section Component
interface CommentSectionProps {
  comments: Comment[];
}

export const CommentSection = ({ comments }: CommentSectionProps) => {
  if (!comments || comments.length === 0) {
    return (
      <div className="border rounded-md bg-gray-50 p-8 text-center">
        <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500">No comments yet</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md bg-white overflow-y-auto max-h-[250px]">
      {comments.map((comment, index) => (
        <div
          key={comment.id}
          className={`py-3 px-4 ${index !== 0 ? "border-t border-gray-200" : ""}`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-sm flex items-center">
              <User className="h-3 w-3 mr-1 text-blue-600" />
              {comment.author}
            </span>
            <span className="text-xs text-gray-500" title={formatDate(comment.created_at)}>
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-gray-700">{comment.text}</p>
        </div>
      ))}
    </div>
  );
};

// Comment Form Component
interface TicketCommentFormProps {
  isTechnician: boolean;
}

export const TicketCommentForm = ({ isTechnician }: TicketCommentFormProps) => {
  return (
    <div className="border rounded-md bg-gray-50 p-4">
      <h3 className="text-sm font-medium mb-2">Add Comment</h3>
      <Textarea
        placeholder={
          isTechnician
            ? "Add a comment or update for this ticket..."
            : "Add a comment..."
        }
        className="min-h-[80px] mb-2"
      />
      <div className="flex justify-end">
        <Button size="sm">Post Comment</Button>
      </div>
    </div>
  );
};

// Admin Tablist Component
interface AdminTablistComponentProps {
  ticketComments: Comment[];
}

export const AdminTablistComponent = ({ ticketComments }: AdminTablistComponentProps) => {
  return (
    <TabsList className="grid grid-cols-3 mb-4">
      <TabsTrigger value="view" className="flex items-center">
        <FileText className="h-4 w-4 mr-2" />
        View Details
      </TabsTrigger>
      <TabsTrigger value="edit" className="flex items-center">
        <Edit className="h-4 w-4 mr-2" />
        Edit Ticket
      </TabsTrigger>
      <TabsTrigger value="comments" className="flex items-center">
        <MessageSquare className="h-4 w-4 mr-2" />
        Comments ({ticketComments.length})
      </TabsTrigger>
    </TabsList>
  );
};

// Technician Tablist Component
interface TechnicianTablistComponentProps {
  ticketComments: Comment[];
  isTechnician: boolean;
  setActiveTab: (tab: string) => void;
}

export const TechnicianTablistComponent = ({
  ticketComments,
}: TechnicianTablistComponentProps) => {
  return (
    <TabsList className="grid grid-cols-2 mb-4">
      <TabsTrigger value="details" className="flex items-center">
        <FileText className="h-4 w-4 mr-2" />
        Ticket Details
      </TabsTrigger>
      <TabsTrigger value="comments" className="flex items-center">
        <MessageSquare className="h-4 w-4 mr-2" />
        Comments ({ticketComments.length})
      </TabsTrigger>
    </TabsList>
  );
};
