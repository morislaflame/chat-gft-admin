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
            {isEditing ? 'Edit Product' : 'Create New Product'}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Product Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter product name"
              isRequired
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Energy Amount"
                type="number"
                value={formData.energy}
                onChange={(e) => handleInputChange('energy', e.target.value)}
                placeholder="Enter energy amount"
                isRequired
                startContent={<Zap className="w-4 h-4 text-gray-400" />}
              />

              <Input
                label="Stars Price"
                type="number"
                value={formData.starsPrice}
                onChange={(e) => handleInputChange('starsPrice', e.target.value)}
                placeholder="Enter stars price"
                isRequired
                startContent={<Star className="w-4 h-4 text-gray-400" />}
              />
            </div>

            {formData.energy && formData.starsPrice && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Value Ratio:</p>
                <p className="text-lg font-semibold">
                  {valueRatio} energy per star
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button 
            color="primary" 
            onPress={onSave}
            disabled={!formData.name || !formData.energy || !formData.starsPrice}
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
