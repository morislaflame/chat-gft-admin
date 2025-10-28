import { useEffect, useState, useContext } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip
} from '@heroui/react';
import { Eye, Search, Filter } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { type UserInfo } from '@/types/types';

const UsersPage = observer(() => {
  const { admin } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [, setSelectedUser] = useState<UserInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    admin.fetchUsers();
  }, [admin]);

  const handleViewUser = (user: UserInfo) => {
    setSelectedUser(user);
    if (user.telegramId) {
      admin.fetchUserDetails(user.telegramId.toString());
    }
    onOpen();
  };

  const filteredUsers = admin.users.filter(user => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.telegramId?.toString().includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
          <p className="text-gray-600">Manage and view user information</p>
        </div>
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="flat"
            startContent={<Filter size={16} />}
          >
            Filter
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users by name, username, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">All Users ({filteredUsers.length})</h3>
        </CardHeader>
        <CardBody>
          {admin.loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table aria-label="Users table">
              <TableHeader>
                <TableColumn>USER</TableColumn>
                <TableColumn>TELEGRAM ID</TableColumn>
                <TableColumn>BALANCE</TableColumn>
                <TableColumn>LANGUAGE</TableColumn>
                <TableColumn>JOINED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-500">@{user.username || 'No username'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 rounded text-sm">
                        {user.telegramId || 'N/A'}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Chip color="success" variant="flat">
                        {user.balance}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip color="primary" variant="flat">
                        {user.language?.toUpperCase() || 'EN'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Eye size={16} />}
                        onClick={() => handleViewUser(user as unknown as UserInfo)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* User Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-semibold">User Details</h3>
          </ModalHeader>
          <ModalBody>
            {admin.selectedUser ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-lg">{admin.selectedUser.firstName} {admin.selectedUser.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Username</label>
                    <p className="text-lg">@{admin.selectedUser.username || 'No username'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Telegram ID</label>
                    <p className="text-lg font-mono">{admin.selectedUser.telegramId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Balance</label>
                    <p className="text-lg font-semibold text-green-600">{admin.selectedUser.balance}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Language</label>
                    <p className="text-lg">{admin.selectedUser.language?.toUpperCase() || 'EN'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Joined</label>
                    <p className="text-lg">{formatDate(admin.selectedUser.createdAt)}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Activity Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Messages Sent</label>
                      <p className="text-lg">{admin.selectedUser.messageCount || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">First Message</label>
                      <p className="text-lg">
                        {admin.selectedUser.firstMessageAt 
                          ? formatDate(admin.selectedUser.firstMessageAt)
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {admin.selectedUser.purchases && admin.selectedUser.purchases.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Recent Purchases</h4>
                    <div className="space-y-2">
                      {admin.selectedUser.purchases.slice(0, 3).map((purchase: { starsAmount: number; createdAt: string }, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>{purchase.starsAmount} stars</span>
                          <span className="text-sm text-gray-500">
                            {formatDate(purchase.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

export default UsersPage;
