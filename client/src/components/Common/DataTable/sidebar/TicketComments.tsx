import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from '@/components/ui/skeleton';
import type { Ticket, Comment } from "@/types";
import { formatDate } from "@/utils/date";
import ticketsService from '@/api/services/ticketsService';
import { toast } from 'sonner';
import { ticketCommentSchema, type TicketCommentFormValues } from '@/utils/ticketValidation';

interface TicketCommentsProps {
  ticket: Ticket;
}

// Persistent cache for ticket comments with LRU eviction
type CachedComments = { data: Comment[]; fetchedAt: number };
const COMMENTS_CACHE = new Map<number, CachedComments>();
const COMMENTS_CACHE_TTL_MS = 60 * 1000; // 60 seconds
const COMMENTS_CACHE_STORAGE_KEY = 'resolver_ticket_comments_cache_v1';
const COMMENTS_CACHE_MAX_ENTRIES = 100; // Evict oldest when over this

function loadCacheFromStorage() {
  try {
    const raw = sessionStorage.getItem(COMMENTS_CACHE_STORAGE_KEY);
    if (!raw) return;
    const obj = JSON.parse(raw) as Record<string, CachedComments>;
    Object.entries(obj).forEach(([k, v]) => {
      const id = Number(k);
      if (!Number.isNaN(id)) COMMENTS_CACHE.set(id, v);
    });
  } catch (e) {
    console.error('Failed to load comments cache from storage', e);
  }
}

function saveCacheToStorage() {
  try {
    // Enforce max entries by removing oldest fetchedAt
    if (COMMENTS_CACHE.size > COMMENTS_CACHE_MAX_ENTRIES) {
      const entries = Array.from(COMMENTS_CACHE.entries());
      entries.sort((a, b) => a[1].fetchedAt - b[1].fetchedAt);
      const toRemove = entries.length - COMMENTS_CACHE_MAX_ENTRIES;
      for (let i = 0; i < toRemove; i++) {
        COMMENTS_CACHE.delete(entries[i][0]);
      }
    }

    const obj: Record<number, CachedComments> = {};
    COMMENTS_CACHE.forEach((v, k) => {
      obj[k] = v;
    });
    sessionStorage.setItem(COMMENTS_CACHE_STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.error('Failed to save comments cache to storage', e);
  }
}

function setCache(ticketId: number, data: Comment[]) {
  COMMENTS_CACHE.set(ticketId, { data, fetchedAt: Date.now() });
  saveCacheToStorage();
}

// Load persistent cache at module init
try {
  loadCacheFromStorage();
} catch (e) {
  /* ignore */
}

function TicketCommentsInner({ ticket }: TicketCommentsProps) {
  // Log ticket prop only when ticket id or updated_at changes
  useEffect(() => {
    console.log('TicketComments: ticket prop', ticket);
  }, [ticket.id, (ticket as any).updated_at]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(true);
  const isClosed = ticket.status === 'closed';

  const form = useForm<TicketCommentFormValues>({
    resolver: zodResolver(ticketCommentSchema),
    defaultValues: {
      comment: "",
    },
  });

  // Fetch comments for this ticket (paginated endpoint)
  useEffect(() => {
    let mounted = true;

    const useCacheOrFetch = async () => {
      const cached = COMMENTS_CACHE.get(ticket.id);
      const now = Date.now();

      // If we have fresh cached data, use it immediately and skip loading
      if (cached && now - cached.fetchedAt < COMMENTS_CACHE_TTL_MS) {
        setComments(cached.data);
        setLoadingComments(false);
        return;
      }

      // If we have stale cached data, show it immediately but fetch in background
      if (cached) {
        setComments(cached.data);
        setLoadingComments(true);
        try {
          const data = await ticketsService.getTicketComments(ticket.id);
          if (!mounted) return;
          const parsed = Array.isArray(data) ? data : data.results || [];
          setComments(parsed);
          setCache(ticket.id, parsed);
        } catch (error) {
          console.error('Failed to refresh cached comments', error);
        } finally {
          if (mounted) setLoadingComments(false);
        }
        return;
      }

      // No cache — fetch and populate
      setLoadingComments(true);
      try {
        const data = await ticketsService.getTicketComments(ticket.id);
        if (!mounted) return;
        const parsed = Array.isArray(data) ? data : data.results || [];
        setComments(parsed);
        setCache(ticket.id, parsed);
      } catch (error) {
        console.error('Failed to fetch comments', error);
        if (mounted) setComments([]);
      } finally {
        if (mounted) setLoadingComments(false);
      }
    };

    useCacheOrFetch();

    return () => {
      mounted = false;
    };
  }, [ticket.id]);

  const handleSubmit = async (values: TicketCommentFormValues) => {
    setIsSubmitting(true);
    try {
      await ticketsService.addTicketComment(ticket.id, values.comment);
      toast.success('Comment added');
      form.reset();
      // Refetch comments to ensure latest list (and pagination structure)
        // Refresh and persist cache after posting
        try {
          const created = await ticketsService.getTicketComments(ticket.id);
          const parsed = Array.isArray(created) ? created : created.results || [];
          setComments(parsed);
          setCache(ticket.id, parsed);
        } catch (err) {
          console.error('Failed to refetch comments after post', err);
        }
    } catch (error) {
      console.error('Add comment error', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <h3 className="text-sm font-semibold text-gray-700">
        Comments
      </h3>

      {/* Comments List */}
      <div className="space-y-3">
        {loadingComments ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment: Comment) => (
            <div
              key={comment.id}
              className="flex gap-3 p-4 rounded-lg bg-gray-50 border"
            >
              <Avatar className="h-8 w-8 mt-0.5">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                  {getInitials(comment.author)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900">
                    {comment.author}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                  </p>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input Form - Only show if ticket is not closed */}
      {!isClosed && (
        <div className="pt-3 border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add a comment..."
                        rows={3}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {/* Message for closed tickets */}
      {isClosed && (
        <div className="pt-3 border-t">
          <p className="text-sm text-gray-500 italic text-center py-2">
            This ticket is closed. Comments are disabled.
          </p>
        </div>
      )}
    </div>
  );
}

// Memoize to avoid re-rendering when parent re-renders but ticket hasn't changed
export const TicketComments = React.memo(
  TicketCommentsInner,
  (prev, next) => prev.ticket.id === next.ticket.id && (prev.ticket as any).updated_at === (next.ticket as any).updated_at
);

