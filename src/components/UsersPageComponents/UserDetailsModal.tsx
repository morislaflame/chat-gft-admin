import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@heroui/react';
import { formatDate } from '@/utils/formatters';

interface UserDetails {
  firstName?: string;
  lastName?: string;
  username?: string;
  telegramId?: number;
  balance: number;
  language?: string;
  createdAt: string;
  messageCount?: number;
  firstMessageAt?: string;
  purchases?: Array<{
    starsAmount: number;
    createdAt: string;
  }>;
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDetails | null;
}

export const UserDetailsModal = ({ isOpen, onClose, user }: UserDetailsModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-semibold">User Details</h3>
        </ModalHeader>
        <ModalBody>
          {user ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Username</label>
                  <p className="text-lg">@{user.username || 'No username'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Telegram ID</label>
                  <p className="text-lg font-mono">{user.telegramId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Balance</label>
                  <p className="text-lg font-semibold text-green-600">{user.balance}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Language</label>
                  <p className="text-lg">{user.language?.toUpperCase() || 'EN'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Joined</label>
                  <p className="text-lg">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Activity Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Messages Sent</label>
                    <p className="text-lg">{user.messageCount || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">First Message</label>
                    <p className="text-lg">
                      {user.firstMessageAt 
                        ? formatDate(user.firstMessageAt)
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {user.purchases && user.purchases.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Recent Purchases</h4>
                  <div className="space-y-2">
                    {user.purchases.slice(0, 3).map((purchase, index) => (
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
  );
};
