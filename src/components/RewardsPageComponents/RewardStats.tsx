import { Gift, Gem } from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';

interface RewardStatsProps {
  totalRewards: number;
  activeRewards: number;
  totalPurchases: number;
}

export const RewardStats = ({ 
  totalRewards, 
  activeRewards, 
  totalPurchases, 
}: RewardStatsProps) => {
  const statsCards = [
    {
      title: 'Всего наград',
      value: totalRewards,
      icon: Gift,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Активные награды',
      value: activeRewards,
      icon: Gift,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Всего покупок',
      value: totalPurchases,
      icon: Gem,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
