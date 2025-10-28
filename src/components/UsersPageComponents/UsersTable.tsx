import { Button, Chip } from '@heroui/react';
import { Eye } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { getInitials, formatDate } from '@/utils/formatters';

interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  telegramId?: number;
  balance: number;
  language?: string;
  createdAt: string;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  onViewUser: (user: User) => void;
}

export const UsersTable = ({ users, loading, onViewUser }: UsersTableProps) => {
  const columns = [
    { key: 'user', label: 'USER' },
    { key: 'telegramId', label: 'TELEGRAM ID' },
    { key: 'balance', label: 'BALANCE' },
    { key: 'language', label: 'LANGUAGE' },
    { key: 'joined', label: 'JOINED' },
    { key: 'actions', label: 'ACTIONS' },
  ];

  const renderCell = (user: User, columnKey: string) => {
    switch (columnKey) {
      case 'user':
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {getInitials(user.firstName, user.lastName, user.username)}
            </div>
            <div>
              <p className="font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-gray-500">@{user.username || 'No username'}</p>
            </div>
          </div>
        );
      case 'telegramId':
        return (
          <code className="px-2 py-1 rounded text-sm">
            {user.telegramId || 'N/A'}
          </code>
        );
      case 'balance':
        return (
          <Chip color="success" variant="flat">
            {user.balance}
          </Chip>
        );
      case 'language':
        return (
          <Chip color="primary" variant="flat">
            {user.language?.toUpperCase() || 'EN'}
          </Chip>
        );
      case 'joined':
        return (
          <span className="text-sm text-gray-600">
            {formatDate(user.createdAt)}
          </span>
        );
      case 'actions':
        return (
          <Button
            size="sm"
            color="primary"
            variant="flat"
            startContent={<Eye size={16} />}
            onClick={() => onViewUser(user)}
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
      title={`All Users (${users.length})`}
      columns={columns}
      data={users}
      loading={loading}
      renderCell={renderCell}
      emptyMessage="No users found"
    />
  );
};
