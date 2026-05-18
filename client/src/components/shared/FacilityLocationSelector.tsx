import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFacilities } from '@/hooks/useFacilities';
import type { LocationSelection } from '@/types';

type LocationType = 'building' | 'office_block' | 'residential' | '';

interface FacilityLocationSelectorProps {
  campusId: number;
  value?: LocationSelection;
  onChange: (selection: LocationSelection) => void;
  disabled?: boolean;
}

export function FacilityLocationSelector({
  campusId,
  value,
  onChange,
  disabled = false,
}: FacilityLocationSelectorProps) {
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities(campusId);

  const [locationType, setLocationType] = useState<LocationType>('');
  const [roomNo, setRoomNo] = useState('');
  const [floor, setFloor] = useState('');
  const [office, setOffice] = useState('');
  const [officeNo, setOfficeNo] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [tenantName, setTenantName] = useState('');

  // Build location_detail string from sub-fields and push to parent
  useEffect(() => {
    let detail = '';
    if (locationType === 'building') {
      if (roomNo) detail = `Room ${roomNo}`;
    } else if (locationType === 'office_block') {
      const parts = [floor && `Floor ${floor}`, office && `Office ${office}`, officeNo && `No. ${officeNo}`].filter(Boolean);
      detail = parts.join(', ');
    } else if (locationType === 'residential') {
      const parts = [houseNo && `House No. ${houseNo}`, tenantName && `Tenant: ${tenantName}`].filter(Boolean);
      detail = parts.join(', ');
    }
    onChange({
      facility: value?.facility ?? null,
      floor: null,
      room: null,
      location_detail: detail,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationType, roomNo, floor, office, officeNo, houseNo, tenantName]);

  function handleFacilityChange(val: string) {
    onChange({
      facility: val === '__none__' ? null : Number(val),
      floor: null,
      room: null,
      location_detail: value?.location_detail ?? '',
    });
  }

  function handleTypeChange(val: string) {
    setLocationType(val as LocationType);
    setRoomNo(''); setFloor(''); setOffice(''); setOfficeNo('');
    setHouseNo(''); setTenantName('');
  }

  const facilitySelectValue = value?.facility != null ? String(value.facility) : '__none__';

  return (
    <div className="space-y-3">
      {/* Facility dropdown */}
      <div className="space-y-1">
        <Label>Facility <span className="text-xs text-muted-foreground">(building / location)</span></Label>
        <Select
          value={facilitySelectValue}
          onValueChange={handleFacilityChange}
          disabled={disabled || facilitiesLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={facilitiesLoading ? 'Loading...' : 'Select facility'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Not specified</SelectItem>
            {facilities.map(f => (
              <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location type */}
      <div className="space-y-1">
        <Label>Location Type</Label>
        <Select value={locationType} onValueChange={handleTypeChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Select location type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="building">Building</SelectItem>
            <SelectItem value="office_block">Office Block</SelectItem>
            <SelectItem value="residential">Residential</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Building → Room No */}
      {locationType === 'building' && (
        <div className="space-y-1">
          <Label>Room Number</Label>
          <Input
            value={roomNo}
            onChange={e => setRoomNo(e.target.value)}
            placeholder="e.g. 204, Lab A"
            disabled={disabled}
          />
        </div>
      )}

      {/* Office Block → Floor / Office / Office No */}
      {locationType === 'office_block' && (
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label>Floor</Label>
            <Input value={floor} onChange={e => setFloor(e.target.value)} placeholder="e.g. 3rd" disabled={disabled} />
          </div>
          <div className="space-y-1">
            <Label>Office</Label>
            <Input value={office} onChange={e => setOffice(e.target.value)} placeholder="e.g. Finance" disabled={disabled} />
          </div>
          <div className="space-y-1">
            <Label>Office No.</Label>
            <Input value={officeNo} onChange={e => setOfficeNo(e.target.value)} placeholder="e.g. 301" disabled={disabled} />
          </div>
        </div>
      )}

      {/* Residential → House No / Tenant Name */}
      {locationType === 'residential' && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label>House No.</Label>
            <Input value={houseNo} onChange={e => setHouseNo(e.target.value)} placeholder="e.g. A-12" disabled={disabled} />
          </div>
          <div className="space-y-1">
            <Label>Tenant Name</Label>
            <Input value={tenantName} onChange={e => setTenantName(e.target.value)} placeholder="Optional" disabled={disabled} />
          </div>
        </div>
      )}

      {/* Summary */}
      {value?.location_detail && (
        <p className="text-xs text-muted-foreground bg-muted/40 rounded px-2 py-1">
          📍 {value.location_detail}
        </p>
      )}
    </div>
  );
}
