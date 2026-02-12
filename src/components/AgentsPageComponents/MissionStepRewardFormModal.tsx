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
} from "@heroui/react";
import { Footprints } from "lucide-react";
import type { MissionStepReward } from "@/http/missionStepRewardAPI";
import { useMemo, useState, useEffect, useRef } from "react";

interface MissionStepRewardFormData {
  missionOrderIndex: number;
  stepNumber: number;
  rewardGems: number;
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

const MISSION_OPTIONS = [
  { value: 1, label: "Mission 1" },
  { value: 2, label: "Mission 2" },
];

export const MissionStepRewardFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  onFormDataChange,
  onSave,
}: MissionStepRewardFormModalProps) => {
  const missionKeys = useMemo(
    () => new Set([String(formData.missionOrderIndex)]),
    [formData.missionOrderIndex]
  );

  const [stepDisplay, setStepDisplay] = useState(String(formData.stepNumber));
  const [rewardDisplay, setRewardDisplay] = useState(String(formData.rewardGems));
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setStepDisplay(String(formData.stepNumber));
      setRewardDisplay(String(formData.rewardGems));
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, formData.stepNumber, formData.rewardGems]);

  const handleNum = (field: keyof MissionStepRewardFormData, value: number) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const stepNum = parseInt(stepDisplay, 10);
  const rewardNum = parseInt(rewardDisplay, 10);
  const canSave =
    formData.missionOrderIndex >= 1 &&
    formData.missionOrderIndex <= 2 &&
    !Number.isNaN(stepNum) &&
    stepNum >= 1 &&
    !Number.isNaN(rewardNum) &&
    rewardNum >= 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-semibold">
            {isEditing ? "Edit step reward" : "Add step reward"}
          </h3>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            When the user makes a correct step in mission 1 or 2 (progress increases), they get the
            reward for that step number. Only missions 1 and 2 are supported.
          </p>
          <div className="space-y-4">
            <Select
              label="Mission"
              selectedKeys={missionKeys}
              onSelectionChange={(keys) => {
                const k = Array.from(keys)[0] as string | undefined;
                if (k) handleNum("missionOrderIndex", Number(k));
              }}
              isDisabled={isEditing}
              startContent={<Footprints className="w-4 h-4 text-gray-400" />}
            >
              {MISSION_OPTIONS.map((o) => (
                <SelectItem key={String(o.value)} textValue={o.label}>
                  {o.label}
                </SelectItem>
              ))}
            </Select>

            <Input
              label="Step number"
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
              description="Which correct step (1st, 2nd, 3rd...) gets this reward"
            />

            <Input
              label="Gems reward"
              type="number"
              value={rewardDisplay}
              onChange={(e) => {
                const v = e.target.value;
                setRewardDisplay(v);
                const n = parseInt(v, 10);
                if (!Number.isNaN(n)) handleNum("rewardGems", n);
              }}
              min={0}
              description="Gems to add to user balance"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={onSave} isDisabled={!canSave}>
            {isEditing ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
