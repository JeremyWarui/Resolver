// TicketTimeline — vertical event list for the ticket detail page.
// Events are merged logs + comments, sorted ascending (oldest first).

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus, UserCheck, RefreshCw, Clock, CheckCircle2,
  XCircle, RotateCcw, Star, MessageSquare, AlertTriangle,
  TrendingUp, Activity,
} from 'lucide-react';

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function exactTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
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

function initials(actor: { full_name: string; username: string }): string {
  const name = actor.full_name.trim() || actor.username;
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function displayName(actor?: { full_name: string; username: string }): string {
  if (!actor) return 'System';
  return actor.full_name.trim() || actor.username;
}

function levelLabel(level: string): string {
  return level === 'hod' ? 'Department Head' : level === 'hos' ? 'Section Head' : 'Technician';
}

function statusLabel(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Event config ──────────────────────────────────────────────────────────────

type EventConfig = {
  Icon: React.ComponentType<{ className?: string }>;
  bg: string;
  ring: string;
  iconColor: string;
  label: string;
};

const EVENT_CONFIG: Record<TimelineEventType, EventConfig> = {
  created:          { Icon: Plus,         bg: 'bg-blue-50',   ring: 'ring-blue-200',   iconColor: 'text-blue-600',   label: 'Ticket opened' },
  assigned:         { Icon: UserCheck,    bg: 'bg-indigo-50', ring: 'ring-indigo-200', iconColor: 'text-indigo-600', label: 'Assigned' },
  reassigned:       { Icon: RefreshCw,    bg: 'bg-violet-50', ring: 'ring-violet-200', iconColor: 'text-violet-600', label: 'Reassigned' },
  status_changed:   { Icon: Activity,     bg: 'bg-sky-50',    ring: 'ring-sky-200',    iconColor: 'text-sky-600',    label: 'Status changed' },
  comment:          { Icon: MessageSquare,bg: 'bg-slate-50',  ring: 'ring-slate-200',  iconColor: 'text-slate-500',  label: 'Comment' },
  comment_added:    { Icon: MessageSquare,bg: 'bg-slate-50',  ring: 'ring-slate-200',  iconColor: 'text-slate-500',  label: 'Comment' },
  escalated:        { Icon: AlertTriangle,bg: 'bg-orange-50', ring: 'ring-orange-200', iconColor: 'text-orange-600', label: 'Escalated' },
  pending:          { Icon: Clock,        bg: 'bg-amber-50',  ring: 'ring-amber-200',  iconColor: 'text-amber-600',  label: 'Paused' },
  resolved:         { Icon: CheckCircle2, bg: 'bg-green-50',  ring: 'ring-green-200',  iconColor: 'text-green-600',  label: 'Resolved' },
  closed:           { Icon: XCircle,      bg: 'bg-gray-50',   ring: 'ring-gray-200',   iconColor: 'text-gray-500',   label: 'Closed' },
  reopened:         { Icon: RotateCcw,    bg: 'bg-blue-50',   ring: 'ring-blue-200',   iconColor: 'text-blue-600',   label: 'Reopened' },
  rated:            { Icon: Star,         bg: 'bg-yellow-50', ring: 'ring-yellow-200', iconColor: 'text-yellow-500', label: 'Rated' },
  priority_changed: { Icon: TrendingUp,   bg: 'bg-purple-50', ring: 'ring-purple-200', iconColor: 'text-purple-600', label: 'Priority changed' },
  sla_breach:       { Icon: AlertTriangle,bg: 'bg-red-50',    ring: 'ring-red-200',    iconColor: 'text-red-600',    label: 'SLA breached' },
};

// ── Sub-description builder ───────────────────────────────────────────────────

function SubDescription({ event }: { event: TimelineEvent }): React.ReactElement | null {
  const { event_type, data, note } = event;

  if (event_type === 'status_changed') {
    const from = data?.from as string | undefined;
    const to   = data?.to   as string | undefined;
    if (from && to) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <span className="bg-muted rounded px-1.5 py-0.5 font-medium">{statusLabel(from)}</span>
          <span>→</span>
          <span className="bg-muted rounded px-1.5 py-0.5 font-medium">{statusLabel(to)}</span>
        </span>
      );
    }
  }

  if (event_type === 'escalated') {
    const from = data?.from as string | undefined;
    const to   = data?.to   as string | undefined;
    const levelUser = data?.level_user as { full_name?: string; username?: string } | undefined;
    return (
      <span className="text-xs text-muted-foreground">
        {from && to ? `${levelLabel(from)} → ${levelLabel(to)}` : ''}
        {levelUser && (
          <span className="text-orange-700 font-medium ml-1">
            · now with {levelUser.full_name || levelUser.username}
          </span>
        )}
      </span>
    );
  }

  if (event_type === 'rated' && data?.to) {
    const rating = Number(data.to);
    return (
      <span className="inline-flex items-center gap-0.5">
        {[1,2,3,4,5].map((n) => (
          <Star key={n} className={cn('h-3.5 w-3.5', n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/40')} />
        ))}
      </span>
    );
  }

  if (event_type === 'pending' && note) {
    return <span className="text-xs text-muted-foreground italic">"{note}"</span>;
  }

  return null;
}

// ── ActorBadge ────────────────────────────────────────────────────────────────

function ActorBadge({ actor }: { actor?: { id: number; username: string; full_name: string } }) {
  if (!actor) {
    return <span className="text-xs text-muted-foreground">System</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-[9px] font-bold text-muted-foreground shrink-0">
        {initials(actor)}
      </span>
      <span className="text-xs text-muted-foreground font-medium">{displayName(actor)}</span>
    </span>
  );
}

// ── Comment card ─────────────────────────────────────────────────────────────

function CommentCard({ event, viewerRole }: { event: TimelineEvent; viewerRole?: string }) {
  const isInternal = event.data?.visibility === 'internal';
  if (isInternal && viewerRole === 'user') return null;

  return (
    <div className={cn(
      'flex gap-3 group',
    )}>
      {/* icon + line placeholder — invisible for comments, keeps alignment */}
      <div className="flex flex-col items-center w-9 shrink-0">
        <div className={cn(
          'flex items-center justify-center w-9 h-9 rounded-full ring-2 shrink-0',
          isInternal ? 'bg-amber-50 ring-amber-200' : 'bg-slate-50 ring-slate-200',
        )}>
          <MessageSquare className={cn('h-4 w-4', isInternal ? 'text-amber-600' : 'text-slate-500')} />
        </div>
      </div>

      {/* card */}
      <div className="flex-1 min-w-0 pb-6">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <ActorBadge actor={event.actor} />
          {isInternal && (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">
              Internal note
            </span>
          )}
          <span className="ml-auto text-[11px] text-muted-foreground/70" title={exactTime(event.created_at)}>
            {relativeTime(event.created_at)}
          </span>
        </div>
        <div className={cn(
          'rounded-xl border px-4 py-3 text-sm leading-relaxed text-foreground/80',
          isInternal
            ? 'bg-amber-50/70 border-amber-200/80 border-l-4 border-l-amber-400'
            : 'bg-muted/40 border-border/60',
        )}>
          {event.note}
        </div>
      </div>
    </div>
  );
}

// ── System event item ─────────────────────────────────────────────────────────

function SystemEventItem({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const cfg = EVENT_CONFIG[event.event_type] ?? EVENT_CONFIG.status_changed;
  const { Icon, bg, ring, iconColor, label } = cfg;

  return (
    <div className="flex gap-3 group">
      {/* icon + connector */}
      <div className="flex flex-col items-center w-9 shrink-0">
        <div className={cn('flex items-center justify-center w-9 h-9 rounded-full ring-2 shrink-0', bg, ring)}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border/60 mt-1.5 mb-0 min-h-[20px]" />}
      </div>

      {/* content */}
      <div className={cn('flex-1 min-w-0', isLast ? 'pb-0' : 'pb-5')}>
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-semibold text-foreground leading-snug">{label}</span>
            <SubDescription event={event} />
          </div>
          <span className="text-[11px] text-muted-foreground/70 shrink-0 mt-0.5" title={exactTime(event.created_at)}>
            {relativeTime(event.created_at)}
          </span>
        </div>
        <div className="mt-1">
          <ActorBadge actor={event.actor} />
        </div>
        {/* note — only for non-pending (pending shows note in SubDescription) */}
        {event.note && event.event_type !== 'pending' && event.event_type !== 'rated' && (
          <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground leading-relaxed">
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
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-border/50" />
      <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
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
          <div key={i} className="flex gap-3">
            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 pt-1">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visibleEvents.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No activity yet.</p>
      </div>
    );
  }

  // Group by day, inserting date separators
  const items: React.ReactNode[] = [];
  let lastDay = '';

  visibleEvents.forEach((event, idx) => {
    const isComment = event.event_type === 'comment' || event.event_type === 'comment_added';
    if (isComment && userRole === 'user' && event.data?.visibility === 'internal') return;

    const day = dayLabel(event.created_at);
    if (day !== lastDay) {
      items.push(<DateSeparator key={`sep-${day}`} label={day} />);
      lastDay = day;
    }

    const isLast = idx === visibleEvents.length - 1;

    if (isComment) {
      items.push(
        <CommentCard key={event.id} event={event} viewerRole={userRole} />
      );
    } else {
      items.push(
        <SystemEventItem key={event.id} event={event} isLast={isLast && !isComment} />
      );
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
