import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input
} from '@heroui/react';
import { Zap, Star } from 'lucide-react';

interface ProductFormData {
  name: string;
  energy: string;
  starsPrice: string;
  referralBonusEnergy: string;
  referralBonusBalance: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: ProductFormData;
  onFormDataChange: (data: ProductFormData) => void;
  onSave: () => void;
}

export const ProductFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  onFormDataChange,
  onSave
}: ProductFormModalProps) => {
  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const valueRatio = formData.energy && formData.starsPrice 
    ? (parseInt(formData.energy) / parseInt(formData.starsPrice)).toFixed(2)
    : '0.00';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-semibold">
            {isEditing ? 'Редактировать продукт' : 'Создать новый продукт'}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Название продукта"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Введите название продукта"
              isRequired
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Количество энергии"
                type="number"
                value={formData.energy}
                onChange={(e) => handleInputChange('energy', e.target.value)}
                placeholder="Введите количество энергии"
                isRequired
                startContent={<Zap className="w-4 h-4 text-gray-400" />}
              />

              <Input
                label="Цена в звездах"
                type="number"
                value={formData.starsPrice}
                onChange={(e) => handleInputChange('starsPrice', e.target.value)}
                placeholder="Введите цену в звездах"
                isRequired
                startContent={<Star className="w-4 h-4 text-gray-400" />}
              />
            </div>

            {formData.energy && formData.starsPrice && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Соотношение ценности:</p>
                <p className="text-lg font-semibold">
                  {valueRatio} энергии за звезду
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Реферальный бонус (необязательно)</p>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Бонус энергией"
                  type="number"
                  value={formData.referralBonusEnergy}
                  onChange={(e) => handleInputChange('referralBonusEnergy', e.target.value)}
                  placeholder="Энергия для пригласившего"
                  description="Бонус энергией для пригласившего пользователя"
                />
                <Input
                  label="Бонус балансом"
                  type="number"
                  value={formData.referralBonusBalance}
                  onChange={(e) => handleInputChange('referralBonusBalance', e.target.value)}
                  placeholder="Баланс для пригласившего"
                  description="Бонус балансом для пригласившего пользователя"
                />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Отмена
          </Button>
          <Button 
            color="primary" 
            onPress={onSave}
            disabled={!formData.name || !formData.energy || !formData.starsPrice}
          >
            {isEditing ? 'Сохранить' : 'Создать'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
