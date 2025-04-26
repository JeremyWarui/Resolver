import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlayCircle,
  CheckCircle,
  Clock,
  ChevronDown,
} from "lucide-react";

interface TableActionButtonsProps {
  status: string;
  ticketId: number;
  ticketNo?: string;
  onBeginWork?: (ticketId: number, ticketNo: string | undefined, event: React.MouseEvent) => void;
  onUpdateStatus?: (ticketId: number, status: string, event: React.MouseEvent) => void;
  onReopen?: (ticketId: number, event: React.MouseEvent) => void;
}

/**
 * Reusable action buttons for ticket tables with different states
 */
const TableActionButtons = ({
  status,
  ticketId,
  ticketNo = '',
  onBeginWork,
  onUpdateStatus,
  onReopen
}: TableActionButtonsProps) => {
  
  const handleClick = (callback?: Function, ...args: any[]) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click events
    if (callback) callback(...args, e);
  };
  
  // Return different buttons based on ticket status
  switch (status.toLowerCase()) {
    case 'open':
      return (
        <Button
          variant="default"
          size="sm"
          onClick={handleClick(onBeginWork, ticketId, ticketNo)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          Begin Work
        </Button>
      );
      
    case 'in progress':
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
            >
              Update Status
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem 
              onClick={handleClick(onUpdateStatus, ticketId, "resolved")}
              className="cursor-pointer flex items-center text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Resolved
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleClick(onUpdateStatus, ticketId, "pending")}
              className="cursor-pointer flex items-center text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            >
              <Clock className="mr-2 h-4 w-4" />
              Pending
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
      
    case 'pending':
      return (
        <Button
          variant="default"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleClick(onReopen, ticketId)}
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          Resume
        </Button>
      );
      
    case 'resolved':
      return (
        <div className="flex items-center">
          <span className="text-sm text-green-600 font-medium flex items-center">
            <CheckCircle className="mr-2 h-4 w-4" />
            Completed
          </span>
        </div>
      );
      
    default:
      return null;
  }
};

export default TableActionButtons;