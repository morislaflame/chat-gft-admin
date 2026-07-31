import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, Select, SelectItem, Switch } from '@heroui/react';
import { Target, Edit, Trash2, Plus, Gem, Package, Zap } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { CreateMissionData, Mission, UpdateMissionData } from '@/http/agentAPI';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import MissionPromptMentions from './MissionPromptMentions';
import { uiStepGoalsToEditableText } from '@/utils/missionUiStepGoalsForm';
import { MediaUploadField } from './MediaUploadField';
import type { StageReward } from '@/http/stageRewardAPI';
import type { MissionStepReward } from '@/http/missionStepRewardAPI';

interface AgentMissionsSectionProps {
  missions: Mission[];
  loading: boolean;
  agentId: number;
  onCreateMission: (missionData: CreateMissionData) => Promise<void>;
  onUpdateMission: (missionId: number, missionData: UpdateMissionData) => Promise<void>;
  onDeleteMission: (missionId: number) => Promise<void>;
  onUploadMissionVideo?: (agentId: number, missionId: number, videoFile: File) => Promise<void>;
  onDeleteMissionVideo?: (agentId: number, missionId: number) => Promise<void>;
}

type RewardDraft = {
  rewardAmount: string;
  rewardCaseId: string;
  isActive: boolean;
};

type StepRewardDraft = {
  rewardGems: string;
  rewardEnergy: string;
};

type NewStepRewardDraft = {
  stepNumber: string;
  rewardGems: string;
  rewardEnergy: string;
};

const emptyNewStepDraft = (stepNumber: number | string): NewStepRewardDraft => ({
  stepNumber: String(stepNumber),
  rewardGems: '0',
  rewardEnergy: '0',
});

export const AgentMissionsSection: React.FC<AgentMissionsSectionProps> = observer(({
  missions,
  loading,
  agentId,
  onCreateMission,
  onUpdateMission,
  onDeleteMission,
  onUploadMissionVideo,
  onDeleteMissionVideo
}) => {
  const { artifact, stageReward, missionStepReward, caseStore } = useContext(Context) as IStoreContext;
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [showMissionForm, setShowMissionForm] = useState(false);
  const [missionFormData, setMissionFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    missionPrompt: '',
    uiStepGoalsText: '',
    uiStepGoalsTextEn: '',
    artifactIds: [] as number[],
    orderIndex: '',
    level: '1'
  });
  const [uploadingVideo, setUploadingVideo] = useState<Record<number, boolean>>({});
  const [deletingVideo, setDeletingVideo] = useState<Record<number, boolean>>({});
  const [rewardDrafts, setRewardDrafts] = useState<Record<number, RewardDraft>>({});
  const [stepRewardDrafts, setStepRewardDrafts] = useState<Record<number, StepRewardDraft>>({});
  const [newStepDraftByMission, setNewStepDraftByMission] = useState<
    Record<number, NewStepRewardDraft>
  >({});
  const [savingRewardField, setSavingRewardField] = useState<Record<string, boolean>>({});
  const [rewardError, setRewardError] = useState<string | null>(null);

  const rewardsByMissionId = useMemo(() => {
    const map = new Map<number, StageReward>();
    for (const reward of stageReward.rewards) {
      map.set(reward.missionId, reward);
    }
    return map;
  }, [stageReward.rewards]);

  const stepRewardsByMissionId = useMemo(() => {
    const map = new Map<number, MissionStepReward[]>();
    for (const reward of missionStepReward.rewards) {
      const list = map.get(reward.missionId) ?? [];
      list.push(reward);
      map.set(reward.missionId, list);
    }
    for (const [missionId, list] of map) {
      map.set(
        missionId,
        list.slice().sort((a, b) => a.stepNumber - b.stepNumber)
      );
    }
    return map;
  }, [missionStepReward.rewards]);

  const getNextOrderIndexForLevel = (levelValue: string) => {
    const numericLevel = parseInt(levelValue, 10);
    const normalizedLevel = Number.isFinite(numericLevel) && numericLevel > 0 ? numericLevel : 1;
    const levelMissions = missions.filter((mission) => (mission.level ?? 1) === normalizedLevel);
    if (levelMissions.length === 0) return '1';
    return (Math.max(...levelMissions.map((mission) => mission.orderIndex)) + 1).toString();
  };

  const getNextStepNumber = (missionId: number) => {
    const steps = stepRewardsByMissionId.get(missionId) ?? [];
    if (steps.length === 0) return 1;
    return Math.max(...steps.map((s) => s.stepNumber)) + 1;
  };

  useEffect(() => {
    artifact.fetchAllArtifacts();
    void stageReward.fetchAllRewards();
    void missionStepReward.fetchAllRewards();
    void caseStore.fetchAllCasesAdmin();
  }, [artifact, stageReward, missionStepReward, caseStore]);

  useEffect(() => {
    setEditingMission(null);
    setShowMissionForm(false);
    setMissionFormData({ title: '', titleEn: '', description: '', descriptionEn: '', missionPrompt: '', uiStepGoalsText: '', uiStepGoalsTextEn: '', artifactIds: [], orderIndex: '', level: '1' });
  }, [missions]);

  useEffect(() => {
    const next: Record<number, RewardDraft> = {};
    for (const mission of missions) {
      const reward = rewardsByMissionId.get(mission.id);
      next[mission.id] = {
        rewardAmount: String(reward?.rewardAmount ?? 0),
        rewardCaseId: reward?.rewardCaseId ? String(reward.rewardCaseId) : '',
        isActive: reward?.isActive ?? true,
      };
    }
    setRewardDrafts(next);
  }, [missions, rewardsByMissionId]);

  useEffect(() => {
    const next: Record<number, StepRewardDraft> = {};
    for (const reward of missionStepReward.rewards) {
      next[reward.id] = {
        rewardGems: String(reward.rewardGems ?? 0),
        rewardEnergy: String(reward.rewardEnergy ?? 0),
      };
    }
    setStepRewardDrafts(next);
  }, [missionStepReward.rewards]);

  useEffect(() => {
    setNewStepDraftByMission((prev) => {
      const next: Record<number, NewStepRewardDraft> = {};
      for (const mission of missions) {
        const steps = stepRewardsByMissionId.get(mission.id) ?? [];
        const suggested =
          steps.length === 0 ? 1 : Math.max(...steps.map((s) => s.stepNumber)) + 1;
        const existing = prev[mission.id];
        const current = Number.parseInt(existing?.stepNumber || '', 10);
        const needsNewStep =
          !existing ||
          !Number.isFinite(current) ||
          steps.some((s) => s.stepNumber === current);
        next[mission.id] = {
          stepNumber: needsNewStep ? String(suggested) : existing.stepNumber,
          rewardGems: existing?.rewardGems ?? '0',
          rewardEnergy: existing?.rewardEnergy ?? '0',
        };
      }
      return next;
    });
  }, [missions, stepRewardsByMissionId]);

  const setNewStepDraftField = useCallback(
    (missionId: number, patch: Partial<NewStepRewardDraft>) => {
      setNewStepDraftByMission((prev) => ({
        ...prev,
        [missionId]: {
          ...emptyNewStepDraft(getNextStepNumber(missionId)),
          ...prev[missionId],
          ...patch,
        },
      }));
    },
    // getNextStepNumber depends on stepRewardsByMissionId via closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stepRewardsByMissionId]
  );

  const setRewardDraftField = useCallback(
    (missionId: number, patch: Partial<RewardDraft>) => {
      setRewardDrafts((prev) => ({
        ...prev,
        [missionId]: {
          rewardAmount: prev[missionId]?.rewardAmount ?? '0',
          rewardCaseId: prev[missionId]?.rewardCaseId ?? '',
          isActive: prev[missionId]?.isActive ?? true,
          ...patch,
        },
      }));
    },
    []
  );

  const setStepDraftField = useCallback(
    (rewardId: number, patch: Partial<StepRewardDraft>) => {
      setStepRewardDrafts((prev) => ({
        ...prev,
        [rewardId]: {
          rewardGems: prev[rewardId]?.rewardGems ?? '0',
          rewardEnergy: prev[rewardId]?.rewardEnergy ?? '0',
          ...patch,
        },
      }));
    },
    []
  );

  const saveMissionReward = useCallback(
    async (
      mission: Mission,
      patch: { rewardAmount?: number; rewardCaseId?: number | null; isActive?: boolean }
    ) => {
      const existing = rewardsByMissionId.get(mission.id);
      const nextAmount =
        patch.rewardAmount !== undefined
          ? patch.rewardAmount
          : (existing?.rewardAmount ?? (Number.parseInt(rewardDrafts[mission.id]?.rewardAmount || '0', 10) || 0));
      const nextCaseId =
        patch.rewardCaseId !== undefined
          ? patch.rewardCaseId
          : existing?.rewardCaseId ??
            (rewardDrafts[mission.id]?.rewardCaseId
              ? Number(rewardDrafts[mission.id].rewardCaseId)
              : null);
      const nextActive =
        patch.isActive !== undefined
          ? patch.isActive
          : existing?.isActive ?? rewardDrafts[mission.id]?.isActive ?? true;

      try {
        setRewardError(null);
        if (existing) {
          await stageReward.updateReward(existing.id, {
            rewardAmount: nextAmount,
            rewardCaseId: nextCaseId,
            isActive: nextActive,
          });
        } else {
          await stageReward.createReward({
            missionId: mission.id,
            rewardAmount: nextAmount,
            rewardCaseId: nextCaseId,
          });
          if (!nextActive) {
            const created = stageReward.rewards.find((r) => r.missionId === mission.id);
            if (created) {
              await stageReward.updateReward(created.id, { isActive: false });
            }
          }
        }
        await stageReward.fetchAllRewards();
      } catch (error: unknown) {
        const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message;
        setRewardError(maybeResponse || 'Не удалось сохранить награду за миссию');
        throw error;
      }
    },
    [rewardDrafts, rewardsByMissionId, stageReward]
  );

  const handleRewardAmountBlur = async (mission: Mission) => {
    const key = `${mission.id}-rewardAmount`;
    const draft = rewardDrafts[mission.id];
    if (!draft) return;
    const parsed = Number.parseInt(draft.rewardAmount || '0', 10);
    const existing = rewardsByMissionId.get(mission.id);
    if (existing && parsed === existing.rewardAmount) return;
    if (!existing && parsed === 0) return;

    try {
      setSavingRewardField((prev) => ({ ...prev, [key]: true }));
      await saveMissionReward(mission, { rewardAmount: parsed });
    } catch {
      setRewardDraftField(mission.id, {
        rewardAmount: String(existing?.rewardAmount ?? 0),
      });
    } finally {
      setSavingRewardField((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleRewardCaseChange = async (mission: Mission, nextCaseId: string) => {
    const key = `${mission.id}-rewardCaseId`;
    const parsed = nextCaseId ? Number.parseInt(nextCaseId, 10) : null;
    const existing = rewardsByMissionId.get(mission.id);
    const original = existing?.rewardCaseId ?? null;
    setRewardDraftField(mission.id, { rewardCaseId: nextCaseId });
    if (parsed === original && existing) return;

    try {
      setSavingRewardField((prev) => ({ ...prev, [key]: true }));
      await saveMissionReward(mission, { rewardCaseId: parsed });
    } catch {
      setRewardDraftField(mission.id, {
        rewardCaseId: existing?.rewardCaseId ? String(existing.rewardCaseId) : '',
      });
    } finally {
      setSavingRewardField((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleRewardActiveChange = async (mission: Mission, isActive: boolean) => {
    const key = `${mission.id}-isActive`;
    const existing = rewardsByMissionId.get(mission.id);
    setRewardDraftField(mission.id, { isActive });
    if (existing && existing.isActive === isActive) return;

    try {
      setSavingRewardField((prev) => ({ ...prev, [key]: true }));
      await saveMissionReward(mission, { isActive });
    } catch {
      setRewardDraftField(mission.id, { isActive: existing?.isActive ?? true });
    } finally {
      setSavingRewardField((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleStepFieldBlur = async (
    reward: MissionStepReward,
    field: 'rewardGems' | 'rewardEnergy'
  ) => {
    const key = `${reward.id}-${field}`;
    const draft = stepRewardDrafts[reward.id];
    if (!draft) return;
    const parsed = Number.parseInt(draft[field] || '0', 10);
    if (parsed === Number(reward[field] ?? 0)) return;

    try {
      setSavingRewardField((prev) => ({ ...prev, [key]: true }));
      setRewardError(null);
      await missionStepReward.updateReward(reward.id, { [field]: parsed });
      await missionStepReward.fetchAllRewards();
    } catch (error: unknown) {
      setStepDraftField(reward.id, {
        [field]: String(reward[field] ?? 0),
      });
      const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      setRewardError(maybeResponse || 'Не удалось сохранить награду за шаг');
    } finally {
      setSavingRewardField((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleAddStepReward = async (mission: Mission) => {
    const key = `${mission.id}-addStep`;
    const draft =
      newStepDraftByMission[mission.id] ?? emptyNewStepDraft(getNextStepNumber(mission.id));
    const stepNumber = Number.parseInt(draft.stepNumber, 10);
    const rewardGems = Number.parseInt(draft.rewardGems || '0', 10) || 0;
    const rewardEnergy = Number.parseInt(draft.rewardEnergy || '0', 10) || 0;
    if (!Number.isFinite(stepNumber) || stepNumber < 1) {
      setRewardError('Номер шага должен быть >= 1');
      return;
    }
    if (rewardGems < 0 || rewardEnergy < 0) {
      setRewardError('Размер награды не может быть отрицательным');
      return;
    }
    const existingSteps = stepRewardsByMissionId.get(mission.id) ?? [];
    if (existingSteps.some((s) => s.stepNumber === stepNumber)) {
      setRewardError(`Шаг ${stepNumber} уже есть у этой миссии`);
      return;
    }

    try {
      setSavingRewardField((prev) => ({ ...prev, [key]: true }));
      setRewardError(null);
      await missionStepReward.createReward({
        missionId: mission.id,
        stepNumber,
        rewardGems,
        rewardEnergy,
      });
      setNewStepDraftByMission((prev) => ({
        ...prev,
        [mission.id]: emptyNewStepDraft(stepNumber + 1),
      }));
      await missionStepReward.fetchAllRewards();
    } catch (error: unknown) {
      const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      setRewardError(maybeResponse || 'Не удалось добавить награду за шаг');
    } finally {
      setSavingRewardField((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleDeleteStepReward = async (reward: MissionStepReward) => {
    if (!window.confirm(`Удалить награду за шаг ${reward.stepNumber}?`)) return;
    try {
      setRewardError(null);
      await missionStepReward.deleteReward(reward.id);
      await missionStepReward.fetchAllRewards();
    } catch (error: unknown) {
      const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      setRewardError(maybeResponse || 'Не удалось удалить награду за шаг');
    }
  };

  const handleEditMission = (mission: Mission) => {
    setEditingMission(mission);
    setMissionFormData({
      title: mission.title,
      titleEn: mission.titleEn || '',
      description: mission.description || '',
      descriptionEn: mission.descriptionEn || '',
      missionPrompt: mission.missionPrompt || '',
      uiStepGoalsText: uiStepGoalsToEditableText(mission.uiStepGoals ?? null),
      uiStepGoalsTextEn: uiStepGoalsToEditableText(mission.uiStepGoalsEn ?? null),
      artifactIds: (mission.artifacts || []).map((a) => a.id),
      orderIndex: mission.orderIndex.toString(),
      level: (mission.level ?? 1).toString()
    });
    setShowMissionForm(true);
  };

  const handleSaveMission = async () => {
    if (!missionFormData.title || !missionFormData.orderIndex) return;
    
    try {
      const missionData: CreateMissionData | UpdateMissionData = {
        title: missionFormData.title,
        titleEn: missionFormData.titleEn || null,
        description: missionFormData.description || null,
        descriptionEn: missionFormData.descriptionEn || null,
        missionPrompt: missionFormData.missionPrompt || null,
        uiStepGoalsText: missionFormData.uiStepGoalsText ?? '',
        uiStepGoalsTextEn: missionFormData.uiStepGoalsTextEn ?? '',
        artifactIds: missionFormData.artifactIds,
        orderIndex: parseInt(missionFormData.orderIndex),
        level: missionFormData.level ? parseInt(missionFormData.level) : 1
      };

      if (editingMission) {
        await onUpdateMission(editingMission.id, missionData as UpdateMissionData);
      } else {
        await onCreateMission(missionData as CreateMissionData);
      }
      
      setShowMissionForm(false);
      setEditingMission(null);
      setMissionFormData({ title: '', titleEn: '', description: '', descriptionEn: '', missionPrompt: '', uiStepGoalsText: '', uiStepGoalsTextEn: '', artifactIds: [], orderIndex: '', level: '1' });
    } catch (error) {
      console.error('Не удалось сохранить миссию:', error);
    }
  };

  const handleDeleteMission = async (missionId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту миссию?')) {
      try {
        await onDeleteMission(missionId);
        await Promise.all([
          stageReward.fetchAllRewards(),
          missionStepReward.fetchAllRewards(),
        ]);
      } catch (error) {
        console.error('Не удалось удалить миссию:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowMissionForm(false);
    setEditingMission(null);
    setMissionFormData({ title: '', titleEn: '', description: '', descriptionEn: '', missionPrompt: '', uiStepGoalsText: '', uiStepGoalsTextEn: '', artifactIds: [], orderIndex: '', level: '1' });
  };

  const handleCreateNewMission = () => {
    setEditingMission(null);
    setMissionFormData({ 
      title: '', 
      titleEn: '',
      description: '', 
      descriptionEn: '',
      missionPrompt: '',
      uiStepGoalsText: '',
      uiStepGoalsTextEn: '',
      artifactIds: [],
      orderIndex: getNextOrderIndexForLevel('1'),
      level: '1'
    });
    setShowMissionForm(true);
  };

  const groupedMissionsByLevel = [...missions]
    .sort((a, b) => {
      const aLevel = a.level ?? 1;
      const bLevel = b.level ?? 1;
      if (aLevel !== bLevel) return aLevel - bLevel;
      return a.orderIndex - b.orderIndex;
    })
    .reduce<Record<number, Mission[]>>((acc, mission) => {
      const level = mission.level ?? 1;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(mission);
      return acc;
    }, {});

  const levelEntries = Object.entries(groupedMissionsByLevel)
    .map(([level, levelMissions]) => [parseInt(level, 10), levelMissions] as const)
    .sort((a, b) => a[0] - b[0]);

  return (
    <div className="border-t pt-4 mt-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Миссии</p>
        </div>
        {!showMissionForm && (
          <Button
            size="sm"
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onClick={handleCreateNewMission}
          >
            Создать миссию
          </Button>
        )}
      </div>

      {rewardError ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {rewardError}
        </div>
      ) : null}

      <Modal isOpen={showMissionForm} onClose={handleCancel} size="full" scrollBehavior="inside" className="dark">
        <ModalContent>
          <ModalHeader>
            <div className="w-full flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-white">{editingMission ? 'Редактирование миссии' : 'Создание новой миссии'}</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-3">
                <Input
                  label="Заголовок"
                  placeholder="Введите заголовок миссии"
                  value={missionFormData.title}
                  onChange={(e) => setMissionFormData({ ...missionFormData, title: e.target.value })}
                  isRequired
                  classNames={{
                    input: 'font-semibold',
                  }}
                />
                <Input
                  label="Заголовок (EN)"
                  placeholder="Введите заголовок миссии на английском (необязательно)"
                  value={missionFormData.titleEn}
                  onChange={(e) => setMissionFormData({ ...missionFormData, titleEn: e.target.value })}
                />
                <Textarea
                  label="Описание"
                  placeholder="Введите описание миссии (необязательно)"
                  value={missionFormData.description}
                  onChange={(e) => setMissionFormData({ ...missionFormData, description: e.target.value })}
                  minRows={2}
                />
                <Textarea
                  label="Описание (EN)"
                  placeholder="Введите описание миссии на английском (необязательно)"
                  value={missionFormData.descriptionEn}
                  onChange={(e) => setMissionFormData({ ...missionFormData, descriptionEn: e.target.value })}
                  minRows={2}
                />
                <Textarea
                  label="UI step goals (chat)"
                  placeholder={'1) Осмотреться и придумать план\n2) Найти вход\n…'}
                  value={missionFormData.uiStepGoalsText}
                  onChange={(e) => setMissionFormData({ ...missionFormData, uiStepGoalsText: e.target.value })}
                  minRows={5}
                  description="Один шаг на строку, нумерация как у main_step в LLM (1, 2, 3…). Сохраняется как JSON в миссии."
                />
                <Textarea
                  label="UI step goals (chat, EN)"
                  placeholder={'1) Look around and plan\n2) Find the entrance\n…'}
                  value={missionFormData.uiStepGoalsTextEn}
                  onChange={(e) => setMissionFormData({ ...missionFormData, uiStepGoalsTextEn: e.target.value })}
                  minRows={5}
                  description="English labels for the chat progress bar. Same numbering as main_step."
                />
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-3">
                <Input
                  label="Order Index"
                  placeholder="Enter order index"
                  type="number"
                  value={missionFormData.orderIndex}
                  onChange={(e) => setMissionFormData({ ...missionFormData, orderIndex: e.target.value })}
                  isRequired
                  description="Порядок внутри выбранного уровня (level)"
                />
                <Input
                  label="Уровень миссии"
                  placeholder="1"
                  type="number"
                  min={1}
                  value={missionFormData.level}
                  onChange={(e) => {
                    const nextLevel = e.target.value;
                    setMissionFormData((prev) => {
                      const previousLevel = prev.level || '1';
                      const previousOrder = parseInt(prev.orderIndex, 10);
                      const wasAutoSuggested =
                        !prev.orderIndex || previousOrder === parseInt(getNextOrderIndexForLevel(previousLevel), 10);
                      return {
                        ...prev,
                        level: nextLevel,
                        orderIndex: wasAutoSuggested ? getNextOrderIndexForLevel(nextLevel) : prev.orderIndex,
                      };
                    });
                  }}
                  isRequired
                  description="Уровень совпадает с уровнем артефактов этой миссии"
                />

                <div className="border border-zinc-700 rounded-lg p-3">
                  <p className="text-lg font-extrabold text-white mb-2">Видео миссии</p>
                  {editingMission && onUploadMissionVideo ? (
                    <MediaUploadField
                      label="Видео миссии"
                      accept="video/*"
                      mediaType="video"
                      currentMedia={editingMission.video || null}
                      onUpload={async (file) => {
                        setUploadingVideo((prev) => ({ ...prev, [editingMission.id]: true }));
                        try {
                          await onUploadMissionVideo(agentId, editingMission.id, file);
                        } finally {
                          setUploadingVideo((prev) => ({ ...prev, [editingMission.id]: false }));
                        }
                      }}
                      onDelete={onDeleteMissionVideo ? async () => {
                        setDeletingVideo((prev) => ({ ...prev, [editingMission.id]: true }));
                        try {
                          await onDeleteMissionVideo(agentId, editingMission.id);
                        } finally {
                          setDeletingVideo((prev) => ({ ...prev, [editingMission.id]: false }));
                        }
                      } : undefined}
                      uploading={uploadingVideo[editingMission.id] || false}
                      deleting={deletingVideo[editingMission.id] || false}
                    />
                  ) : (
                    <p className="text-xs text-zinc-500">
                      Видео можно загрузить после создания миссии.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
              <div className="text-lg font-extrabold text-white mb-2">
                Промпт миссии (LLM)
              </div>
              <div className="mb-3 rounded-lg border border-zinc-700 bg-zinc-900/70 p-3 text-xs text-zinc-300 space-y-1">
                <div>
                  Шаблон beat: контекст → карта «вариант → suggestions[].memory» прозой → «шаг
                  завершается, когда…» → машинные теги в конце.
                </div>
                <div className="text-zinc-400">
                  Теги <code>@progress</code> / <code>@memory</code> вырезаются из runtime-текста —
                  привязку флагов к кнопкам пишите обычным текстом внутри шага.
                </div>
                <div>
                  Поддерживаемые теги в <code>## Required beats</code>:
                </div>
                <div>
                  <code>@progress(flag)</code>, <code>@memory(flag)</code>,{" "}
                  <code>@memory_group(id: a | b)</code>, <code>@artifact(CODE)</code>,{" "}
                  <code>@artifact_side(K)</code>.
                </div>
                <div className="text-zinc-400">
                  <code>@progress</code> — закрытие шага. <code>@memory</code> /{" "}
                  <code>@memory_group</code> — исходы для следующих миссий (свитч «Память истории» у
                  агента; LLM пишет ключ в <code>suggestions[].memory</code>). После фиксации выбора
                  на шаге повторно флаги не ставятся — нарратив опирается на выбранный флаг.
                </div>
                <div className="text-zinc-400">
                  Пример: <code>- сотрудничество → suggestions[].memory = user_cooperate</code>
                </div>
                <div className="text-zinc-400">
                  <code>@artifact_side(K)</code>: RECEIVE в side-цепочке с K-го side-хода.
                </div>
              </div>
              <MissionPromptMentions
                value={missionFormData.missionPrompt}
                onChange={(next) => setMissionFormData({ ...missionFormData, missionPrompt: next })}
                artifacts={artifact.artifacts.map((a) => ({ id: a.id, code: a.code, name: a.name }))}
                minRows={14}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleCancel}>
              Закрыть
            </Button>
            <Button
              color="primary"
              onPress={handleSaveMission}
              disabled={!missionFormData.title || !missionFormData.orderIndex}
            >
              {editingMission ? 'Сохранить миссию' : 'Создать миссию'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {!showMissionForm ? (
        <div>
          {loading ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Загрузка миссий...</p>
            </div>
          ) : levelEntries.length > 0 ? (
            <div className="space-y-6">
              {levelEntries.map(([level, levelMissions]) => (
                <div key={level} className="space-y-3">
                  <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-2">
                    <h3 className="text-base font-semibold text-zinc-200">
                      Уровень {level}
                    </h3>
                    <span className="text-xs text-zinc-500">
                      Миссий: {levelMissions.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                    {levelMissions.map((mission) => {
                      const draft = rewardDrafts[mission.id] ?? {
                        rewardAmount: '0',
                        rewardCaseId: '',
                        isActive: true,
                      };
                      const stepRewards = stepRewardsByMissionId.get(mission.id) ?? [];
                      return (
                      <div
                        key={mission.id}
                        className="border border-zinc-700/70 bg-zinc-900/70 rounded-xl p-4 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-md font-semibold text-zinc-400">
                                №{mission.orderIndex}
                              </span>
                            </div>
                            <h4 className="text-lg font-semibold text-white leading-tight truncate">{mission.title}</h4>
                          </div>
                          <div className="flex gap-2 ml-2 shrink-0">
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              startContent={<Edit className="w-3 h-3" />}
                              onClick={() => handleEditMission(mission)}
                            >
                              Изменить
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              startContent={<Trash2 className="w-3 h-3" />}
                              onClick={() => handleDeleteMission(mission.id)}
                            >
                              Удалить
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-lg bg-zinc-800/70 p-3 space-y-2">
                          {mission.description ? (
                            <p className="text-sm text-zinc-200 line-clamp-3">{mission.description}</p>
                          ) : (
                            <p className="text-sm text-zinc-500">Без описания</p>
                          )}
                          {mission.descriptionEn ? (
                            <p className="text-xs text-zinc-500 line-clamp-2">EN: {mission.descriptionEn}</p>
                          ) : null}
                        </div>

                        <div className="rounded-lg border border-zinc-700/80 bg-zinc-950/40 p-3 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-zinc-200">Награда за завершение</p>
                            <Switch
                              size="sm"
                              isSelected={draft.isActive}
                              onValueChange={(value) => void handleRewardActiveChange(mission, value)}
                              isDisabled={savingRewardField[`${mission.id}-isActive`]}
                              color="success"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Gem className="w-4 h-4 text-amber-500 shrink-0" />
                            <Input
                              type="number"
                              min={0}
                              size="sm"
                              label="Кристаллы"
                              value={draft.rewardAmount}
                              onChange={(e) =>
                                setRewardDraftField(mission.id, { rewardAmount: e.target.value })
                              }
                              onBlur={() => void handleRewardAmountBlur(mission)}
                              isDisabled={savingRewardField[`${mission.id}-rewardAmount`]}
                            />
                          </div>
                          <Select
                            size="sm"
                            label="Кейс"
                            placeholder="Без кейса"
                            selectedKeys={new Set([draft.rewardCaseId || '__none__'])}
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys)[0] as string | undefined;
                              const nextCaseId = selected === '__none__' ? '' : selected || '';
                              void handleRewardCaseChange(mission, nextCaseId);
                            }}
                            isDisabled={savingRewardField[`${mission.id}-rewardCaseId`]}
                            startContent={<Package className="w-4 h-4 text-zinc-400" />}
                          >
                            {[
                              <SelectItem key="__none__" textValue="Нет">
                                Нет
                              </SelectItem>,
                              ...caseStore.cases.map((c) => (
                                <SelectItem key={String(c.id)} textValue={`${c.name} (#${c.id})`}>
                                  {c.name} (#{c.id})
                                </SelectItem>
                              )),
                            ]}
                          </Select>
                          <p className="text-[11px] text-zinc-500">
                            Сохраняется сразу при изменении. Если награды ещё нет — создаётся при первом сохранении.
                          </p>
                        </div>

                        <div className="rounded-lg border border-zinc-700/80 bg-zinc-950/40 p-3 space-y-3">
                          <p className="text-sm font-semibold text-zinc-200">Награды за шаги</p>
                          {stepRewards.length === 0 ? (
                            <p className="text-xs text-zinc-500">Пока нет — выдаются при росте main_step.</p>
                          ) : (
                            <div className="space-y-2">
                              {stepRewards.map((stepReward) => {
                                const stepDraft = stepRewardDrafts[stepReward.id] ?? {
                                  rewardGems: String(stepReward.rewardGems ?? 0),
                                  rewardEnergy: String(stepReward.rewardEnergy ?? 0),
                                };
                                return (
                                  <div
                                    key={stepReward.id}
                                    className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 p-2"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs font-medium text-zinc-300">
                                        Шаг {stepReward.stepNumber}
                                      </span>
                                      <Button
                                        size="sm"
                                        color="danger"
                                        variant="light"
                                        isIconOnly
                                        aria-label={`Удалить награду шага ${stepReward.stepNumber}`}
                                        onPress={() => void handleDeleteStepReward(stepReward)}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <Input
                                        type="number"
                                        min={0}
                                        size="sm"
                                        label="Кристаллы"
                                        startContent={<Gem className="w-3.5 h-3.5 text-amber-500" />}
                                        value={stepDraft.rewardGems}
                                        onChange={(e) =>
                                          setStepDraftField(stepReward.id, {
                                            rewardGems: e.target.value,
                                          })
                                        }
                                        onBlur={() =>
                                          void handleStepFieldBlur(stepReward, 'rewardGems')
                                        }
                                        isDisabled={
                                          savingRewardField[`${stepReward.id}-rewardGems`]
                                        }
                                      />
                                      <Input
                                        type="number"
                                        min={0}
                                        size="sm"
                                        label="Энергия"
                                        startContent={<Zap className="w-3.5 h-3.5 text-sky-400" />}
                                        value={stepDraft.rewardEnergy}
                                        onChange={(e) =>
                                          setStepDraftField(stepReward.id, {
                                            rewardEnergy: e.target.value,
                                          })
                                        }
                                        onBlur={() =>
                                          void handleStepFieldBlur(stepReward, 'rewardEnergy')
                                        }
                                        isDisabled={
                                          savingRewardField[`${stepReward.id}-rewardEnergy`]
                                        }
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                              <Input
                                type="number"
                                min={1}
                                size="sm"
                                label="Шаг"
                                value={
                                  newStepDraftByMission[mission.id]?.stepNumber ??
                                  String(getNextStepNumber(mission.id))
                                }
                                onChange={(e) =>
                                  setNewStepDraftField(mission.id, {
                                    stepNumber: e.target.value,
                                  })
                                }
                              />
                              <Input
                                type="number"
                                min={0}
                                size="sm"
                                label="Кристаллы"
                                startContent={<Gem className="w-3.5 h-3.5 text-amber-500" />}
                                value={newStepDraftByMission[mission.id]?.rewardGems ?? '0'}
                                onChange={(e) =>
                                  setNewStepDraftField(mission.id, {
                                    rewardGems: e.target.value,
                                  })
                                }
                              />
                              <Input
                                type="number"
                                min={0}
                                size="sm"
                                label="Энергия"
                                startContent={<Zap className="w-3.5 h-3.5 text-sky-400" />}
                                value={newStepDraftByMission[mission.id]?.rewardEnergy ?? '0'}
                                onChange={(e) =>
                                  setNewStepDraftField(mission.id, {
                                    rewardEnergy: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              className="w-full"
                              startContent={<Plus className="w-3.5 h-3.5" />}
                              isDisabled={savingRewardField[`${mission.id}-addStep`]}
                              onPress={() => void handleAddStepReward(mission)}
                            >
                              Добавить
                            </Button>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Пока нет миссий.</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
});
