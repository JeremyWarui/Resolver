import { useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { Ticket, Section, Facility } from "@/types";

import {
  TicketCommentForm,
  EditTicketDetailsForm,
  ViewTicketDetails,
  CommentSection,
  DialogHeaderComponent,
  TechnicianTablistComponent,
  AdminTablistComponent,
} from "./utils/TicketDetailsUtils";

export interface TicketDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket;
  sections?: Section[];
  facilities?: Facility[];
  isEditing?: boolean;
  isTechnician?: boolean;
  currentUser?: string; // username
  onUpdate?: (updatedTicket: Ticket) => Promise<void>;
}

const UserTicketDetailsComponent = ({
  isOpen,
  onOpenChange,
  ticket,
  sections,
  facilities,
  currentUser,
  onUpdate,
}: TicketDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-[700px] py-12 px-8">
        {/* header for dialog */}
        <DialogHeaderComponent ticket={ticket} />

        {/* body for dialog */}
        {isEditing ? (
          <EditTicketDetailsForm
            ticket={ticket}
            sections={sections || []}
            facilities={facilities || []}
            onSubmit={async (updatedTicket) => {
              // Call the onUpdate function from MyTicketsTable
              await onUpdate?.(updatedTicket);
              // Close the editor after successful update
              setIsEditing(false);
              // Note: Remove the toast from here since MyTicketsTable already shows one
            }}
            isSubmitting={false}
            handleCancelEdit={() => setIsEditing(false)}
          />
        ) : (
          <ViewTicketDetails ticket={ticket} isTechnician={false} />
        )}
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {ticket.raised_by === currentUser && onUpdate && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Ticket
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AdminTicketDetailsComponent = ({
  isOpen,
  onOpenChange,
  onUpdate = async () => {},
  ticket,
  sections,
  facilities,
  isTechnician = false,
}: TicketDetailsProps) => {
  const [activeTab, setActiveTab] = useState("view");

  // Get ticket comments
  const ticketComments = ticket?.comments || [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-[800px] max-h-[800px] py-10 px-8">
        {/* header for dialog */}
        <DialogHeaderComponent ticket={ticket} />

        {/* tabs */}
        <div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* tablist menu */}
            <AdminTablistComponent ticketComments={ticketComments} />
            <div className="min-h-[350px]">
              {/* View Details Tab */}
              <TabsContent value="view" className="space-y-2">
                <ViewTicketDetails
                  ticket={ticket}
                  isTechnician={isTechnician}
                />
              </TabsContent>
              {/* Edit Ticket Tab */}
              <TabsContent value="edit" className="space-y-2">
                <EditTicketDetailsForm
                  ticket={ticket}
                  sections={sections || []}
                  facilities={facilities || []}
                  onSubmit={async (updatedTicket) => {
                    await onUpdate(updatedTicket);
                    toast.success("Successfully updated the ticket");
                  }}
                  isSubmitting={false}
                  handleCancelEdit={() => setActiveTab("view")}
                />
              </TabsContent>
              {/* Comments Tab */}
              <TabsContent value="comments" className="space-y-2">
                {/* form for adding comments */}
                <TicketCommentForm isTechnician={false} />
                {/* comment section */}
                <CommentSection comments={ticketComments} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
        {/* footer for dialog */}
        <DialogFooter className="mt-4 pt-3 border-t">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TechnicianTicketDetailsComponent = ({
  isOpen,
  onOpenChange,
  ticket,
}: TicketDetailsProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const [isTechnician] = useState(true); // Replace with actual logic to determine if the user is a technician

  // Get ticket comments
  const ticketComments = ticket?.comments || [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-[800px] md:max-h-[820px] py-10 px-8">
        {/* header for dialog */}
        <DialogHeaderComponent ticket={ticket} />

        {/* tabs */}
        <div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* tablist menu */}
            <TechnicianTablistComponent
              ticketComments={ticketComments}
              isTechnician={isTechnician}
              setActiveTab={setActiveTab}
            />
            <div className="min-h-[350px]">
              {/* View Details Tab */}
              <TabsContent value="details" className="space-y-2">
                <ViewTicketDetails
                  ticket={ticket}
                  isTechnician={isTechnician}
                />
              </TabsContent>
              {/* Comments Tab */}
              <TabsContent value="comments" className="space-y-2">
                {/* form for adding comments */}
                <TicketCommentForm isTechnician />
                {/* comment section */}
                <CommentSection comments={ticketComments} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
        {/* footer for dialog */}
        <DialogFooter className="mt-4 pt-3 border-t">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TicketDetails = {
  UserTicketDetailsComponent,
  TechnicianTicketDetailsComponent,
  AdminTicketDetailsComponent,
};

export default TicketDetails;
