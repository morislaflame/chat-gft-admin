import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem
} from '@heroui/react';

interface TaskFormData {
  type: string;
  reward: string;
  rewardType: string;
  description: string;
  targetCount: string;
  code: string;
  metadata: string;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: TaskFormData;
  onFormDataChange: (data: TaskFormData) => void;
  onSave: () => void;
}

export const TaskFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  onFormDataChange,
  onSave
}: TaskFormModalProps) => {
  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-semibold">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Task Type"
                selectedKeys={[formData.type]}
                onSelectionChange={(keys) => handleInputChange('type', Array.from(keys)[0] as string)}
              >
                <SelectItem key="DAILY">Daily</SelectItem>
                <SelectItem key="ONE_TIME">One Time</SelectItem>
                <SelectItem key="SPECIAL">Special</SelectItem>
              </Select>

              <Select
                label="Reward Type"
                selectedKeys={[formData.rewardType]}
                onSelectionChange={(keys) => handleInputChange('rewardType', Array.from(keys)[0] as string)}
              >
                <SelectItem key="energy">Energy</SelectItem>
                <SelectItem key="tokens">Tokens</SelectItem>
              </Select>
            </div>

            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter task description"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Reward Amount"
                type="number"
                value={formData.reward}
                onChange={(e) => handleInputChange('reward', e.target.value)}
                placeholder="Enter reward amount"
              />

              <Input
                label="Target Count"
                type="number"
                value={formData.targetCount}
                onChange={(e) => handleInputChange('targetCount', e.target.value)}
                placeholder="Enter target count"
              />
            </div>

            <Input
              label="Code (optional)"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              placeholder="Enter task code"
            />

            <Input
              label="Metadata (JSON, optional)"
              value={formData.metadata}
              onChange={(e) => handleInputChange('metadata', e.target.value)}
              placeholder='{"key": "value"}'
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={onSave}>
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
