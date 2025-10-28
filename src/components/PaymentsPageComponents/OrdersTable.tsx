import {
  Chip,
  Button
} from '@heroui/react';
import { Eye } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
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

  const columns = [
    { key: 'id', label: 'ORDER ID' },
    { key: 'product', label: 'PRODUCT' },
    { key: 'price', label: 'PRICE' },
    { key: 'status', label: 'STATUS' },
    { key: 'user', label: 'USER' },
    { key: 'date', label: 'DATE' },
    { key: 'actions', label: 'ACTIONS' },
  ];

  const renderCell = (order: Order, columnKey: string) => {
    switch (columnKey) {
      case 'id':
        return (
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
            #{order.id}
          </code>
        );
      case 'product':
        return (
          <div>
            <p className="font-medium">{order.productName}</p>
            <p className="text-sm text-gray-500">
              {order.attemptsPurchased} energy
            </p>
          </div>
        );
      case 'price':
        return <span className="font-semibold">{order.price} stars</span>;
      case 'status':
        return (
          <Chip color={getStatusColor(order.status)} variant="flat">
            {order.status.toUpperCase()}
          </Chip>
        );
      case 'user':
        return (
          <div>
            <p className="font-medium">
              {order.user?.username || 'Unknown'}
            </p>
            <p className="text-sm text-gray-500">
              ID: {order.userId}
            </p>
          </div>
        );
      case 'date':
        return (
          <span className="text-sm text-gray-600">
            {formatTime(order.createdAt)}
          </span>
        );
      case 'actions':
        return (
          <Button
            size="sm"
            color="primary"
            variant="flat"
            startContent={<Eye size={14} />}
            onClick={() => onViewOrder(order)}
          >
            View
          </Button>
        );
      default:
        return '-';
    }
  };

  return (
    <DataTable
      title={`All Orders (${orders.length})`}
      columns={columns}
      data={orders}
      loading={loading}
      renderCell={renderCell}
      emptyMessage="No orders found"
    />
  );
};
