import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LocationFormProps {
  values: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}

export function GroundsForm({ values, onChange }: LocationFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Zone *</Label>
        <Input value={values.zone ?? ''} onChange={e => onChange({ ...values, zone: e.target.value })} placeholder="e.g. Sports field, North perimeter" />
      </div>
      <div>
        <Label>Landmark</Label>
        <Input value={values.landmark ?? ''} onChange={e => onChange({ ...values, landmark: e.target.value })} placeholder="e.g. Near main gate" />
      </div>
    </div>
  );
}
