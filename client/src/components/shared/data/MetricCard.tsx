import React, { ReactNode } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { getBadgeStyle } from '@/components/shared/ticket/StatusBadge';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  badge?: {
    value: string;
    color: 'amber' | 'blue' | 'green' | 'red' | 'purple' | 'gray';
  };
  description?: string;
  className?: string;
  customContent?: ReactNode;
  isLoading?: boolean;
}

/**
 * A reusable component for displaying metric statistics in analytics/reports
 * Shows a title, value, icon, and optional change/status badge
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = "bg-gray-50",
  badge,
  description,
  className = "",
  customContent,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className={`${className} animate-pulse`}>
        <CardContent className='p-4 flex items-center'>
          <div className='bg-gray-200 p-3 rounded-full mr-6 ml-2 h-12 w-12'></div>
          <div className="w-full">
            <div className='h-4 bg-gray-200 rounded w-24 mb-2'></div>
            <div className='h-7 bg-gray-200 rounded w-16 mb-2'></div>
            <div className='h-3 bg-gray-200 rounded w-32'></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardContent className='p-4 flex items-center'>
        {icon && (
          <div className={`${iconBgColor} p-3 rounded-full mr-6 ml-2`}>
            {icon}
          </div>
        )}
        <div>
          <p className='text-sm text-gray-500'>{title}</p>
          <div className='flex items-center'>
            <h3 className='text-2xl font-bold mr-2'>
              {value}
            </h3>
            {badge && (
              <span className="text-xs px-1.5 py-0.5 rounded" style={getBadgeStyle(badge.color)}>
                {badge.value}
              </span>
            )}
          </div>
          {description && (
            <p className='text-xs text-gray-500'>{description}</p>
          )}
          {customContent}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
