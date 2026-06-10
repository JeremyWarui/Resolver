// RatingWidget — 1–5 star rating + resolved/reopen choice + optional comment.
// Used when a user confirms resolution of their ticket.

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface RatingSubmitPayload {
  rating: number;       // 1–5
  comment?: string;
  action: 'close' | 'reopen';
}

interface RatingWidgetProps {
  onSubmit: (payload: RatingSubmitPayload) => Promise<void> | void;
  submitting?: boolean;
  className?: string;
  /** Only render when the ticket is resolved/closed and the viewer is the raiser. */
  isResolved?: boolean;
  isRaiser?: boolean;
}

export function RatingWidget({ onSubmit, submitting = false, className, isResolved = true, isRaiser = true }: RatingWidgetProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [action, setAction] = useState<'close' | 'reopen'>('close');

  if (!isResolved || !isRaiser) return null;

  const canSubmit = rating > 0;

  return (
    <div className={cn('space-y-5', className)}>
      {/* Stars */}
      <div className="space-y-2">
        <Label>How satisfied are you with the resolution?</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= (hovered || rating);
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                className="p-0.5 focus:outline-none"
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
              >
                <Star
                  className={cn(
                    'h-8 w-8 transition-colors',
                    filled ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-muted-foreground',
                  )}
                />
              </button>
            );
          })}
        </div>
        {rating > 0 && (
          <p className="text-xs text-muted-foreground">
            {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating]}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label>Additional feedback <span className="text-muted-foreground">(optional)</span></Label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us more about your experience…"
          rows={3}
          disabled={submitting}
        />
      </div>

      {/* Action choice */}
      <div className="space-y-2">
        <Label>What would you like to do?</Label>
        <div className="flex flex-col gap-2">
          <label className={cn(
            'flex items-center gap-2 p-3 rounded-md border cursor-pointer transition-colors',
            action === 'close' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50',
          )}>
            <input
              type="radio"
              className="sr-only"
              checked={action === 'close'}
              onChange={() => setAction('close')}
            />
            <span className="flex-1 text-sm font-medium">Close ticket — issue is resolved</span>
          </label>
          <label className={cn(
            'flex items-center gap-2 p-3 rounded-md border cursor-pointer transition-colors',
            action === 'reopen' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50',
          )}>
            <input
              type="radio"
              className="sr-only"
              checked={action === 'reopen'}
              onChange={() => setAction('reopen')}
            />
            <span className="flex-1 text-sm font-medium">Reopen ticket — issue not resolved</span>
          </label>
        </div>
      </div>

      <Button
        onClick={() => onSubmit({ rating, comment: comment || undefined, action })}
        disabled={!canSubmit || submitting}
        className="w-full"
      >
        {submitting ? 'Submitting…' : action === 'close' ? 'Submit & close ticket' : 'Submit & reopen ticket'}
      </Button>
    </div>
  );
}
