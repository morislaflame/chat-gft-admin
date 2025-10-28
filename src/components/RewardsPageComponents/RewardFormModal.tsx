import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Switch
} from '@heroui/react';
import { Upload } from 'lucide-react';
import Lottie from 'lottie-react';
import { useState, useEffect } from 'react';

interface RewardFormData {
  name: string;
  price: string;
  tonPrice: string;
  description: string;
  isActive: boolean;
}

interface RewardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: RewardFormData;
  onFormDataChange: (data: RewardFormData) => void;
  imageFile: File | null;
  onImageFileChange: (file: File | null) => void;
  onSave: () => void;
}

export const RewardFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  onFormDataChange,
  imageFile,
  onImageFileChange,
  onSave
}: RewardFormModalProps) => {
  const [previewAnimation, setPreviewAnimation] = useState<Record<string, unknown> | null>(null);

  const handleInputChange = (field: keyof RewardFormData, value: string | boolean) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  // Загружаем анимацию для предпросмотра
  useEffect(() => {
    if (imageFile && imageFile.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const animationData = JSON.parse(e.target?.result as string);
          setPreviewAnimation(animationData);
        } catch (error) {
          console.error('Error parsing JSON animation:', error);
          setPreviewAnimation(null);
        }
      };
      reader.readAsText(imageFile);
    } else {
      setPreviewAnimation(null);
    }
  }, [imageFile]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-semibold">
            {isEditing ? 'Edit Reward' : 'Create New Reward'}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Reward Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter reward name"
              isRequired
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Enter price in points"
                isRequired
              />

              <Input
                label="TON Price (optional)"
                type="number"
                step="0.000000001"
                value={formData.tonPrice}
                onChange={(e) => handleInputChange('tonPrice', e.target.value)}
                placeholder="Enter TON price"
              />
            </div>

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter reward description"
              minRows={3}
            />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Animation File (JSON for Lottie)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => onImageFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                  id="animation-upload"
                />
                <label
                  htmlFor="animation-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {imageFile ? imageFile.name : 'Click to upload JSON file'}
                  </p>
                  <p className="text-xs text-gray-500">Lottie animation files only</p>
                </label>
              </div>
              
              {/* Предпросмотр анимации */}
              {previewAnimation && (
                <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="flex justify-center">
                    <Lottie
                      animationData={previewAnimation}
                      loop={false}
                      autoplay={true}
                      style={{ width: 120, height: 120 }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                isSelected={formData.isActive}
                onValueChange={(value) => handleInputChange('isActive', value)}
              />
              <span className="text-sm text-gray-700">Active</span>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button 
            color="primary" 
            onPress={onSave}
            disabled={!formData.name || !formData.price}
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
