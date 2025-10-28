import { MessageSquare, Gift, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';

interface MessageStats {
  messageCount?: number;
  messagesUntilCongratulation?: number;
}

interface ForceProgress {
  currentProgress?: number;
}

interface MessageStatsProps {
  stats?: MessageStats;
  forceProgress?: ForceProgress;
}

export const MessageStats = ({ stats, forceProgress }: MessageStatsProps) => {
  const statsCards = [
    {
      title: 'Total Messages',
      value: stats?.messageCount || 0,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Until Next Gift',
      value: stats?.messagesUntilCongratulation || 0,
      icon: Gift,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Progress',
      value: forceProgress ? `${Math.round(forceProgress.currentProgress || 0)}%` : '0%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
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
