import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Switch,
  Select,
  SelectItem,
} from "@heroui/react";
import { Plus, Trash2, Upload } from "lucide-react";
import { type Reward } from "@/types/reward";
import { useMemo, useState, useEffect } from "react";
import Lottie from "lottie-react";

export interface CaseItemForm {
  id?: number;
  type: "reward" | "gems" | "energy";
  rewardId?: number | null;
  amount?: number | null;
  weight: string;
}

export interface CaseFormData {
  name: string;
  description: string;
  price: string;
  image: string;
  isActive: boolean;
  items: CaseItemForm[];
}

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: CaseFormData;
  onFormDataChange: (data: CaseFormData) => void;
  rewards: Reward[];
  imageFile: File | null;
  onImageFileChange: (file: File | null) => void;
  onSave: () => void;
}

export const CaseFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  onFormDataChange,
  rewards,
  imageFile,
  onImageFileChange,
  onSave,
}: CaseFormModalProps) => {
  const totalWeight = useMemo(
    () =>
      formData.items.reduce((sum, item) => {
        const w = parseFloat(item.weight || "0");
        return sum + (isNaN(w) ? 0 : w);
      }, 0),
    [formData.items]
  );

  const [previewAnimation, setPreviewAnimation] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (imageFile && imageFile.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const animationData = JSON.parse(e.target?.result as string);
          setPreviewAnimation(animationData);
        } catch (error) {
          console.error("Error parsing JSON animation:", error);
          setPreviewAnimation(null);
        }
      };
      reader.readAsText(imageFile);
    } else {
      setPreviewAnimation(null);
    }
  }, [imageFile]);

  const handleInputChange = (field: keyof CaseFormData, value: string | boolean) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const handleItemChange = (
    index: number,
    field: keyof CaseItemForm,
    value: string | number | boolean | null
  ) => {
    const newItems = [...formData.items];
    if (field === "rewardId") {
      newItems[index].rewardId = value ? Number(value) : null;
    } else if (field === "amount") {
      newItems[index].amount = value === "" || value === null ? null : Number(value);
    } else if (field === "type") {
      newItems[index].type = value as CaseItemForm["type"];
    } else if (field === "weight") {
      newItems[index].weight = String(value ?? "");
    }
    onFormDataChange({ ...formData, items: newItems });
  };

  const handleAddItem = () => {
    onFormDataChange({
      ...formData,
      items: [
        ...formData.items,
        { type: "gems", rewardId: null, amount: null, weight: "" },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    onFormDataChange({ ...formData, items: newItems });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside" className='dark'>
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-semibold text-white">
            {isEditing ? "Редактировать кейс" : "Создать новый кейс"}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Название кейса"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Введите название"
              isRequired
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Цена"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="Стоимость в балансе"
                isRequired
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300 mb-1">Медиа (image/json)</label>
                <div className="border-2 border-dashed border-zinc-600 bg-zinc-800 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".json,image/*"
                    onChange={(e) => onImageFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                    id="case-media-upload"
                  />
                  <label
                    htmlFor="case-media-upload"
                    className="flex flex-col items-center justify-center cursor-pointer text-zinc-200"
                  >
                    <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                    <p className="text-sm">
                      {imageFile ? imageFile.name : "Нажмите, чтобы загрузить JSON или изображение"}
                    </p>
                    <p className="text-xs text-zinc-400">Поддерживается image/* и Lottie JSON</p>
                  </label>
                </div>
                {formData.image && !imageFile && (
                  <span className="text-xs text-zinc-400">Текущее: {formData.image}</span>
                )}
                {previewAnimation && (
                  <div className="mt-2 p-2 rounded bg-zinc-800">
                    <p className="text-xs text-zinc-300 mb-1">Превью анимации:</p>
                    <div className="flex justify-center">
                      <Lottie
                        animationData={previewAnimation}
                        loop
                        autoplay
                        style={{ width: 120, height: 120 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Textarea
              label="Описание"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Краткое описание кейса"
              minRows={2}
            />

            <div className="flex items-center gap-2">
              <Switch
                isSelected={formData.isActive}
                onValueChange={(value) => handleInputChange("isActive", value)}
              />
              <span className="text-sm text-zinc-200">Активен</span>
            </div>

            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">Айтемы кейса</h4>
              <Button
                size="sm"
                variant="flat"
                color="primary"
                startContent={<Plus size={16} />}
                onPress={handleAddItem}
              >
                Добавить
              </Button>
            </div>

            <div className="">
              {formData.items.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg py-4 grid grid-cols-12 gap-3 items-end"
                >
                  <div className="col-span-3">
                    <Select
                      label="Тип"
                      selectedKeys={new Set([item.type])}
                      onSelectionChange={(keys) => {
                        const key = Array.from(keys)[0] as CaseItemForm["type"] | undefined;
                        if (key) {
                          handleItemChange(idx, "type", key);
                        }
                      }}
                    >
                      <SelectItem key="reward">
                        Reward
                      </SelectItem>
                      <SelectItem key="gems">
                        Gems
                      </SelectItem>
                      <SelectItem key="energy">
                        Energy
                      </SelectItem>
                    </Select>
                  </div>

                  {item.type === "reward" ? (
                    <div className="col-span-3">
                      <Select
                        label="Награда"
                     
                        selectedKeys={
                          item.rewardId ? new Set([item.rewardId.toString()]) : new Set()
                        }
                        onSelectionChange={(keys) => {
                          const key = Array.from(keys)[0] as string | undefined;
                          handleItemChange(idx, "rewardId", key ? Number(key) : null);
                        }}
                        placeholder="Выберите награду"
                      >
                        {rewards.map((reward) => (
                          <SelectItem
                            key={reward.id.toString()}
                            textValue={reward.name}
                          >
                            {reward.name} {reward.onlyCase ? "(case only)" : ""}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  ) : (
                    <div className="col-span-3">
                      <Input
                        label={item.type === "gems" ? "Количество гемов" : "Количество энергии"}
                        type="number"
                        value={item.amount?.toString() || ""}
                        onChange={(e) => handleItemChange(idx, "amount", e.target.value)}
                        placeholder="Введите количество"
                        isRequired
                      />
                    </div>
                  )}

                  <div className="col-span-3">
                    <Input
                      label="Вес (в %)"
                      type="number"
                      value={item.weight}
                      onChange={(e) => handleItemChange(idx, "weight", e.target.value)}
                      placeholder="0-100"
                      isRequired
                    />
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <Button
                      color="danger"
                      variant="light"
                      startContent={<Trash2 size={16} />}
                      onPress={() => handleRemoveItem(idx)}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}

              {!formData.items.length && (
                <p className="text-sm text-zinc-400">Добавьте хотя бы один айтем.</p>
              )}
            </div>

            <div className="text-sm text-zinc-300">
              Суммарная вероятность:{" "}
              <span className={totalWeight > 100 ? "text-red-600 font-semibold" : "font-semibold"}>
                {totalWeight.toFixed(2)}%
              </span>{" "}
              (максимум 100%)
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
            disabled={!formData.name || !formData.price || !formData.items.length}
          >
            {isEditing ? "Обновить" : "Создать"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
