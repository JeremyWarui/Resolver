import { useState } from 'react';
import { useTickets } from '@/hooks/tickets';
import { useTechnicians } from '@/hooks/technicians';
import DataTable from '@/components/Common/DataTable/DataTable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Inbox } from 'lucide-react';
import type { Ticket } from '@/types';
import { createUnassignedTicketColumns } from './utils/queueTableColumns';

export default function UnassignedTicketsTable() {
  const { tickets, loading, error } = useTickets({ status: 'open' });
  const { technicians } = useTechnicians();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter only unassigned tickets
  const unassignedTickets = tickets?.filter((ticket: Ticket) => !ticket.assigned_to) || [];

  const handleOpenAssignDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDialogOpen(true);
  };

  const handleAssignTicket = async () => {
    if (!selectedTicket || !selectedTechnician) return;
    
    setIsAssigning(true);
    try {
      // TODO: Implement ticket assignment API call
      console.log('Assigning ticket', selectedTicket.id, 'to technician', selectedTechnician);
      // await ticketsService.assignTicket(selectedTicket.id, { assigned_to: selectedTechnician });
      
      // Close dialog and reset
      setIsDialogOpen(false);
      setSelectedTicket(null);
      setSelectedTechnician('');
    } catch (error) {
      console.error('Failed to assign ticket:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const getFullName = (tech: any) => {
    if (tech.first_name || tech.last_name) {
      return `${tech.first_name || ''} ${tech.last_name || ''}`.trim();
    }
    return tech.username;
  };

  // Use shared column definitions from utilities
  const columns = createUnassignedTicketColumns({
    onAssign: handleOpenAssignDialog,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>Failed to load unassigned tickets</span>
      </div>
    );
  }

  return (
    <>
      {/* Summary Banner */}
      {unassignedTickets.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg my-4">
          <div className="flex items-center gap-3">
            <Inbox className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-lg font-semibold text-blue-900">
                {unassignedTickets.length} Unassigned {unassignedTickets.length === 1 ? 'Ticket' : 'Tickets'}
              </div>
              <div className="text-sm text-blue-700">
                Assign these tickets to available technicians
              </div>
            </div>
          </div>
        </div>
      )}

      <DataTable
        variant="admin"
        title='Unassigned Tickets'
        subtitle='Tickets that have not been assigned yet.'
        columns={columns}
        data={unassignedTickets}
        loading={loading}
        emptyStateMessage="No Unassigned Tickets"
        emptyStateDescription="All tickets have been assigned to technicians! 👍"
        defaultPageSize={10}
      />

      {/* Assignment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
            <DialogDescription>
              Assign ticket {selectedTicket?.ticket_no} to a technician
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium mb-2">Ticket Details:</p>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Title:</strong> {selectedTicket?.title}</p>
                <p><strong>Section:</strong> {selectedTicket?.section || 'N/A'}</p>
                <p><strong>Facility:</strong> {selectedTicket?.facility || 'N/A'}</p>
              </div>
            </div>
            <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
              <SelectTrigger>
                <SelectValue placeholder="Select technician..." />
              </SelectTrigger>
              <SelectContent>
                {technicians?.map((tech: any) => (
                  <SelectItem key={tech.id} value={tech.id.toString()}>
                    {getFullName(tech)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleAssignTicket}
                disabled={!selectedTechnician || isAssigning}
              >
                {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
