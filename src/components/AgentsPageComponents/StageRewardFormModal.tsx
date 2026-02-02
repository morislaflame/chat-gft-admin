import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from '@heroui/react';
import { Gift } from 'lucide-react';
import { type StageReward } from '@/http/stageRewardAPI';
import type { Case } from '@/http/caseAPI';
import { useMemo } from 'react';

interface StageRewardFormData {
  stageNumber: number;
  rewardAmount: number;
  rewardCaseId: string; // string for Select compatibility
}

interface StageRewardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: StageRewardFormData;
  onFormDataChange: (data: StageRewardFormData) => void;
  onSave: () => void;
  existingReward?: StageReward | null;
  cases: Case[];
}

export const StageRewardFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  onFormDataChange,
  onSave,
  cases
}: StageRewardFormModalProps) => {
  const handleInputChange = (field: keyof StageRewardFormData, value: number) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const selectedCaseKeys = useMemo(() => {
    return formData.rewardCaseId ? new Set([formData.rewardCaseId]) : new Set<string>();
  }, [formData.rewardCaseId]);

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
              placeholder="1, 2, 3, ..."
              isRequired
              isDisabled={isEditing}
              min={1}
              startContent={<Gift className="w-4 h-4 text-gray-400" />}
              description="Stage number must be greater than or equal to 1"
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

            <Select
              label="Case reward (optional)"
              selectedKeys={selectedCaseKeys}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string | undefined;
                onFormDataChange({
                  ...formData,
                  rewardCaseId: selectedKey === '__none__' ? '' : (selectedKey || ''),
                });
              }}
              placeholder="Select case"
            >
              {cases.length === 0 ? (
                <SelectItem key="__none__">No cases loaded</SelectItem>
              ) : (
                <>
                  <SelectItem key="__none__" textValue="None">
                    None
                  </SelectItem>
                  {cases.map((c) => (
                    <SelectItem key={String(c.id)} textValue={`${c.name} (#${c.id})`}>
                      {c.name} (#{c.id})
                    </SelectItem>
                  ))}
                </>
              )}
            </Select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button 
            color="primary" 
            onPress={onSave}
            disabled={!formData.stageNumber || formData.stageNumber < 1 || formData.rewardAmount < 0}
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

