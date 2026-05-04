import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  description?: string;
  /** Optional element rendered in the top-right of the card header (e.g. a dropdown) */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Override CardContent padding — defaults to "p-5 pt-0" */
  contentClassName?: string;
}

const ChartCard = ({
  title,
  description,
  action,
  children,
  className = '',
  contentClassName = 'p-5 pt-0',
}: ChartCardProps) => (
  <Card className={`py-7 px-2 ${className}`}>
    <CardHeader className="flex flex-row justify-between pb-5">
      <div>
        <CardTitle className="pb-2">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </div>
      {action}
    </CardHeader>
    <CardContent className={contentClassName}>
      {children}
    </CardContent>
  </Card>
);

export default ChartCard;
