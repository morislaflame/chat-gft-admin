import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { Footprints, Gem, Zap } from "lucide-react";
import type { MissionStepReward } from "@/http/missionStepRewardAPI";
import { useState, useEffect, useRef } from "react";

interface MissionStepRewardFormData {
  missionOrderIndex: number;
  stepNumber: number;
  rewardGems: number;
  rewardEnergy: number;
}

interface MissionStepRewardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: MissionStepRewardFormData;
  onFormDataChange: (data: MissionStepRewardFormData) => void;
  onSave: () => void;
  existingReward?: MissionStepReward | null;
}

export const MissionStepRewardFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  onFormDataChange,
  onSave,
}: MissionStepRewardFormModalProps) => {
  const [missionDisplay, setMissionDisplay] = useState(String(formData.missionOrderIndex));
  const [stepDisplay, setStepDisplay] = useState(String(formData.stepNumber));
  const [gemsDisplay, setGemsDisplay] = useState(String(formData.rewardGems));
  const [energyDisplay, setEnergyDisplay] = useState(String(formData.rewardEnergy));
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setMissionDisplay(String(formData.missionOrderIndex));
      setStepDisplay(String(formData.stepNumber));
      setGemsDisplay(String(formData.rewardGems));
      setEnergyDisplay(String(formData.rewardEnergy));
    }
    prevOpenRef.current = isOpen;
  }, [
    isOpen,
    formData.missionOrderIndex,
    formData.stepNumber,
    formData.rewardGems,
    formData.rewardEnergy,
  ]);

  const handleNum = (field: keyof MissionStepRewardFormData, value: number) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const missionNum = parseInt(missionDisplay, 10);
  const stepNum = parseInt(stepDisplay, 10);
  const gemsNum = parseInt(gemsDisplay, 10);
  const energyNum = parseInt(energyDisplay, 10);
  const canSave =
    !Number.isNaN(missionNum) &&
    missionNum >= 1 &&
    !Number.isNaN(stepNum) &&
    stepNum >= 1 &&
    !Number.isNaN(gemsNum) &&
    gemsNum >= 0 &&
    !Number.isNaN(energyNum) &&
    energyNum >= 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-semibold">
            {isEditing ? "Редактировать награду за шаг" : "Добавить награду за шаг"}
          </h3>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Когда пользователь делает правильный шаг в миссии (прогресс растёт), он получает
            награду за номер этого шага. Можно выдать кристаллы, энергию или оба ресурса.
          </p>
          <div className="space-y-4">
            <Input
              label="Номер миссии"
              type="number"
              value={missionDisplay}
              onChange={(e) => {
                const v = e.target.value;
                setMissionDisplay(v);
                const n = parseInt(v, 10);
                if (!Number.isNaN(n)) handleNum("missionOrderIndex", n);
              }}
              min={1}
              isDisabled={isEditing}
              startContent={<Footprints className="w-4 h-4 text-gray-400" />}
              description="orderIndex миссии (1, 2, 3…)"
            />

            <Input
              label="Номер шага"
              type="number"
              value={stepDisplay}
              onChange={(e) => {
                const v = e.target.value;
                setStepDisplay(v);
                const n = parseInt(v, 10);
                if (!Number.isNaN(n)) handleNum("stepNumber", n);
              }}
              min={1}
              isDisabled={isEditing}
              description="За какой правильный шаг (1-й, 2-й, 3-й...) выдавать награду"
            />

            <Input
              label="Награда в кристаллах"
              type="number"
              value={gemsDisplay}
              onChange={(e) => {
                const v = e.target.value;
                setGemsDisplay(v);
                const n = parseInt(v, 10);
                if (!Number.isNaN(n)) handleNum("rewardGems", n);
              }}
              min={0}
              startContent={<Gem className="w-4 h-4 text-amber-500" />}
              description="Сколько кристаллов добавить пользователю (0 — без кристаллов)"
            />

            <Input
              label="Награда в энергии"
              type="number"
              value={energyDisplay}
              onChange={(e) => {
                const v = e.target.value;
                setEnergyDisplay(v);
                const n = parseInt(v, 10);
                if (!Number.isNaN(n)) handleNum("rewardEnergy", n);
              }}
              min={0}
              startContent={<Zap className="w-4 h-4 text-yellow-400" />}
              description="Сколько энергии добавить пользователю (0 — без энергии)"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Отмена
          </Button>
          <Button color="primary" onPress={onSave} isDisabled={!canSave}>
            {isEditing ? "Сохранить" : "Создать"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
