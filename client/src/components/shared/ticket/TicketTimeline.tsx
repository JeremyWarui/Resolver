// TicketTimeline — vertical event list for the ticket detail page.
// Receives events from the API; renders an icon per event type.
// Events are always in ascending chronological order (oldest first).

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus, UserCheck, RefreshCw, Clock, CheckCircle2,
  XCircle, RotateCcw, Star, MessageSquare, AlertCircle, TrendingUp,
} from 'lucide-react';
import { formatDate } from '@/utils/date';

export type TimelineEventType =
  | 'created'
  | 'assigned'
  | 'reassigned'
  | 'status_changed'
  | 'comment'
  | 'comment_added'
  | 'escalated'
  | 'pending'
  | 'resolved'
  | 'closed'
  | 'reopened'
  | 'rated'
  | 'priority_changed'
  | 'sla_breach';

export interface TimelineEvent {
  id: number | string;
  event_type: TimelineEventType;
  actor?: { id: number; username: string; full_name: string };
  note?: string;
  data?: Record<string, unknown>;
  created_at: string;
}

interface TicketTimelineProps {
  events: TimelineEvent[];
  loading?: boolean;
  className?: string;
  hideHeader?: boolean;
  userRole?: string;
}

const EVENT_ICON: Record<TimelineEventType, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  created:         Plus,
  assigned:        UserCheck,
  reassigned:      RefreshCw,
  status_changed:  RefreshCw,
  comment:         MessageSquare,
  comment_added:   MessageSquare,
  escalated:       AlertCircle,
  pending:         Clock,
  resolved:        CheckCircle2,
  closed:          XCircle,
  reopened:        RotateCcw,
  rated:           Star,
  priority_changed: TrendingUp,
  sla_breach:      AlertCircle,
};

const EVENT_LABEL: Record<TimelineEventType, string> = {
  created:         'Ticket created',
  assigned:        'Assigned',
  reassigned:      'Reassigned',
  status_changed:  'Status updated',
  comment:         'Comment added',
  comment_added:   'Comment added',
  escalated:       'Escalated',
  pending:         'Marked pending',
  resolved:        'Resolved',
  closed:          'Closed',
  reopened:        'Reopened',
  rated:           'Rated',
  priority_changed: 'Priority changed',
  sla_breach:      'SLA breached',
};

const EVENT_CSS_VAR: Record<TimelineEventType, string> = {
  created:         'var(--status-assigned)',
  assigned:        'var(--status-assigned)',
  reassigned:      'var(--status-progress)',
  status_changed:  'var(--status-progress)',
  comment:         'var(--status-open)',
  comment_added:   'var(--status-open)',
  escalated:       'var(--status-escalated)',
  pending:         'var(--status-pending)',
  resolved:        'var(--status-resolved)',
  closed:          'var(--status-closed)',
  reopened:        'var(--status-progress)',
  rated:           'var(--status-resolved)',
  priority_changed: 'var(--status-progress)',
  sla_breach:      'var(--status-escalated)',
};

function TimelineItem({ event, isLast, viewerRole }: { event: TimelineEvent; isLast: boolean; viewerRole?: string }) {
  const Icon = EVENT_ICON[event.event_type] ?? RefreshCw;
  const color = EVENT_CSS_VAR[event.event_type] ?? 'var(--status-closed)';
  const actorName = event.actor?.full_name ?? event.actor?.username ?? '';
  const statusTo =
    (event.event_type === 'status_changed' || event.event_type === 'comment_added') && event.data?.to
      ? String(event.data.to).replace(/_/g, ' ')
      : null;
  const isInternal = event.data?.visibility === 'internal';

  return (
    <div className={cn('flex gap-3', isInternal && 'opacity-90')}>
      {/* Icon + connector */}
      <div className="flex flex-col items-center">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-full border-2 shrink-0"
          style={{
            borderColor: `color-mix(in oklch, ${color} 35%, white)`,
            backgroundColor: `color-mix(in oklch, ${color} 10%, white)`,
          }}
        >
          <Icon
            className="h-3.5 w-3.5"
            style={{ color: `color-mix(in oklch, ${color} 70%, oklch(0.15 0 0))` }}
          />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
      </div>

      {/* Content */}
      <div className={cn('pb-5 min-w-0 flex-1', isLast && 'pb-0')}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-medium leading-snug">
            {EVENT_LABEL[event.event_type]}
            {statusTo && (
              <span className="font-normal text-muted-foreground"> → {statusTo}</span>
            )}
          </p>
          {/* Internal badge — visible to staff only */}
          {isInternal && viewerRole !== 'user' && (
            <span className="text-[10px] font-medium text-amber-700 bg-amber-100 border border-amber-200 rounded px-1.5 py-px">
              Internal
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {actorName && <span>{actorName}</span>}
          {actorName && <span className="mx-1">·</span>}
          <span>{formatDate(event.created_at)}</span>
        </p>
        {event.note && (
          <div className={cn(
            'mt-2 rounded-md border px-3 py-2 text-sm leading-relaxed text-muted-foreground',
            isInternal ? 'bg-amber-50/60 border-amber-200' : 'bg-muted/50',
          )}>
            {event.note}
          </div>
        )}
      </div>
    </div>
  );
}

export function TicketTimeline({ events, loading = false, className, hideHeader = false, userRole }: TicketTimelineProps) {
  const visibleEvents = userRole === 'user'
    ? events.filter((e) => e.data?.visibility !== 'internal')
    : events;
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {!hideHeader && <h3 className="text-sm font-semibold">Activity</h3>}
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-7 h-7 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visibleEvents.length === 0) {
    return (
      <div className={cn('text-center py-6 text-muted-foreground', className)}>
        <p className="text-sm">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-0', className)}>
      {!hideHeader && <h3 className="text-sm font-semibold mb-4">Activity</h3>}
      {visibleEvents.map((event, idx) => (
        <TimelineItem
          key={event.id}
          event={event}
          isLast={idx === visibleEvents.length - 1}
          viewerRole={userRole}
        />
      ))}
    </div>
  );
}
