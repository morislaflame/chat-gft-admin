import { useEffect, useState, useContext } from 'react';
import { Select, SelectItem } from '@heroui/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { PageHeader } from '@/components/ui';
import { WithdrawalsTable, WithdrawalStats } from '@/components/WithdrawalsPageComponents';

const WithdrawalsPage = observer(() => {
  const { withdrawal } = useContext(Context) as IStoreContext;
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    withdrawal.fetchAllRequests({ 
      status: statusFilter || undefined,
      page: currentPage,
      limit: 20
    });
    withdrawal.fetchStatistics();
  }, [withdrawal, statusFilter, currentPage]);

  const handleStatusUpdate = async (id: number, status: 'pending' | 'completed' | 'rejected') => {
    try {
      await withdrawal.updateStatus(id, status);
      withdrawal.fetchAllRequests({ 
        status: statusFilter || undefined,
        page: currentPage,
        limit: 20
      });
      withdrawal.fetchStatistics();
    } catch (error) {
      console.error('Failed to update withdrawal status:', error);
    }
  };

  const stats = withdrawal.statistics?.total || {
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    rejectedRequests: 0
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Запросы на вывод"
        description="Управление запросами на вывод призов"
      />

      <WithdrawalStats
        totalRequests={stats.totalRequests}
        pendingRequests={stats.pendingRequests}
        completedRequests={stats.completedRequests}
        rejectedRequests={stats.rejectedRequests}
      />

      <div className="flex gap-4 items-center">
        <Select
          label="Фильтр по статусу"
          selectedKeys={statusFilter ? [statusFilter] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setStatusFilter(selected || '');
            setCurrentPage(1);
          }}
          className="max-w-xs"
        >
          <SelectItem key="">Все статусы</SelectItem>
          <SelectItem key="pending">Ожидает</SelectItem>
          <SelectItem key="completed">Выполнен</SelectItem>
          <SelectItem key="rejected">Отклонен</SelectItem>
        </Select>
      </div>

      <WithdrawalsTable
        requests={withdrawal.requests}
        loading={withdrawal.loading}
        onUpdateStatus={handleStatusUpdate}
      />

      {/* Пагинация */}
      {withdrawal.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Предыдущая
          </button>
          <span className="px-4 py-2">
            Страница {withdrawal.pagination.page} из {withdrawal.pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(withdrawal.pagination.totalPages, p + 1))}
            disabled={currentPage === withdrawal.pagination.totalPages}
            className="px-4 py-2 bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Следующая
          </button>
        </div>
      )}
    </div>
  );
});

export default WithdrawalsPage;

