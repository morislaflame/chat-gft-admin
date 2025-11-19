import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { PageHeader } from '@/components/ui';
import { getUsers, type UsersResponse } from '@/http/adminAPI';
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Button,
  Chip,
  Pagination,
  Input,
  Card,
  CardBody
} from '@heroui/react';
import { Eye, Search } from 'lucide-react';
import { getInitials } from '@/utils/formatters';
import { USERS_ROUTE } from '@/utils/consts';

interface User {
  id: number;
  telegramId: number | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  language: string | null;
  balance: number;
  energy: number;
  createdAt: string;
}

const UsersPage = observer(() => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [searchTelegramId, setSearchTelegramId] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadUsers = async (currentPage: number = page, id?: string, telegramId?: string, username?: string) => {
    setLoading(true);
    try {
      const response: UsersResponse = await getUsers(
        currentPage, 
        limit, 
        id !== undefined && id !== '' ? id : undefined, 
        telegramId !== undefined && telegramId !== '' ? telegramId : undefined, 
        username !== undefined && username !== '' ? username : undefined
      );
      setUsers(response.users);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем пользователей при первой загрузке и при изменении страницы
  useEffect(() => {
    loadUsers(page, searchId, searchTelegramId, searchUsername);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = () => {
    setPage(1); // Сбрасываем на первую страницу при поиске
    loadUsers(1, searchId, searchTelegramId, searchUsername);
  };

  const handleClearSearch = () => {
    setSearchId('');
    setSearchTelegramId('');
    setSearchUsername('');
    setPage(1);
    // Загружаем всех пользователей после очистки
    setTimeout(() => {
      loadUsers(1, '', '', '');
    }, 0);
  };

  const handleViewUser = (userId: number) => {
    navigate(`${USERS_ROUTE}/${userId}`);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'user', label: 'USER' },
    { key: 'telegramId', label: 'TELEGRAM ID' },
    { key: 'balance', label: 'BALANCE' },
    { key: 'energy', label: 'ENERGY' },
    { key: 'actions', label: 'ACTIONS' },
  ];

  const renderCell = (user: User, columnKey: string) => {
    switch (columnKey) {
      case 'id':
        return <span className="font-mono text-sm">{user.id}</span>;
      case 'user':
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {getInitials(user.firstName || '', user.lastName || '', user.username || '')}
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
      case 'energy':
        return (
          <Chip color="warning" variant="flat">
            {user.energy}
          </Chip>
        );
      case 'actions':
        return (
          <Button
            size="sm"
            color="primary"
            variant="flat"
            startContent={<Eye size={16} />}
            onClick={() => handleViewUser(user.id)}
          >
            View
          </Button>
        );
      default:
        return '-';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Users"
        description={`Manage and view user information (Total: ${total})`}
      />

      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="User ID"
              placeholder="Enter user ID"
              type="number"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Input
              label="Telegram ID"
              placeholder="Enter Telegram ID"
              type="number"
              value={searchTelegramId}
              onChange={(e) => setSearchTelegramId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Input
              label="Username"
              placeholder="Enter username"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <div className="flex items-end gap-2">
              <Button
                color="primary"
                startContent={<Search size={16} />}
                onPress={handleSearch}
                className="flex-1"
              >
                Search
              </Button>
              {(searchId || searchTelegramId || searchUsername) && (
                <Button
                  variant="light"
                  onPress={handleClearSearch}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="bg-white rounded-lg shadow">
        <Table aria-label="Users table">
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={users} isLoading={loading} loadingContent="Loading users...">
            {(user) => (
              <TableRow key={user.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(user, columnKey as string)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex justify-center py-4">
            <Pagination
              total={totalPages}
              page={page}
              onChange={setPage}
              showControls
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default UsersPage;
