import { useEffect, useState, useContext } from 'react';
import { useDisclosure } from '@heroui/react';
import { Filter } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { type UserInfo } from '@/types/types';
import { PageHeader, SearchBar } from '@/components/ui';
import { UsersTable, UserDetailsModal } from '@/components/UsersPageComponents';

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


  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Users"
        description="Manage and view user information"
        actionButton={{
          label: "Filter",
          icon: Filter,
          variant: "flat",
          onClick: () => {}
        }}
      />

      <SearchBar
        placeholder="Search users by name, username, or ID..."
        value={searchTerm}
        onChange={setSearchTerm}
      />

      <UsersTable
        users={filteredUsers}
        loading={admin.loading}
        onViewUser={(user) => handleViewUser(user as unknown as UserInfo)}
      />

      <UserDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        user={admin.selectedUser}
      />
    </div>
  );
});

export default UsersPage;
