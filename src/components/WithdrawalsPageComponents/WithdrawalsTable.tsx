import { Chip, Button } from '@heroui/react';
import { CheckCircle2, XCircle, Clock, CheckCircle } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
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

  const columns = [
    { key: 'user', label: 'ПОЛЬЗОВАТЕЛЬ' },
    { key: 'reward', label: 'ПРИЗ' },
    { key: 'status', label: 'СТАТУС' },
    { key: 'created', label: 'СОЗДАН' },
    { key: 'completed', label: 'ЗАВЕРШЕН' },
    { key: 'actions', label: 'ДЕЙСТВИЯ' },
  ];

  const renderCell = (request: WithdrawalRequest, columnKey: string) => {
    switch (columnKey) {
      case 'user':
        return (
          <div>
            <p className="font-medium">
              {request.user?.firstName || request.user?.username || `User #${request.userId}`}
            </p>
            {request.user?.telegramId && (
              <p className="text-sm text-gray-500">TG: {request.user.telegramId}</p>
            )}
          </div>
        );
      case 'reward':
        return (
          <div>
            <p className="font-medium">
              {request.userReward?.reward?.name || 'Unknown Reward'}
            </p>
            {request.userReward?.reward?.description && (
              <p className="text-sm text-gray-500">
                {request.userReward.reward.description.substring(0, 50)}...
              </p>
            )}
          </div>
        );
      case 'status':
        return (
          <Chip 
            color={getStatusColor(request.status)}
            variant="flat"
            startContent={getStatusIcon(request.status)}
          >
            {request.status === 'pending' ? 'Ожидает' : 
             request.status === 'completed' ? 'Выполнен' : 'Отклонен'}
          </Chip>
        );
      case 'created':
        return (
          <span className="text-sm text-gray-600">
            {formatDate(request.createdAt)}
          </span>
        );
      case 'completed':
        return request.completedAt ? (
          <span className="text-sm text-gray-600">
            {formatDate(request.completedAt)}
          </span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        );
      case 'actions':
        return (
          <div className="flex gap-2">
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
        );
      default:
        return '-';
    }
  };

  return (
    <DataTable
      title={`Запросы на вывод (${requests.length})`}
      columns={columns}
      data={requests}
      loading={loading}
      renderCell={renderCell}
      emptyMessage="Запросы на вывод не найдены"
    />
  );
};

