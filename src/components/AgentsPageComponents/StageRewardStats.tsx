import { Gift, Coins } from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';
import { type StageReward } from '@/http/stageRewardAPI';

interface StageRewardStatsProps {
  rewards: StageReward[];
}

export const StageRewardStats = ({ 
  rewards 
}: StageRewardStatsProps) => {
  const totalRewards = rewards.length;
  const activeRewards = rewards.filter(r => r.isActive).length;
  const totalAmount = rewards.reduce((sum, r) => sum + r.rewardAmount, 0);
  const avgAmount = totalRewards > 0 ? Math.round(totalAmount / totalRewards) : 0;

  const statsCards = [
    {
      title: 'Total Stages',
      value: totalRewards,
      icon: Gift,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Active Stages',
      value: activeRewards,
      icon: Gift,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Avg Reward',
      value: `${avgAmount} tokens`,
      icon: Coins,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

