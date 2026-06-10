import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LocationFormProps {
  values: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}

export function EquipmentForm({ values, onChange }: LocationFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Asset Name *</Label>
        <Input value={values.asset_name ?? ''} onChange={e => onChange({ ...values, asset_name: e.target.value })} placeholder="e.g. HP LaserJet 4015" />
      </div>
      <div>
        <Label>Asset ID</Label>
        <Input value={values.asset_id ?? ''} onChange={e => onChange({ ...values, asset_id: e.target.value })} placeholder="e.g. ICT-PR-0042" />
      </div>
      <div>
        <Label>Description</Label>
        <Input value={values.description ?? ''} onChange={e => onChange({ ...values, description: e.target.value })} placeholder="Brief description of the issue" />
      </div>
    </div>
  );
}
