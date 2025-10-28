import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip
} from '@heroui/react';
import { formatTime } from '@/utils/formatters';
import { type Order } from '@/types/order';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderDetailsModal = ({ isOpen, onClose, order }: OrderDetailsModalProps) => {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-semibold">Order Details</h3>
        </ModalHeader>
        <ModalBody>
          {order ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Order ID</label>
                  <p className="text-lg font-mono">#{order.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <Chip color={getStatusColor(order.status)} variant="flat">
                      {order.status.toUpperCase()}
                    </Chip>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Product</label>
                  <p className="text-lg">{order.productName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Price</label>
                  <p className="text-lg font-semibold">{order.price} stars</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Energy Purchased</label>
                  <p className="text-lg">{order.attemptsPurchased}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">User ID</label>
                  <p className="text-lg">{order.userId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-lg">{formatTime(order.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Updated At</label>
                  <p className="text-lg">{formatTime(order.updatedAt)}</p>
                </div>
              </div>

              {order.telegramPaymentChargeId && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-600">Payment Charge ID</label>
                  <p className="text-lg font-mono break-all">{order.telegramPaymentChargeId}</p>
                </div>
              )}

              {order.metadata && Object.keys(order.metadata).length > 0 && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-600">Metadata</label>
                  <pre className="text-sm bg-gray-100 p-3 rounded mt-1 overflow-auto">
                    {JSON.stringify(order.metadata, null, 2)}
                  </pre>
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
