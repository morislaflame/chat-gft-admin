import { Card, CardBody } from '@heroui/react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  bgColor?: string;
  className?: string;
}

export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'text-blue-600', 
  bgColor = 'bg-blue-100',
  className = ''
}: StatsCardProps) => {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-30">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${bgColor}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
