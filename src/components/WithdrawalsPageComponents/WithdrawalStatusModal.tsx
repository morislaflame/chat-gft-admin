import { Button, Chip, Select, SelectItem } from '@heroui/react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { type WithdrawalRequest } from '@/http/withdrawalAPI';

interface WithdrawalStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: WithdrawalRequest | null;
  onUpdateStatus: (id: number, status: 'pending' | 'completed' | 'rejected') => void;
}

export const WithdrawalStatusModal = ({
  isOpen,
  onClose,
  request,
  onUpdateStatus
}: WithdrawalStatusModalProps) => {
  if (!request) return null;

  const handleStatusChange = (status: 'pending' | 'completed' | 'rejected') => {
    onUpdateStatus(request.id, status);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-semibold">Изменение статуса запроса</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Пользователь</p>
              <p className="font-medium">
                {request.user?.firstName || request.user?.username || `User #${request.userId}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Приз</p>
              <p className="font-medium">
                {request.userReward?.reward?.name || 'Unknown Reward'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Текущий статус</p>
              <Chip 
                color={request.status === 'pending' ? 'warning' : 
                       request.status === 'completed' ? 'success' : 'danger'}
                variant="flat"
              >
                {request.status === 'pending' ? 'Ожидает' : 
                 request.status === 'completed' ? 'Выполнен' : 'Отклонен'}
              </Chip>
            </div>
            {request.createdAt && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Дата создания</p>
                <p className="text-sm">{new Date(request.createdAt).toLocaleString('ru-RU')}</p>
              </div>
            )}
            {request.completedAt && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Дата завершения</p>
                <p className="text-sm">{new Date(request.completedAt).toLocaleString('ru-RU')}</p>
              </div>
            )}
            {request.admin && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Выполнил администратор</p>
                <p className="text-sm">
                  {request.admin.firstName || request.admin.username || `Admin #${request.completedBy}`}
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Отмена
          </Button>
          {request.status === 'pending' && (
            <>
              <Button 
                color="success" 
                onPress={() => handleStatusChange('completed')}
              >
                Выполнить
              </Button>
              <Button 
                color="danger" 
                onPress={() => handleStatusChange('rejected')}
              >
                Отклонить
              </Button>
            </>
          )}
          {request.status === 'completed' && (
            <Button 
              color="warning" 
              onPress={() => handleStatusChange('pending')}
            >
              Вернуть в ожидание
            </Button>
          )}
          {request.status === 'rejected' && (
            <Button 
              color="success" 
              onPress={() => handleStatusChange('completed')}
            >
              Выполнить
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

