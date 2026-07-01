import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LocationFormProps {
  values: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}

export function ResidentialForm({ values, onChange }: LocationFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Unit Number *</Label>
        <Input value={values.unit_number ?? ''} onChange={e => onChange({ ...values, unit_number: e.target.value })} placeholder="e.g. A12" />
      </div>
      <div>
        <Label>Tenant Name</Label>
        <Input value={values.tenant_name ?? ''} onChange={e => onChange({ ...values, tenant_name: e.target.value })} placeholder="Optional" />
      </div>
    </div>
  );
}
