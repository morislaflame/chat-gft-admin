import { Calendar } from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';

interface DailyRewardStatsProps {
  totalRewards: number;
  configuredDays: number;
}

export const DailyRewardStats = ({
  totalRewards,
  configuredDays
}: DailyRewardStatsProps) => {
  const statsCards = [
    {
      title: 'Total Rewards',
      value: totalRewards,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Configured Days',
      value: `${configuredDays}/7`,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {statsCards.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          bgColor={stat.bgColor}
        />
      ))}
    </div>
  );
};

