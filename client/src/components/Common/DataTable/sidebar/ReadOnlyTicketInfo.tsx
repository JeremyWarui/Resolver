import type { Ticket } from "@/types";

interface ReadOnlyTicketInfoProps {
  ticket: Ticket;
  showDescription?: boolean;
  showTitle?: boolean;
  showFacility?: boolean;
  showSection?: boolean;
}

/**
 * Displays read-only ticket information in a consistent, compact grid format.
 * Used in edit modes to show contextual info while editing other fields.
 */
export function ReadOnlyTicketInfo({
  ticket,
  showDescription = false,
  showTitle = false,
  showFacility = true,
  showSection = true,
}: ReadOnlyTicketInfoProps) {
  return (
    <>
      {/* Description Section */}
      {showDescription && (
        <div className="mb-4">
          <div className="bg-gray-50 rounded-lg p-3 border">
            <p className="text-xs font-medium text-gray-500 mb-2">Description</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>
          </div>
        </div>
      )}

      {/* Compact Grid Layout */}
      <div className="bg-white border rounded-lg divide-y">
        {showTitle && (
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Title</span>
            <span className="text-sm text-gray-900">{ticket.title}</span>
          </div>
        )}
        {showFacility && (
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Facility</span>
            <span className="text-sm text-gray-900">{ticket.facility}</span>
          </div>
        )}
        {showSection && (
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Section</span>
            <span className="text-sm text-gray-900">{ticket.section}</span>
          </div>
        )}
      </div>
    </>
  );
}
