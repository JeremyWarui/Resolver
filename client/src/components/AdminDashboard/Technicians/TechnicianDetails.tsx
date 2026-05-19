import { UnifiedDetailsSheet } from '@/components/Common/UnifiedDetailsSheet';
import type { Technician } from '@/types';

interface TechnicianDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  technician: Technician | null;
  onUpdated?: () => void;
}

export default function TechnicianDetails({ isOpen, onOpenChange, technician, onUpdated }: TechnicianDetailsProps) {
  return (
    <UnifiedDetailsSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      entity={technician}
      entityType="technician"
      onUpdated={onUpdated}
    />
  );
}
