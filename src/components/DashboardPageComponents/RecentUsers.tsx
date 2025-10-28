import { Card, CardBody, CardHeader } from '@heroui/react';
import { getInitials } from '@/utils/formatters';

interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  balance: number;
  createdAt: string;
}

interface RecentUsersProps {
  users?: User[];
}

export const RecentUsers = ({ users }: RecentUsersProps) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Recent Users</h3>
      </CardHeader>
      <CardBody>
        {users && users.length > 0 ? (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {getInitials(user.firstName, user.lastName, user.username)}
                  </div>
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-300">@{user.username || 'No username'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{user.balance} balance</p>
                  <p className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No users found</p>
        )}
      </CardBody>
    </Card>
  );
};
