import { useMemo, useState } from 'react';
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
  Textarea
} from '@heroui/react';

interface TaskFormData {
  type: string;
  reward: string;
  rewardType: string;
  description: string;
  targetCount: string;
  code: string;
  metadata: string;
  // Поля для метадаты TELEGRAM_SUB
  channelUsername?: string;
  // Поля для метадаты STORY_SHARE
  mediaUrl?: string;
  shareText?: string;
  widgetName?: string;
  widgetUrl?: string;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: TaskFormData;
  onFormDataChange: (data: TaskFormData) => void;
  onSave: () => void;
}

const TASK_CODES = {
  TELEGRAM_SUB: 'Подписка на канал Telegram',
  REF_USERS: 'Приглашение пользователей',
  STORY_SHARE: 'Поделиться историей',
  CHAT_BOOST: 'Буст чата'
};

export const TaskFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  onFormDataChange,
  onSave
}: TaskFormModalProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.type || formData.type.trim() === '') {
      newErrors.type = 'Тип задачи обязателен';
    }

    if (!formData.reward || formData.reward.trim() === '' || parseInt(formData.reward) <= 0) {
      newErrors.reward = 'Размер награды обязателен и должен быть больше 0';
    }

    if (!formData.rewardType || formData.rewardType.trim() === '') {
      newErrors.rewardType = 'Тип награды обязателен';
    }

    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Описание обязательно';
    }

    if (!formData.targetCount || formData.targetCount.trim() === '' || parseInt(formData.targetCount) <= 0) {
      newErrors.targetCount = 'Целевое количество обязательно и должно быть больше 0';
    }
    if (!formData.code || formData.code.trim() === '') {
      newErrors.code = 'Код задачи обязателен';
    }
    // Валидация метадаты для специальных кодов
    if (formData.code === 'TELEGRAM_SUB' || formData.code === 'CHAT_BOOST') {
      const channelUsername = getMetadataField('channelUsername');
      if (!channelUsername || channelUsername.trim() === '') {
        newErrors.channelUsername = 'Username канала обязателен';
      }
    }

    if (formData.code === 'STORY_SHARE') {
      const mediaUrl = getMetadataField('mediaUrl');
      const shareText = getMetadataField('shareText');
      const widgetName = getMetadataField('widgetName');
      const widgetUrl = getMetadataField('widgetUrl');
      
      if (!mediaUrl || mediaUrl.trim() === '') {
        newErrors.mediaUrl = 'URL медиа обязателен';
      }
      if (!shareText || shareText.trim() === '') {
        newErrors.shareText = 'Текст для шаринга обязателен';
      }
      if (!widgetName || widgetName.trim() === '') {
        newErrors.widgetName = 'Название виджета обязательно';
      }
      if (!widgetUrl || widgetUrl.trim() === '') {
        newErrors.widgetUrl = 'URL виджета обязателен';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave();
    }
  };

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
    onFormDataChange({ ...formData, [field]: value });
  };

  const handleCodeChange = (code: string) => {
    // Очищаем метадату при смене кода
    const newFormData: TaskFormData = {
      ...formData,
      code,
      metadata: '',
      channelUsername: '',
      mediaUrl: '',
      shareText: '',
      widgetName: '',
      widgetUrl: ''
    };
    onFormDataChange(newFormData);
  };

  const handleMetadataFieldChange = (field: string, value: string) => {
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
    
    const updated = { ...formData, [field]: value };
    
    // Формируем объект метадаты в зависимости от кода
    let metadataObj: Record<string, string | number> = {};
    
    if (formData.code === 'TELEGRAM_SUB') {
      metadataObj = {
        channelUsername: updated.channelUsername || ''
      };
    } else if (formData.code === 'STORY_SHARE') {
      metadataObj = {
        mediaUrl: updated.mediaUrl || '',
        shareText: updated.shareText || '',
        widgetName: updated.widgetName || '',
        widgetUrl: updated.widgetUrl || ''
      };
    } else if (formData.code === 'CHAT_BOOST') {
      metadataObj = {
        channelUsername: updated.channelUsername || ''
      };
    }
    
    updated.metadata = JSON.stringify(metadataObj);
    onFormDataChange(updated);
  };

  // Парсим метадату при загрузке формы для редактирования
  const parsedMetadata = useMemo(() => {
    if (!formData.metadata) return {};
    try {
      return JSON.parse(formData.metadata);
    } catch {
      return {};
    }
  }, [formData.metadata]);

  // Инициализируем поля метадаты из парсера
  const getMetadataField = (field: string, defaultValue: string = ''): string => {
    // Сначала проверяем parsedMetadata (из загруженной метадаты)
    if (parsedMetadata && parsedMetadata[field] !== undefined) {
      return String(parsedMetadata[field]);
    }
    // Затем проверяем прямые поля формы (которые могли быть установлены при редактировании)
    const fieldValue = field === 'channelUsername' ? formData.channelUsername :
                      field === 'mediaUrl' ? formData.mediaUrl :
                      field === 'shareText' ? formData.shareText :
                      field === 'widgetName' ? formData.widgetName :
                      field === 'widgetUrl' ? formData.widgetUrl : undefined;
    return fieldValue || defaultValue;
  };

  const selectedCodeKeys = useMemo(() => {
    return formData.code ? new Set([formData.code]) : new Set<string>();
  }, [formData.code]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-semibold">
            {isEditing ? 'Редактировать задачу' : 'Создать новую задачу'}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Тип задачи"
                isRequired
                isInvalid={!!errors.type}
                errorMessage={errors.type}
                selectedKeys={formData.type ? new Set([formData.type]) : new Set()}
                onSelectionChange={(keys) => handleInputChange('type', Array.from(keys)[0] as string)}
              >
                <SelectItem key="DAILY">Ежедневная</SelectItem>
                <SelectItem key="ONE_TIME">Одноразовая</SelectItem>
                <SelectItem key="SPECIAL">Особая</SelectItem>
              </Select>

              <Select
                label="Тип награды"
                isRequired
                isInvalid={!!errors.rewardType}
                errorMessage={errors.rewardType}
                selectedKeys={formData.rewardType ? new Set([formData.rewardType]) : new Set()}
                onSelectionChange={(keys) => handleInputChange('rewardType', Array.from(keys)[0] as string)}
              >
                <SelectItem key="energy">Энергия</SelectItem>
                <SelectItem key="tokens">Токены</SelectItem>
              </Select>
            </div>

            <Input
              label="Описание"
              isRequired
              isInvalid={!!errors.description}
              errorMessage={errors.description}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Введите описание задачи"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Размер награды"
                type="number"
                isRequired
                isInvalid={!!errors.reward}
                errorMessage={errors.reward}
                value={formData.reward}
                onChange={(e) => handleInputChange('reward', e.target.value)}
                placeholder="Введите размер награды"
                min="1"
              />

              <Input
                label="Целевое количество"
                type="number"
                isRequired
                isInvalid={!!errors.targetCount}
                errorMessage={errors.targetCount}
                value={formData.targetCount}
                onChange={(e) => handleInputChange('targetCount', e.target.value)}
                placeholder="Сколько раз нужно выполнить задачу"
                min="1"
              />
            </div>

            <Select
              label="Код задачи"
              selectedKeys={selectedCodeKeys}
              isRequired
              isInvalid={!!errors.code}
              errorMessage={errors.code}
              onSelectionChange={(keys) => {
                const code = Array.from(keys)[0] as string || '';
                handleCodeChange(code);
              }}
              placeholder="Выберите код задачи"
            >
              <SelectItem key="TELEGRAM_SUB">{TASK_CODES.TELEGRAM_SUB}</SelectItem>
              <SelectItem key="REF_USERS">{TASK_CODES.REF_USERS}</SelectItem>
              <SelectItem key="STORY_SHARE">{TASK_CODES.STORY_SHARE}</SelectItem>
              <SelectItem key="CHAT_BOOST">{TASK_CODES.CHAT_BOOST}</SelectItem>
            </Select>

            {/* Поля для TELEGRAM_SUB */}
            {formData.code === 'TELEGRAM_SUB' && (
              <Input
                label="Username канала (без @)"
                isRequired
                isInvalid={!!errors.channelUsername}
                errorMessage={errors.channelUsername}
                value={getMetadataField('channelUsername')}
                onChange={(e) => handleMetadataFieldChange('channelUsername', e.target.value)}
                placeholder="example_channel"
                description="Введите username канала без символа @"
              />
            )}

            {/* Поля для STORY_SHARE */}
            {formData.code === 'STORY_SHARE' && (
              <div className="space-y-3">
                <Input
                  label="URL медиа"
                  isRequired
                  isInvalid={!!errors.mediaUrl}
                  errorMessage={errors.mediaUrl}
                  value={getMetadataField('mediaUrl')}
                  onChange={(e) => handleMetadataFieldChange('mediaUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <Input
                  label="Текст для шаринга"
                  isRequired
                  isInvalid={!!errors.shareText}
                  errorMessage={errors.shareText}
                  value={getMetadataField('shareText')}
                  onChange={(e) => handleMetadataFieldChange('shareText', e.target.value)}
                  placeholder="To the gifts!"
                />
                <Input
                  label="Название виджета"
                  isRequired
                  isInvalid={!!errors.widgetName}
                  errorMessage={errors.widgetName}
                  value={getMetadataField('widgetName')}
                  onChange={(e) => handleMetadataFieldChange('widgetName', e.target.value)}
                  placeholder="Rocket"
                />
                <Input
                  label="URL виджета"
                  isRequired
                  isInvalid={!!errors.widgetUrl}
                  errorMessage={errors.widgetUrl}
                  value={getMetadataField('widgetUrl')}
                  onChange={(e) => handleMetadataFieldChange('widgetUrl', e.target.value)}
                  placeholder="https://t.me/your_widget"
                />
              </div>
            )}

            {/* Поля для CHAT_BOOST */}
            {formData.code === 'CHAT_BOOST' && (
              <Input
                label="Username канала (без @)"
                isRequired
                isInvalid={!!errors.channelUsername}
                errorMessage={errors.channelUsername}
                value={getMetadataField('channelUsername')}
                onChange={(e) => handleMetadataFieldChange('channelUsername', e.target.value)}
                placeholder="example_channel"
                description="Введите username канала без символа @"
              />
            )}

            {/* Общее поле метадаты для других случаев или ручного ввода */}
            {!formData.code && (
              <Textarea
                label="Метадата (JSON, опционально)"
                value={formData.metadata}
                onChange={(e) => handleInputChange('metadata', e.target.value)}
                placeholder='{"key": "value"}'
                minRows={3}
              />
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Отмена
          </Button>
          <Button color="primary" onPress={handleSave}>
            {isEditing ? 'Обновить' : 'Создать'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
