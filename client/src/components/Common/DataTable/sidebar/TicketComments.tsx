import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import type { Ticket, Comment } from "@/types";
import { formatDate } from "@/utils/date";
import ticketsService from '@/api/services/ticketsService';
import { toast } from 'sonner';

const commentFormSchema = z.object({
  comment: z.string().min(1, { message: "Comment cannot be empty." }),
});

interface TicketCommentsProps {
  ticket: Ticket;
}

export function TicketComments({ ticket }: TicketCommentsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState(ticket.comments || []);
  const isClosed = ticket.status === 'closed';

  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      comment: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof commentFormSchema>) => {
    setIsSubmitting(true);
    try {
      const created = await ticketsService.addTicketComment(ticket.id, values.comment);
      // Optimistically update local comments list (newest first)
      setComments((c) => [created, ...c]);
      toast.success('Comment added');
      form.reset();
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
        {comments.length === 0 ? (
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
