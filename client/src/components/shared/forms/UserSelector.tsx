import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

interface UserSelectorProps {
  value: number | null;
  onChange: (id: number | null) => void;
  placeholder?: string;
  roleFilter?: string;
  disabled?: boolean;
  className?: string;
  /** External user list — required since /users/ endpoint doesn't exist */
  users?: User[];
  /** Loading state for external user list */
  loading?: boolean;
}

function getInitials(user: User): string {
  const first = user.first_name?.[0] ?? '';
  const last = user.last_name?.[0] ?? '';
  return (first + last).toUpperCase() || user.username.slice(0, 2).toUpperCase();
}

function fullName(user: User): string {
  const name = `${user.first_name} ${user.last_name}`.trim();
  return name || user.username;
}

const ROLE_LABELS: Record<string, string> = {
  user: 'User',
  technician: 'Technician',
  hos: 'Head of Section',
  hod: 'HOD',
  manager: 'Manager',
  admin: 'Admin',
};

export function UserSelector({
  value,
  onChange,
  placeholder = 'Select user...',
  roleFilter: _roleFilter,
  disabled,
  className,
  users = [],
  loading = false,
}: UserSelectorProps) {
  const [open, setOpen] = useState(false);

  const selected = value !== null ? users.find((u) => u.id === value) ?? null : null;

  function handleSelect(userId: number) {
    onChange(userId === value ? null : userId);
    setOpen(false);
  }

  function handleClear() {
    onChange(null);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between font-normal', className)}
        >
          {selected ? (
            <span className="flex items-center gap-2 truncate">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                {getInitials(selected)}
              </span>
              <span className="truncate">{fullName(selected)}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandList>
            {loading ? (
              <div className="space-y-1 p-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2.5 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <CommandEmpty>No users found.</CommandEmpty>
                {value !== null && (
                  <>
                    <CommandGroup>
                      <CommandItem onSelect={handleClear} className="text-muted-foreground">
                        <X className="mr-2" />
                        Clear selection
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={`${fullName(user)} ${user.username} ${user.email}`}
                      onSelect={() => handleSelect(user.id)}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                        {getInitials(user)}
                      </span>
                      <span className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                        <span className="truncate text-sm">{fullName(user)}</span>
                        <Badge variant="secondary" className="w-fit text-[10px] px-1 py-0 h-auto">
                          {ROLE_LABELS[user.role] ?? user.role}
                        </Badge>
                      </span>
                      {value === user.id && <Check className="ml-auto shrink-0" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
