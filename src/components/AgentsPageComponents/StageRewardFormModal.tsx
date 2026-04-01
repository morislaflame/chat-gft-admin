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
            {isEditing ? 'Редактировать награду за этап' : 'Создать награду за этап'}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Номер этапа"
              type="number"
              value={formData.stageNumber.toString()}
              onChange={(e) => handleInputChange('stageNumber', parseInt(e.target.value) || 0)}
              placeholder="1, 2, 3, ..."
              isRequired
              isDisabled={isEditing}
              min={1}
              startContent={<Gift className="w-4 h-4 text-gray-400" />}
              description="Номер этапа должен быть больше или равен 1"
            />

            <Input
              label="Размер награды"
              type="number"
              value={formData.rewardAmount.toString()}
              onChange={(e) => handleInputChange('rewardAmount', parseInt(e.target.value) || 0)}
              placeholder="например: 100"
              isRequired
              min={0}
              description="Сколько токенов выдать за прохождение этого этапа"
            />

            <Select
              label="Награда кейсом (необязательно)"
              selectedKeys={selectedCaseKeys}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string | undefined;
                onFormDataChange({
                  ...formData,
                  rewardCaseId: selectedKey === '__none__' ? '' : (selectedKey || ''),
                });
              }}
              placeholder="Выберите кейс"
            >
              {cases.length === 0 ? (
                <SelectItem key="__none__">Кейсы не загружены</SelectItem>
              ) : (
                <>
                  <SelectItem key="__none__" textValue="Нет">
                    Нет
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
            Отмена
          </Button>
          <Button 
            color="primary" 
            onPress={onSave}
            disabled={!formData.stageNumber || formData.stageNumber < 1 || formData.rewardAmount < 0}
          >
            {isEditing ? 'Сохранить' : 'Создать'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

