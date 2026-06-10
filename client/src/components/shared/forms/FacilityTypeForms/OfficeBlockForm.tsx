import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LocationFormProps {
  values: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  facilities?: { id: number; name: string; code: string }[];
  selectedFacilityId?: number | null;
  onFacilityChange?: (id: number | null) => void;
}

export function OfficeBlockForm({ values, onChange, facilities = [], selectedFacilityId, onFacilityChange }: LocationFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Building *</Label>
        <Select
          value={selectedFacilityId ? String(selectedFacilityId) : ''}
          onValueChange={v => onFacilityChange?.(v ? Number(v) : null)}
        >
          <SelectTrigger><SelectValue placeholder="Select building" /></SelectTrigger>
          <SelectContent>
            {facilities.map(f => (
              <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Floor *</Label>
        <Input value={values.floor ?? ''} onChange={e => onChange({ ...values, floor: e.target.value })} placeholder="e.g. 2" />
      </div>
      <div>
        <Label>Room *</Label>
        <Input value={values.room ?? ''} onChange={e => onChange({ ...values, room: e.target.value })} placeholder="e.g. 201" />
      </div>
      <div>
        <Label>Area</Label>
        <Input value={values.area ?? ''} onChange={e => onChange({ ...values, area: e.target.value })} placeholder="e.g. Reception" />
      </div>
    </div>
  );
}
