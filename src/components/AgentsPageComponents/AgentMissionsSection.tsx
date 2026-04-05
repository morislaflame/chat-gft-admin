import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea } from '@heroui/react';
import { Target, Edit, Trash2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { CreateMissionData, Mission, UpdateMissionData } from '@/http/agentAPI';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useContext } from 'react';
import MissionPromptMentions from './MissionPromptMentions';
import { uiStepGoalsToEditableText } from '@/utils/missionUiStepGoalsForm';
import { MediaUploadField } from './MediaUploadField';

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

export const AgentMissionsSection: React.FC<AgentMissionsSectionProps> = ({
  missions,
  loading,
  agentId,
  onCreateMission,
  onUpdateMission,
  onDeleteMission,
  onUploadMissionVideo,
  onDeleteMissionVideo
}) => {
  const { artifact } = useContext(Context) as IStoreContext;
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [showMissionForm, setShowMissionForm] = useState(false);
  const [missionFormData, setMissionFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    missionPrompt: '',
    uiStepGoalsText: '',
    artifactIds: [] as number[],
    orderIndex: '',
    level: '1'
  });
  const [uploadingVideo, setUploadingVideo] = useState<Record<number, boolean>>({});
  const [deletingVideo, setDeletingVideo] = useState<Record<number, boolean>>({});

  useEffect(() => {
    artifact.fetchAllArtifacts();
    // Сбрасываем форму при изменении missions
    setEditingMission(null);
    setShowMissionForm(false);
    setMissionFormData({ title: '', titleEn: '', description: '', descriptionEn: '', missionPrompt: '', uiStepGoalsText: '', artifactIds: [], orderIndex: '', level: '1' });
  }, [missions, artifact]);

  const handleEditMission = (mission: Mission) => {
    setEditingMission(mission);
    setMissionFormData({
      title: mission.title,
      titleEn: mission.titleEn || '',
      description: mission.description || '',
      descriptionEn: mission.descriptionEn || '',
      missionPrompt: mission.missionPrompt || '',
      uiStepGoalsText: uiStepGoalsToEditableText(mission.uiStepGoals ?? null),
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
        // Всегда строка, чтобы ключ ушёл в JSON (axios выкидывает undefined).
        uiStepGoalsText: missionFormData.uiStepGoalsText ?? '',
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
      setMissionFormData({ title: '', titleEn: '', description: '', descriptionEn: '', missionPrompt: '', uiStepGoalsText: '', artifactIds: [], orderIndex: '', level: '1' });
    } catch (error) {
      console.error('Не удалось сохранить миссию:', error);
    }
  };

  const handleDeleteMission = async (missionId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту миссию?')) {
      try {
        await onDeleteMission(missionId);
      } catch (error) {
        console.error('Не удалось удалить миссию:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowMissionForm(false);
    setEditingMission(null);
    setMissionFormData({ title: '', titleEn: '', description: '', descriptionEn: '', missionPrompt: '', uiStepGoalsText: '', artifactIds: [], orderIndex: '', level: '1' });
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
      artifactIds: [],
      orderIndex: missions.length > 0 ? (Math.max(...missions.map(m => m.orderIndex)) + 1).toString() : '1',
      level: '1'
    });
    setShowMissionForm(true);
  };

  const sortedMissions = [...missions].sort((a, b) => a.orderIndex - b.orderIndex);

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
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-3">
                <Input
                  label="Order Index"
                  placeholder="Enter order index"
                  type="number"
                  value={missionFormData.orderIndex}
                  onChange={(e) => setMissionFormData({ ...missionFormData, orderIndex: e.target.value })}
                  isRequired
                  description="Lower number appears first"
                />
                <Input
                  label="Уровень миссии"
                  placeholder="1"
                  type="number"
                  min={1}
                  value={missionFormData.level}
                  onChange={(e) => setMissionFormData({ ...missionFormData, level: e.target.value })}
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
          ) : sortedMissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedMissions.map((mission) => (
                <div
                  key={mission.id}
                  className="border border-zinc-700/70 bg-zinc-900/70 rounded-xl p-4 space-y-4"
                >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-md font-semibold text-zinc-400">#{mission.orderIndex}</span>
                      <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                        Уровень {mission.level ?? 1}
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
};

