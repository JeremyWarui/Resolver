// TicketTimeline — vertical event list for the ticket detail page.
// Layout: solid filled circle (event-type color) | content | date+time (right).
// Events sorted ascending (oldest → newest).

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Check, UserCheck, RefreshCw, Clock,
  XCircle, RotateCcw, Star, MessageSquare, AlertTriangle,
  TrendingUp, Activity, Plus,
} from 'lucide-react';

export type TimelineEventType =
  | 'created' | 'assigned' | 'reassigned' | 'status_changed'
  | 'comment' | 'comment_added' | 'escalated' | 'pending'
  | 'resolved' | 'closed' | 'reopened' | 'rated'
  | 'priority_changed' | 'sla_breach';

export interface TimelineEvent {
  id: number | string;
  event_type: TimelineEventType;
  actor?: { id: number; username: string; full_name?: string | null };
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatEventDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
  };
}

function actorName(actor?: { full_name?: string | null; username: string }): string {
  if (!actor) return 'System';
  return (actor.full_name ?? '').trim() || actor.username;
}

function levelLabel(level: string): string {
  if (level === 'hod') return 'Department Head';
  if (level === 'hos') return 'Section Head';
  return 'Technician';
}

// ── Event config ──────────────────────────────────────────────────────────────

type EventConfig = {
  Icon: React.ComponentType<{ className?: string }>;
  /** CSS variable name from index.css, e.g. "--status-resolved" */
  colorVar: string;
  label: string;
};

const EVENT_CONFIG: Record<TimelineEventType, EventConfig> = {
  created:          { Icon: Plus,          colorVar: '--status-assigned',  label: 'Ticket opened'    },
  assigned:         { Icon: UserCheck,     colorVar: '--status-assigned',  label: 'Assigned'         },
  reassigned:       { Icon: RefreshCw,     colorVar: '--status-assigned',  label: 'Reassigned'       },
  status_changed:   { Icon: RefreshCw,     colorVar: '--status-progress',  label: 'Status changed'   },
  comment:          { Icon: MessageSquare, colorVar: '--status-assigned',  label: 'Comment'          },
  comment_added:    { Icon: MessageSquare, colorVar: '--status-assigned',  label: 'Comment'          },
  escalated:        { Icon: AlertTriangle, colorVar: '--status-escalated', label: 'Escalated'        },
  pending:          { Icon: Clock,         colorVar: '--status-pending',   label: 'Paused'           },
  resolved:         { Icon: Check,         colorVar: '--status-resolved',  label: 'Resolved'         },
  closed:           { Icon: XCircle,       colorVar: '--status-closed',    label: 'Closed'           },
  reopened:         { Icon: RotateCcw,     colorVar: '--status-assigned',  label: 'Reopened'         },
  rated:            { Icon: Star,          colorVar: '--status-resolved',  label: 'Rated'            },
  priority_changed: { Icon: TrendingUp,    colorVar: '--status-progress',  label: 'Priority changed' },
  sla_breach:       { Icon: AlertTriangle, colorVar: '--status-escalated', label: 'SLA breached'     },
};

// ── Sub-description (the muted line under the title) ─────────────────────────

function buildSubtext(event: TimelineEvent): string {
  const { event_type, data, actor, note } = event;
  const name = actorName(actor);

  switch (event_type) {
    case 'status_changed':
      return `By ${name}`;
    case 'escalated': {
      const from = data?.from as string | undefined;
      const to   = data?.to   as string | undefined;
      const lu   = data?.level_user as { full_name?: string | null; username?: string } | undefined;
      const luName = lu ? ((lu.full_name ?? '').trim() || lu.username || '') : '';
      const levels = from && to ? `${levelLabel(from)} → ${levelLabel(to)}` : '';
      return [levels, luName ? `now with ${luName}` : ''].filter(Boolean).join(' · ');
    }
    case 'pending':
      return note ? `${name} · "${note}"` : name;
    case 'assigned':
    case 'reassigned':
      return `By ${name}`;
    case 'resolved':
    case 'closed':
      return `By ${name}`;
    case 'created':
      return `By ${name}`;
    case 'rated': {
      const rating = Number(data?.to ?? 0);
      return `${name} · ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;
    }
    case 'comment':
    case 'comment_added':
      return name;
    default:
      return name;
  }
}

// ── DateColumn ────────────────────────────────────────────────────────────────

function DateColumn({ iso }: { iso: string }) {
  const { date, time } = formatEventDate(iso);
  return (
    <div className="text-right shrink-0 min-w-[100px] pl-4">
      <p className="text-xs font-medium text-foreground/70 leading-snug">{date}</p>
      <p className="text-xs text-muted-foreground leading-snug">{time}</p>
    </div>
  );
}

// ── EventDot ──────────────────────────────────────────────────────────────────

function EventDot({
  event_type,
  isLast,
}: {
  event_type: TimelineEventType;
  isLast: boolean;
}) {
  const cfg = EVENT_CONFIG[event_type] ?? EVENT_CONFIG.status_changed;
  const { Icon, colorVar } = cfg;

  return (
    <div className="flex flex-col items-center shrink-0" style={{ width: 32 }}>
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
        style={{ backgroundColor: `var(${colorVar})` }}
      >
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      {!isLast && (
        <div
          className="w-px flex-1 mt-1"
          style={{ backgroundColor: `color-mix(in srgb, var(${colorVar}) 25%, #e5e7eb)` }}
        />
      )}
    </div>
  );
}

// ── Comment card ──────────────────────────────────────────────────────────────

function CommentCard({ event, isLast, viewerRole }: { event: TimelineEvent; isLast: boolean; viewerRole?: string }) {
  const isInternal = event.data?.visibility === 'internal';
  if (isInternal && viewerRole === 'user') return null;

  const name = actorName(event.actor);

  return (
    <div className="flex gap-3">
      <EventDot event_type="comment" isLast={isLast} />

      <div className={cn('flex-1 min-w-0', isLast ? 'pb-0' : 'pb-5')}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug">
              {isInternal ? 'Internal note' : 'Comment'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{name}</p>
          </div>
          <DateColumn iso={event.created_at} />
        </div>
        {event.note && (
          <div
            className={cn(
              'mt-2.5 rounded-lg border px-3.5 py-2.5 text-sm leading-relaxed text-foreground/80',
              isInternal
                ? 'border-l-[3px] bg-amber-50/70 border-amber-200 border-l-amber-400'
                : 'bg-muted/40 border-border/60',
            )}
          >
            {event.note}
          </div>
        )}
      </div>
    </div>
  );
}

// ── System event row ──────────────────────────────────────────────────────────

function SystemEventRow({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const cfg = EVENT_CONFIG[event.event_type] ?? EVENT_CONFIG.status_changed;
  const subtext = buildSubtext(event);

  return (
    <div className="flex gap-3">
      <EventDot event_type={event.event_type} isLast={isLast} />

      <div className={cn('flex-1 min-w-0', isLast ? 'pb-0' : 'pb-5')}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug">{cfg.label}</p>
            {subtext && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{subtext}</p>
            )}
          </div>
          <DateColumn iso={event.created_at} />
        </div>
        {event.note && event.event_type !== 'pending' && event.event_type !== 'rated' && (
          <div className="mt-2.5 rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm text-muted-foreground leading-relaxed">
            {event.note}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Date separator ────────────────────────────────────────────────────────────

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-border/50" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (+eventDay === +today) return 'Today';
  if (+eventDay === +yesterday) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

// ── Main component ────────────────────────────────────────────────────────────

export function TicketTimeline({
  events,
  loading = false,
  className,
  hideHeader = false,
  userRole,
}: TicketTimelineProps) {
  const visibleEvents = userRole === 'user'
    ? events.filter((e) => e.data?.visibility !== 'internal')
    : events;

  if (loading) {
    return (
      <div className={cn('space-y-5', className)}>
        {!hideHeader && <h3 className="text-sm font-semibold">Activity</h3>}
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3 items-start">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="space-y-1 text-right">
              <Skeleton className="h-3 w-24 ml-auto" />
              <Skeleton className="h-3 w-14 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visibleEvents.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-10 text-muted-foreground gap-2', className)}>
        <Activity className="h-7 w-7 opacity-25" />
        <p className="text-sm">No activity yet.</p>
      </div>
    );
  }

  const items: React.ReactNode[] = [];
  let lastDay = '';

  visibleEvents.forEach((event, idx) => {
    const isComment = event.event_type === 'comment' || event.event_type === 'comment_added';
    if (isComment && userRole === 'user' && event.data?.visibility === 'internal') return;

    const day = dayLabel(event.created_at);
    if (day !== lastDay) {
      items.push(<DateSeparator key={`sep-${day}-${idx}`} label={day} />);
      lastDay = day;
    }

    const isLast = idx === visibleEvents.length - 1;

    if (isComment) {
      items.push(<CommentCard key={event.id} event={event} isLast={isLast} viewerRole={userRole} />);
    } else {
      items.push(<SystemEventRow key={event.id} event={event} isLast={isLast} />);
    }
  });

  return (
    <div className={cn('', className)}>
      {!hideHeader && (
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          Activity
        </h3>
      )}
      <div className="space-y-0">{items}</div>
    </div>
  );
}
