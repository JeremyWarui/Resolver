import { useState } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileTickets } from './useMobileTickets';
import type { Ticket } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  open:        { label: 'Open',        color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  assigned:    { label: 'Assigned',    color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  pending:     { label: 'On Hold',     color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  resolved:    { label: 'Resolved',    color: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
  closed:      { label: 'Closed',      color: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400' },
};

const PRIORITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-500',
  medium:   'bg-yellow-400',
  low:      'bg-green-400',
};

const FILTERS = [
  { key: 'all',         label: 'All' },
  { key: 'assigned',    label: 'Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'pending',     label: 'On Hold' },
  { key: 'resolved',    label: 'Resolved' },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  onSelect: (ticket: Ticket) => void;
  isOnline: boolean;
}

export function MobileTicketList({ onSelect, isOnline }: Props) {
  const [filter, setFilter] = useState('all');
  const { data: tickets = [], isLoading, refetch, isFetching } = useMobileTickets();

  const filtered = filter === 'all'
    ? tickets
    : tickets.filter(t => {
        if (filter === 'assigned') return t.status === 'assigned' || t.status === 'open';
        return t.status === filter;
      });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Offline banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 bg-orange-50 border-b border-orange-200 px-4 py-2">
          <WifiOff className="h-3.5 w-3.5 text-orange-500 shrink-0" />
          <span className="text-xs text-orange-700">Offline — showing cached tickets</span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 px-3 pt-3 pb-2 overflow-x-auto shrink-0 scrollbar-none">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              filter === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-white border border-border text-muted-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Ticket count + refresh */}
      <div className="flex items-center justify-between px-4 pb-2 shrink-0">
        <span className="text-xs text-muted-foreground">
          {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => refetch()}
          disabled={isFetching || !isOnline}
          className="flex items-center gap-1 text-xs text-muted-foreground disabled:opacity-40"
        >
          <RefreshCw className={cn('h-3 w-3', isFetching && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white border border-border animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Wifi className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No tickets</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {filter === 'all' ? 'No tickets assigned to you' : `No ${filter.replace('_', ' ')} tickets`}
            </p>
          </div>
        ) : (
          filtered.map(ticket => {
            const st = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
            const priorityName = (ticket.priority as unknown as { name?: string })?.name?.toLowerCase() ?? '';
            const priorityDot = PRIORITY_DOT[priorityName] ?? '';

            return (
              <button
                key={ticket.id}
                onClick={() => onSelect(ticket)}
                className="w-full text-left bg-white rounded-xl border border-border p-4 shadow-sm active:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {priorityDot && (
                      <span className={cn('h-2 w-2 rounded-full shrink-0 mt-0.5', priorityDot)} />
                    )}
                    <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                      {ticket.ticket_no}
                    </span>
                  </div>
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0', st.color)}>
                    {st.label}
                  </span>
                </div>

                <p className="text-sm font-medium text-foreground line-clamp-2 mb-2 leading-snug">
                  {ticket.service_item?.name ?? ticket.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="truncate">{ticket.section?.name ?? '—'}</span>
                  <span className="shrink-0 ml-2">{timeAgo(ticket.created_at)}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
