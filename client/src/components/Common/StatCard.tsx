import React, { ReactNode } from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
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
 * A reusable component for displaying statistics in dashboards
 * Can show a title, value, icon, and change percentage badge
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = "bg-gray-50",
  iconColor: _iconColor,
  badge,
  description,
  className = "",
  customContent,
  isLoading = false,
}) => {
  // Badge color styles
  const getBadgeStyles = (color: string) => {
    switch (color) {
      case 'amber':
        return 'bg-amber-100 text-amber-600';
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'red':
        return 'bg-red-100 text-red-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      case 'gray':
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
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
              <span className={`text-xs px-1.5 py-0.5 ${getBadgeStyles(badge.color)} rounded`}>
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

export default StatCard;