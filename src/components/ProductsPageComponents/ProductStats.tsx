import { Package, Zap, Star } from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';

interface ProductStatsProps {
  totalProducts: number;
  totalEnergy: number;
  totalStars: number;
  avgPrice: number;
}

export const ProductStats = ({ 
  totalProducts, 
  totalEnergy, 
  totalStars, 
  avgPrice 
}: ProductStatsProps) => {
  const statsCards = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Energy',
      value: totalEnergy,
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Total Stars',
      value: totalStars,
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Avg Price',
      value: avgPrice,
      icon: Star,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
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
