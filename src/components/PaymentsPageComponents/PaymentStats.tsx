import { CreditCard, DollarSign } from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';

interface PaymentStatsProps {
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  successRate: number;
}

export const PaymentStats = ({ 
  totalOrders, 
  completedOrders, 
  totalRevenue, 
  successRate 
}: PaymentStatsProps) => {
  const statsCards = [
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Completed',
      value: completedOrders,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Revenue',
      value: totalRevenue,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      icon: DollarSign,
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
