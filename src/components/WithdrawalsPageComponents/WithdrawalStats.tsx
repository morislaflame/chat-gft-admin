import { StatsCard } from '@/components/ui/StatsCard';
import { CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';

interface WithdrawalStatsProps {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  rejectedRequests: number;
}

export const WithdrawalStats = ({
  totalRequests,
  pendingRequests,
  completedRequests,
  rejectedRequests
}: WithdrawalStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard
        title="Всего запросов"
        value={totalRequests}
        icon={FileText}
        color="text-blue-600"
        bgColor="bg-blue-100"
      />
      <StatsCard
        title="Ожидают"
        value={pendingRequests}
        icon={Clock}
        color="text-yellow-600"
        bgColor="bg-yellow-100"
      />
      <StatsCard
        title="Выполнено"
        value={completedRequests}
        icon={CheckCircle2}
        color="text-green-600"
        bgColor="bg-green-100"
      />
      <StatsCard
        title="Отклонено"
        value={rejectedRequests}
        icon={XCircle}
        color="text-red-600"
        bgColor="bg-red-100"
      />
    </div>
  );
};

