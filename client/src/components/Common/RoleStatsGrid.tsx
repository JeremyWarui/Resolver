import StatCard from './StatCard';
import type { ReactNode } from 'react';

type BadgeColor = 'amber' | 'blue' | 'green' | 'red' | 'purple' | 'gray';

export interface StatConfig {
  title: string;
  value: number;
  description?: string;
  icon: ReactNode;
  iconBgColor: string;
  badge?: { value: string; color: BadgeColor };
}

interface RoleStatsGridProps {
  stats: StatConfig[];
  loading: boolean;
}

// Auto-select responsive grid class based on card count
const gridClass = (count: number) =>
  count <= 4
    ? 'grid-cols-2 lg:grid-cols-4'
    : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';

const RoleStatsGrid = ({ stats, loading }: RoleStatsGridProps) => (
  <div className={`grid ${gridClass(stats.length)} gap-3 mb-2`}>
    {stats.map((s, i) => (
      <StatCard
        key={i}
        title={s.title}
        value={s.value}
        description={s.description}
        icon={s.icon}
        iconBgColor={s.iconBgColor}
        badge={s.badge}
        className="bg-white"
        isLoading={loading}
      />
    ))}
  </div>
);

export default RoleStatsGrid;
