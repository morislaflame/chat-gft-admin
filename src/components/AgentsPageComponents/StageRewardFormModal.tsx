import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Switch
} from '@heroui/react';
import { Gift } from 'lucide-react';
import { type StageReward } from '@/http/stageRewardAPI';

interface StageRewardFormData {
  stageNumber: number;
  rewardAmount: number;
}

interface StageRewardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: StageRewardFormData;
  onFormDataChange: (data: StageRewardFormData) => void;
  onSave: () => void;
  existingReward?: StageReward | null;
}

export const StageRewardFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  onFormDataChange,
  onSave
}: StageRewardFormModalProps) => {
  const handleInputChange = (field: keyof StageRewardFormData, value: number) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-semibold">
            {isEditing ? 'Edit Stage Reward' : 'Create Stage Reward'}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Stage Number"
              type="number"
              value={formData.stageNumber.toString()}
              onChange={(e) => handleInputChange('stageNumber', parseInt(e.target.value) || 0)}
              placeholder="1, 2, or 3"
              isRequired
              isDisabled={isEditing}
              min={1}
              max={3}
              startContent={<Gift className="w-4 h-4 text-gray-400" />}
              description="Stage number must be between 1 and 3"
            />

            <Input
              label="Reward Amount"
              type="number"
              value={formData.rewardAmount.toString()}
              onChange={(e) => handleInputChange('rewardAmount', parseInt(e.target.value) || 0)}
              placeholder="e.g., 100"
              isRequired
              min={0}
              description="Amount of tokens to reward for completing this stage"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button 
            color="primary" 
            onPress={onSave}
            disabled={!formData.stageNumber || formData.stageNumber < 1 || formData.stageNumber > 3 || !formData.rewardAmount || formData.rewardAmount < 0}
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

