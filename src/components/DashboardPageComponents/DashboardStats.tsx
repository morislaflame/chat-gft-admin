import { Users, MessageSquare, Target, Gift, TrendingUp, DollarSign } from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';

interface DashboardData {
  userStats?: {
    totalUsers: number;
  };
  messageStats?: {
    messageCount: number;
  };
  questStats?: {
    activeQuests: number;
  };
  rewardStats?: {
    totalRewards: number;
    activeRewards: number;
    totalPurchases: number;
  };
  orderStats?: {
    totalOrders: number;
  };
  productStats?: {
    totalProducts: number;
  };
  purchaseStats?: {
    total_purchases: number;
    total_stars: number;
  };
}

interface DashboardStatsProps {
  dashboardData?: DashboardData;
}

export const DashboardStats = ({ dashboardData }: DashboardStatsProps) => {
  const statsCards = [
    {
      title: 'Total Users',
      value: dashboardData?.userStats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Messages',
      value: dashboardData?.messageStats?.messageCount || 0,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Quests',
      value: dashboardData?.questStats?.activeQuests || 0,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Rewards',
      value: dashboardData?.rewardStats?.totalRewards || 0,
      icon: Gift,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Total Orders',
      value: dashboardData?.orderStats?.totalOrders || 0,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Total Products',
      value: dashboardData?.productStats?.totalProducts || 0,
      icon: TrendingUp,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
