import { Chip, Button, Card, CardBody } from '@heroui/react';
import { CheckCircle2, XCircle, Clock, CheckCircle } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { type WithdrawalRequest } from '@/http/withdrawalAPI';

interface WithdrawalsTableProps {
  requests: WithdrawalRequest[];
  loading: boolean;
  onUpdateStatus: (id: number, status: 'pending' | 'completed' | 'rejected') => void;
}

export const WithdrawalsTable = ({ 
  requests, 
  loading,
  onUpdateStatus
}: WithdrawalsTableProps) => {
  const getStatusColor = (status: string): 'success' | 'danger' | 'warning' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={14} />;
      case 'rejected':
        return <XCircle size={14} />;
      case 'pending':
        return <Clock size={14} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) =>
    status === 'pending' ? 'Ожидает' : status === 'completed' ? 'Выполнен' : 'Отклонен';

  if (loading && requests.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-gray-500">Запросы на вывод не найдены</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400">Запросы на вывод ({requests.length})</div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="border border-zinc-700/70 bg-zinc-900/70">
            <CardBody className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-white">
                    {request.user?.firstName || request.user?.username || `Пользователь #${request.userId}`}
                  </p>
                  {request.user?.telegramId && (
                    <p className="text-xs text-zinc-400">TG: {request.user.telegramId}</p>
                  )}
                </div>
                <Chip
                  color={getStatusColor(request.status)}
                  variant="flat"
                  startContent={getStatusIcon(request.status)}
                >
                  {getStatusLabel(request.status)}
                </Chip>
              </div>

              <div className="rounded-lg bg-zinc-800/70 p-3 space-y-1">
                <p className="text-xs text-zinc-400">Приз</p>
                <p className="font-medium text-zinc-100">
                  {request.userReward?.reward?.name || 'Неизвестная награда'}
                </p>
                {request.userReward?.reward?.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2">{request.userReward.reward.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-zinc-800/60 p-2">
                  <p className="text-xs text-zinc-400">Создан</p>
                  <p className="text-zinc-200">{formatDate(request.createdAt)}</p>
                </div>
                <div className="rounded-lg bg-zinc-800/60 p-2">
                  <p className="text-xs text-zinc-400">Завершен</p>
                  <p className="text-zinc-200">{request.completedAt ? formatDate(request.completedAt) : '-'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {request.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      color="success"
                      variant="flat"
                      startContent={<CheckCircle size={14} />}
                      onClick={() => onUpdateStatus(request.id, 'completed')}
                    >
                      Выполнить
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      startContent={<XCircle size={14} />}
                      onClick={() => onUpdateStatus(request.id, 'rejected')}
                    >
                      Отклонить
                    </Button>
                  </>
                )}
                {request.status === 'completed' && (
                  <Button
                    size="sm"
                    color="warning"
                    variant="flat"
                    startContent={<Clock size={14} />}
                    onClick={() => onUpdateStatus(request.id, 'pending')}
                  >
                    Вернуть в ожидание
                  </Button>
                )}
                {request.status === 'rejected' && (
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    startContent={<CheckCircle size={14} />}
                    onClick={() => onUpdateStatus(request.id, 'completed')}
                  >
                    Выполнить
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

