import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from '@heroui/react';
import { type Mission } from '@/http/agentAPI';

interface MissionFormData {
  title: string;
  description: string;
  orderIndex: string;
}

interface MissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: MissionFormData;
  onFormDataChange: (data: MissionFormData) => void;
  onSave: () => void;
  existingMission?: Mission | null;
}

export const MissionFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  onFormDataChange,
  onSave,
}: MissionFormModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>
          {isEditing ? 'Edit Mission' : 'Create Mission'}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Title"
              placeholder="Enter mission title"
              value={formData.title}
              onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
              isRequired
            />
            <Textarea
              label="Description"
              placeholder="Enter mission description (optional)"
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              minRows={3}
            />
            <Input
              label="Order Index"
              placeholder="Enter order index"
              type="number"
              value={formData.orderIndex}
              onChange={(e) => onFormDataChange({ ...formData, orderIndex: e.target.value })}
              isRequired
              description="The order in which this mission appears (lower numbers appear first)"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
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

