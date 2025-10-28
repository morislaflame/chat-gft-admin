import { Gift, Star } from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';

interface RewardStatsProps {
  totalRewards: number;
  activeRewards: number;
  totalPurchases: number;
  avgPrice: number;
}

export const RewardStats = ({ 
  totalRewards, 
  activeRewards, 
  totalPurchases, 
  avgPrice 
}: RewardStatsProps) => {
  const statsCards = [
    {
      title: 'Total Rewards',
      value: totalRewards,
      icon: Gift,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Rewards',
      value: activeRewards,
      icon: Gift,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Purchases',
      value: totalPurchases,
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Avg Price',
      value: avgPrice,
      icon: Star,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
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
