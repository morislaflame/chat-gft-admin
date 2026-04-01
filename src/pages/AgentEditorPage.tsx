import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Button, Input, Switch, Textarea } from '@heroui/react';
import { ArrowLeft, Bot, Image, Save, Video } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { PageHeader } from '@/components/ui';
import { MediaUploadField } from '@/components/AgentsPageComponents/MediaUploadField';
import { AgentMissionsSection } from '@/components/AgentsPageComponents/AgentMissionsSection';
import { PromptStatistics } from '@/components/AgentsPageComponents/PromptStatistics';
import { AGENTS_ROUTE } from '@/utils/consts';

const AgentEditorPage = observer(() => {
  const { agent } = useContext(Context) as IStoreContext;
  const navigate = useNavigate();
  const { agentId } = useParams<{ agentId: string }>();

  const isCreateMode = agentId === 'new';
  const numericAgentId = isCreateMode ? null : Number(agentId);

  const selectedAgent = useMemo(() => {
    if (!numericAgentId || Number.isNaN(numericAgentId)) return null;
    return agent.agents.find((item) => item.id === numericAgentId) || null;
  }, [agent.agents, numericAgentId]);

  const [formData, setFormData] = useState({
    historyName: '',
    displayName: '',
    displayNameEn: '',
    systemPrompt: '',
    description: '',
    descriptionEn: '',
    orderIndex: '0',
    isActive: true,
  });

  useEffect(() => {
    agent.fetchAllAgents();
  }, [agent]);

  useEffect(() => {
    if (numericAgentId && !Number.isNaN(numericAgentId)) {
      agent.fetchAgentMissions(numericAgentId);
    }
  }, [agent, numericAgentId]);

  useEffect(() => {
    if (isCreateMode) {
      setFormData({
        historyName: '',
        displayName: '',
        displayNameEn: '',
        systemPrompt: '',
        description: '',
        descriptionEn: '',
        orderIndex: '0',
        isActive: true,
      });
      return;
    }

    if (selectedAgent) {
      setFormData({
        historyName: selectedAgent.historyName,
        displayName: selectedAgent.displayName || '',
        displayNameEn: selectedAgent.displayNameEn || '',
        systemPrompt: selectedAgent.systemPrompt,
        description: selectedAgent.description || '',
        descriptionEn: selectedAgent.descriptionEn || '',
        orderIndex: String(selectedAgent.orderIndex ?? 0),
        isActive: selectedAgent.isActive ?? true,
      });
    }
  }, [selectedAgent, isCreateMode]);

  const promptLength = formData.systemPrompt.length;
  const wordCount = formData.systemPrompt.split(/\s+/).filter(Boolean).length;

  const handleSave = async () => {
    if (!formData.historyName || !formData.systemPrompt) return;

    const payload = {
      historyName: formData.historyName,
      displayName: formData.displayName || null,
      displayNameEn: formData.displayNameEn || null,
      systemPrompt: formData.systemPrompt,
      description: formData.description || null,
      descriptionEn: formData.descriptionEn || null,
      orderIndex: parseInt(formData.orderIndex, 10) || 0,
      isActive: formData.isActive,
    };

    try {
      if (isCreateMode) {
        const created = await agent.createAgent(payload);
        navigate(`/agents/editor/${created.id}`);
      } else if (numericAgentId) {
        await agent.updateAgent(numericAgentId, payload);
        await agent.fetchAllAgents();
      }
    } catch (error) {
      console.error('Failed to save agent:', error);
    }
  };

  if (!isCreateMode && numericAgentId && !selectedAgent && !agent.loading) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="light" startContent={<ArrowLeft className="w-4 h-4" />} onPress={() => navigate(AGENTS_ROUTE)}>
          К списку агентов
        </Button>
        <p className="text-sm text-red-500">Агент не найден.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900 min-h-screen">
      <PageHeader
        title={isCreateMode ? 'Создание агента' : `Редактирование агента: ${selectedAgent?.displayName || selectedAgent?.historyName || ''}`}
        description={isCreateMode ? 'Создайте профиль нового AI-агента' : 'Обновляйте профиль агента, медиа и миссии'}
      />

      <div className="flex gap-2 sticky top-0 z-20 py-3 backdrop-blur-sm bg-white/70 dark:bg-zinc-950/60 rounded-xl border border-slate-200/60 dark:border-zinc-800 px-3">
        <Button variant="light" startContent={<ArrowLeft className="w-4 h-4" />} onPress={() => navigate(AGENTS_ROUTE)}>
          Назад
        </Button>
        <Button
          color="primary"
          startContent={<Save className="w-4 h-4" />}
          onPress={handleSave}
          isLoading={agent.loading}
          disabled={!formData.historyName || !formData.systemPrompt}
        >
          {isCreateMode ? 'Создать' : 'Сохранить изменения'}
        </Button>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <p className="text-lg font-extrabold uppercase tracking-[0.12em] text-white mb-4">Идентификация</p>
        <Input
          label="Название истории"
          value={formData.historyName}
          onChange={(e) => setFormData({ ...formData, historyName: e.target.value })}
          placeholder="например: starwars, harrypotter, default"
          isRequired
          startContent={<Bot className="w-4 h-4 text-gray-400" />}
          description="Уникальный идентификатор истории диалога для этого агента"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Отображаемое имя (RU / по умолчанию)"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            classNames={{
              input: 'font-semibold',
            }}
          />
          <Input
            label="Отображаемое имя (EN)"
            value={formData.displayNameEn}
            onChange={(e) => setFormData({ ...formData, displayNameEn: e.target.value })}
            classNames={{
              input: 'font-semibold',
            }}
          />
        </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <p className="text-lg font-extrabold uppercase tracking-[0.12em] text-white mb-4">Описания</p>
        <Textarea
          label="Описание (RU / по умолчанию)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          minRows={2}
          maxRows={4}
        />

        <Textarea
          label="Описание (EN)"
          value={formData.descriptionEn}
          onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
          minRows={2}
          maxRows={4}
          className="mt-4"
        />
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <p className="text-lg font-extrabold uppercase tracking-[0.12em] text-white mb-4">Видимость и порядок</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <Input
              label="Порядковый индекс"
              type="number"
              value={formData.orderIndex}
              onChange={(e) => setFormData({ ...formData, orderIndex: e.target.value })}
            />
            <div className="rounded-xl border border-slate-200 dark:border-zinc-700 p-4">
              <Switch isSelected={formData.isActive} onValueChange={(value) => setFormData({ ...formData, isActive: value })}>
                Активен
              </Switch>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-lg font-extrabold uppercase tracking-[0.12em] text-white">Системный промпт</p>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
              Основное поведение
            </span>
          </div>
        <Textarea
          label="Системный промпт"
          value={formData.systemPrompt}
          onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
          isRequired
          minRows={8}
          maxRows={12}
          description={`Количество символов: ${promptLength}`}
          classNames={{ input: 'resize-none text-[15px] leading-6' }}
        />

        <PromptStatistics promptLength={promptLength} wordCount={wordCount} />
        </div>
      </div>

      {!isCreateMode && selectedAgent ? (
        <>
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MediaUploadField
                label="Аватар агента"
                icon={<Image className="w-4 h-4" />}
                accept="image/*"
                mediaType="image"
                currentMedia={selectedAgent.avatar}
                onUpload={async (file) => {
                  await agent.uploadAvatar(selectedAgent.id, file);
                  await agent.fetchAllAgents();
                }}
                onDelete={async () => {
                  await agent.deleteAgentAvatar(selectedAgent.id);
                  await agent.fetchAllAgents();
                }}
              />

              <MediaUploadField
                label="Превью агента"
                icon={<Image className="w-4 h-4" />}
                accept="image/*,video/*,.json"
                mediaType="mixed"
                currentMedia={selectedAgent.preview}
                onUpload={async (file) => {
                  await agent.uploadPreview(selectedAgent.id, file);
                  await agent.fetchAllAgents();
                }}
                onDelete={async () => {
                  await agent.deleteAgentPreview(selectedAgent.id);
                  await agent.fetchAllAgents();
                }}
              />

              <MediaUploadField
                label="Фон агента"
                icon={<Image className="w-4 h-4" />}
                accept="image/*,video/*,.json"
                mediaType="mixed"
                currentMedia={selectedAgent.background}
                onUpload={async (file) => {
                  await agent.uploadBackground(selectedAgent.id, file);
                  await agent.fetchAllAgents();
                }}
                onDelete={async () => {
                  await agent.deleteAgentBackground(selectedAgent.id);
                  await agent.fetchAllAgents();
                }}
              />

              <MediaUploadField
                label="Видео агента"
                icon={<Video className="w-4 h-4" />}
                accept="video/*"
                mediaType="video"
                currentMedia={selectedAgent.video}
                onUpload={async (file) => {
                  await agent.uploadVideo(selectedAgent.id, file);
                  await agent.fetchAllAgents();
                }}
                onDelete={async () => {
                  await agent.deleteAgentVideo(selectedAgent.id);
                  await agent.fetchAllAgents();
                }}
              />
            </div>
          </div>

          <AgentMissionsSection
            missions={agent.getMissions(selectedAgent.id)}
            loading={agent.isMissionsLoading(selectedAgent.id)}
            agentId={selectedAgent.id}
            onCreateMission={async (missionData) => {
              await agent.createAgentMission(selectedAgent.id, missionData);
              await agent.fetchAgentMissions(selectedAgent.id);
            }}
            onUpdateMission={async (missionId, missionData) => {
              await agent.updateAgentMission(selectedAgent.id, missionId, missionData);
              await agent.fetchAgentMissions(selectedAgent.id);
            }}
            onDeleteMission={async (missionId) => {
              await agent.deleteAgentMission(selectedAgent.id, missionId);
              await agent.fetchAgentMissions(selectedAgent.id);
            }}
            onUploadMissionVideo={async (agentIdForMission, missionId, videoFile) => {
              await agent.uploadMissionVideo(agentIdForMission, missionId, videoFile);
              await agent.fetchAgentMissions(agentIdForMission);
            }}
            onDeleteMissionVideo={async (agentIdForMission, missionId) => {
              await agent.deleteMissionVideo(agentIdForMission, missionId);
              await agent.fetchAgentMissions(agentIdForMission);
            }}
          />
        </>
      ) : null}
    </div>
  );
});

export default AgentEditorPage;
