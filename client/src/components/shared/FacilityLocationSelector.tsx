import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFacilities } from '@/hooks/useFacilities';
import { useFacilityFloors } from '@/hooks/useFacilityFloors';
import { useFacilityRooms } from '@/hooks/useFacilityRooms';
import type { LocationSelection } from '@/types';

const OTHER_VALUE = '__other__';

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
  const { data: facilities, isLoading: facilitiesLoading } =
    useFacilities(campusId);

  const selectedFacilityId = value?.facility ?? null;
  const selectedFloorId = value?.floor ?? null;
  const selectedRoomId = value?.room ?? null;

  const { data: floors, isLoading: floorsLoading } =
    useFacilityFloors(selectedFacilityId);
  const { data: rooms, isLoading: roomsLoading } =
    useFacilityRooms(selectedFloorId);

  const [showLocationDetail, setShowLocationDetail] = useState(false);

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId);
  const selectedFloor = floors.find((f) => f.id === selectedFloorId);
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  // Determine if the facility has floors
  const facilityHasFloors =
    selectedFacility != null &&
    (selectedFacility.floors_count == null ||
      selectedFacility.floors_count > 0);

  // Show the location detail input if any level is "other" or the selected
  // facility has no floors so the user can describe the location directly.
  useEffect(() => {
    const facilityOther =
      value?.facility === null && value?.location_detail !== '';
    const floorIsOther =
      selectedFloorId === null &&
      selectedFacilityId !== null &&
      facilityHasFloors;
    const roomIsOther = selectedRoomId === null && selectedFloorId !== null;
    const noFloorsSelected = selectedFacilityId !== null && !facilityHasFloors;
    setShowLocationDetail(
      facilityOther || floorIsOther || roomIsOther || noFloorsSelected
    );
  }, [
    value,
    selectedFacilityId,
    selectedFloorId,
    selectedRoomId,
    facilityHasFloors,
  ]);

  // Build breadcrumb string
  const breadcrumbParts: string[] = [];
  if (selectedFacility) breadcrumbParts.push(selectedFacility.name);
  else if (selectedFacilityId === null && value?.location_detail)
    breadcrumbParts.push('Other');
  if (selectedFloor) breadcrumbParts.push(selectedFloor.name);
  else if (
    selectedFloorId === null &&
    selectedFacilityId !== null &&
    facilityHasFloors
  )
    breadcrumbParts.push('Other');
  if (selectedRoom) breadcrumbParts.push(selectedRoom.name);
  else if (selectedRoomId === null && selectedFloorId !== null)
    breadcrumbParts.push('Other');
  const breadcrumb = breadcrumbParts.join(' → ');

  function handleFacilityChange(val: string) {
    if (val === OTHER_VALUE) {
      onChange({
        facility: null,
        floor: null,
        room: null,
        location_detail: value?.location_detail ?? '',
      });
      setShowLocationDetail(true);
    } else {
      const id = Number(val);
      onChange({ facility: id, floor: null, room: null, location_detail: '' });
      setShowLocationDetail(false);
    }
  }

  function handleFloorChange(val: string) {
    if (val === OTHER_VALUE) {
      onChange({
        facility: selectedFacilityId,
        floor: null,
        room: null,
        location_detail: value?.location_detail ?? '',
      });
      setShowLocationDetail(true);
    } else {
      const id = Number(val);
      onChange({
        facility: selectedFacilityId,
        floor: id,
        room: null,
        location_detail: '',
      });
      setShowLocationDetail(false);
    }
  }

  function handleRoomChange(val: string) {
    if (val === OTHER_VALUE) {
      onChange({
        facility: selectedFacilityId,
        floor: selectedFloorId,
        room: null,
        location_detail: value?.location_detail ?? '',
      });
      setShowLocationDetail(true);
    } else {
      const id = Number(val);
      onChange({
        facility: selectedFacilityId,
        floor: selectedFloorId,
        room: id,
        location_detail: '',
      });
      setShowLocationDetail(false);
    }
  }

  function handleLocationDetailChange(detail: string) {
    onChange({
      facility: value?.facility ?? null,
      floor: value?.floor ?? null,
      room: value?.room ?? null,
      location_detail: detail,
    });
  }

  // Derive Select value strings (undefined = nothing selected yet)
  const facilitySelectValue =
    selectedFacilityId != null
      ? String(selectedFacilityId)
      : value && value.facility === null && value.location_detail !== undefined
        ? OTHER_VALUE
        : undefined;

  const floorSelectValue =
    selectedFloorId != null
      ? String(selectedFloorId)
      : selectedFacilityId !== null &&
          value &&
          value.floor === null &&
          value.location_detail !== undefined
        ? OTHER_VALUE
        : undefined;

  const roomSelectValue =
    selectedRoomId != null
      ? String(selectedRoomId)
      : selectedFloorId !== null &&
          value &&
          value.room === null &&
          value.location_detail !== undefined
        ? OTHER_VALUE
        : undefined;

  return (
    <div className='space-y-3'>
      {/* Facility */}
      <div className='space-y-1'>
        <Label>Facility</Label>
        <Select
          value={facilitySelectValue}
          onValueChange={handleFacilityChange}
          disabled={disabled || facilitiesLoading}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                facilitiesLoading ? 'Loading...' : 'Select a facility'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {facilities.map((facility) => (
              <SelectItem key={facility.id} value={String(facility.id)}>
                {facility.name}
              </SelectItem>
            ))}
            <SelectItem value={OTHER_VALUE}>Other / Not Listed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Floor — only shown if facility selected and has floors */}
      {selectedFacilityId !== null && facilityHasFloors && (
        <div className='space-y-1'>
          <Label>Floor</Label>
          <Select
            value={floorSelectValue}
            onValueChange={handleFloorChange}
            disabled={disabled || floorsLoading || selectedFacilityId === null}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={floorsLoading ? 'Loading...' : 'Select a floor'}
              />
            </SelectTrigger>
            <SelectContent>
              {floors.map((floor) => (
                <SelectItem key={floor.id} value={String(floor.id)}>
                  {floor.name}
                </SelectItem>
              ))}
              <SelectItem value={OTHER_VALUE}>Other / Not Listed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Room — only shown if floor selected */}
      {selectedFloorId !== null && (
        <div className='space-y-1'>
          <Label>Room</Label>
          <Select
            value={roomSelectValue}
            onValueChange={handleRoomChange}
            disabled={disabled || roomsLoading || selectedFloorId === null}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={roomsLoading ? 'Loading...' : 'Select a room'}
              />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={String(room.id)}>
                  {room.name}
                  {room.code ? ` (${room.code})` : ''}
                </SelectItem>
              ))}
              <SelectItem value={OTHER_VALUE}>Other / Not Listed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Location detail — shown when "Other / Not Listed" chosen at any level */}
      {showLocationDetail && (
        <div className='space-y-1'>
          <Label>Location Detail</Label>
          <Input
            placeholder='Describe the specific location'
            value={value?.location_detail ?? ''}
            onChange={(e) => handleLocationDetailChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      )}

      {/* Breadcrumb */}
      {breadcrumb && (
        <p className='text-sm text-muted-foreground'>{breadcrumb}</p>
      )}
    </div>
  );
}
