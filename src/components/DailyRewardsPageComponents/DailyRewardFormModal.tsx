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
import { useMemo } from 'react';

interface DailyRewardFormData {
  day: string;
  reward: string;
  secondReward: string;
  rewardCaseId: string;
}

interface DailyRewardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: DailyRewardFormData;
  onFormDataChange: (data: DailyRewardFormData) => void;
  onSave: () => void;
  cases: Array<{ id: number; name: string }>;
}

export const DailyRewardFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  onFormDataChange,
  onSave,
  cases
}: DailyRewardFormModalProps) => {
  const handleInputChange = (field: keyof DailyRewardFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const days = Array.from({ length: 7 }, (_, i) => i + 1);

  // Преобразуем selectedKeys в Set для корректной работы Select
  const selectedDayKeys = useMemo(() => {
    return formData.day ? new Set([formData.day]) : new Set<string>();
  }, [formData.day]);

  const selectedCaseKeys = useMemo(() => {
    return formData.rewardCaseId ? new Set([formData.rewardCaseId]) : new Set<string>();
  }, [formData.rewardCaseId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" className='dark'>
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-semibold">
            {isEditing ? 'Редактировать ежедневную награду' : 'Создать ежедневную награду'}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Select
              label="День"
              selectedKeys={selectedDayKeys}
              onSelectionChange={(keys) => {
                const selectedDay = Array.from(keys)[0] as string;
                handleInputChange('day', selectedDay || '');
              }}
              isDisabled={isEditing}
              isRequired
              placeholder="Выберите день (1-7)"
            >
              {days.map((day) => (
                <SelectItem key={day.toString()}>
                  День {day}
                </SelectItem>
              ))}
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Награда энергией"
                type="number"
                value={formData.reward}
                onChange={(e) => handleInputChange('reward', e.target.value)}
                placeholder="Введите количество энергии (>=0)"
                min="0"
              />
              <Input
                label="Награда токенами"
                type="number"
                value={formData.secondReward}
                onChange={(e) => handleInputChange('secondReward', e.target.value)}
                placeholder="Введите количество токенов (>=0)"
                min="0"
              />
            </div>

            <Select
              label="Награда кейсом (необязательно)"
              selectedKeys={selectedCaseKeys}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string | undefined;
                handleInputChange('rewardCaseId', selectedKey === '__none__' ? '' : (selectedKey || ''));
              }}
              placeholder="Выберите кейс"
            >
              {cases.length === 0 ? (
                <SelectItem key="__none__">
                  Кейсы не загружены
                </SelectItem>
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
            disabled={
              !formData.day ||
              (
                Number(formData.reward || '0') <= 0 &&
                Number(formData.secondReward || '0') <= 0 &&
                !formData.rewardCaseId
              )
            }
          >
            {isEditing ? 'Сохранить' : 'Создать'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

