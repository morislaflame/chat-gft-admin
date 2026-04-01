import { Bot, MessageSquare } from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';

interface AgentStatsProps {
  totalAgents: number;
  avgPromptLength: number;
}

export const AgentStats = ({ 
  totalAgents, 
  avgPromptLength 
}: AgentStatsProps) => {
  const statsCards = [
    {
      title: 'Всего агентов',
      value: totalAgents,
      icon: Bot,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Средняя длина промпта',
      value: `${Math.round(avgPromptLength)} симв.`,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Активные агенты',
      value: totalAgents,
      icon: Bot,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
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

