import { useEffect, useState, useContext, useMemo } from "react";
import { useDisclosure } from "@heroui/react";
import { Plus } from "lucide-react";
import { observer } from "mobx-react-lite";
import { Context, type IStoreContext } from "@/store/StoreProvider";
import { PageHeader } from "@/components/ui";
import {
  CaseFormModal,
  CasesTable,
  type CaseFormData,
  type CaseItemForm,
} from "@/components/CasesPageComponents";
import { type Case } from "@/http/caseAPI";
import { type Reward } from "@/types/reward";

const createDefaultItem = (): CaseItemForm => ({
  type: "gems",
  rewardId: null,
  amount: null,
  weight: "",
});

const CasesPage = observer(() => {
  const { caseStore, reward } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<CaseFormData>({
    name: "",
    description: "",
    price: "",
    image: "",
    isActive: true,
    items: [createDefaultItem()],
  });

  useEffect(() => {
    caseStore.fetchAllCasesAdmin();
    reward.fetchAllRewards();
  }, [caseStore, reward]);

  const handleCreate = () => {
    setSelectedCase(null);
    setIsEditing(false);
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      isActive: true,
      items: [createDefaultItem()],
    });
    setImageFile(null);
    onOpen();
  };

  const handleEdit = (item: Case) => {
    setSelectedCase(item);
    setIsEditing(true);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      image: item.mediaFile?.url || item.image || "",
      isActive: item.isActive,
      items: (item.items || []).map((it) => ({
        id: it.id,
        type: it.type,
        rewardId: it.rewardId ?? null,
        amount: it.amount ?? null,
        weight: it.weight.toString(),
      })),
    });
    setImageFile(null);
    onOpen();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Удалить кейс?")) {
      await caseStore.deleteCase(id);
      caseStore.fetchAllCasesAdmin();
    }
  };

  const normalizedItems = useMemo(
    () =>
      formData.items.map((it) => ({
        type: it.type,
        rewardId: it.type === "reward" ? it.rewardId || undefined : undefined,
        amount: it.type === "reward" ? undefined : it.amount || 0,
        weight: parseFloat(it.weight),
      })),
    [formData.items]
  );

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseInt(formData.price),
        image: formData.image || undefined,
        isActive: formData.isActive,
        items: normalizedItems,
      };

      if (isEditing && selectedCase) {
        await caseStore.updateCase(selectedCase.id, payload, imageFile || undefined);
      } else {
        await caseStore.createCase(payload, imageFile || undefined);
      }

      await caseStore.fetchAllCasesAdmin();
      onClose();
    } catch (error) {
      console.error("Failed to save case", error);
    }
  };

  const rewardsList: Reward[] = reward.rewards;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Cases"
        description="Управление кейсами и их содержимым"
        actionButton={{
          label: "Создать кейс",
          icon: Plus,
          onClick: handleCreate,
        }}
      />

      <CasesTable
        cases={caseStore.cases}
        loading={caseStore.loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CaseFormModal
        isOpen={isOpen}
        onClose={onClose}
        isEditing={isEditing}
        formData={formData}
        onFormDataChange={setFormData}
        rewards={rewardsList}
        imageFile={imageFile}
        onImageFileChange={setImageFile}
        onSave={handleSave}
      />
    </div>
  );
});

export default CasesPage;
