import {
  Chip,
  Button,
  Card,
  CardBody
} from '@heroui/react';
import { Eye } from 'lucide-react';
import { formatTime } from '@/utils/formatters';
import { type Order } from '@/types/order';

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  onViewOrder: (order: Order) => void;
}

export const OrdersTable = ({ orders, loading, onViewOrder }: OrdersTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'success';
      case 'refunded':
        return 'danger';
      case 'initial':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
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

  if (orders.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-gray-500">Заказы не найдены</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400">Все заказы ({orders.length})</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="border border-zinc-700/70 bg-zinc-900/70">
            <CardBody className="space-y-3">
              <div className="flex items-start justify-between">
                <code className="bg-zinc-800 px-2 py-1 rounded text-sm text-zinc-100">#{order.id}</code>
                <Chip color={getStatusColor(order.status)} variant="flat" size="sm">
                  {order.status.toUpperCase()}
                </Chip>
              </div>

              <div>
                <p className="font-semibold text-white">{order.productName}</p>
                <p className="text-sm text-zinc-400">{order.attemptsPurchased} энергии</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{order.price} звезд</span>
                <span className="text-xs text-zinc-500">{formatTime(order.createdAt)}</span>
              </div>

              <div className="text-xs text-zinc-400">Пользователь: {order.user?.username || 'Неизвестно'} (ID: {order.userId})</div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<Eye size={14} />}
                  onClick={() => onViewOrder(order)}
                >
                  Открыть
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
