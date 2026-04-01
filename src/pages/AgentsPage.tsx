import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisclosure } from '@heroui/react';
import { Plus, Gift, Footprints } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { PageHeader } from '@/components/ui';
import { 
  AgentStats, 
  AgentsTable, 
  StageRewardsTable,
  StageRewardFormModal,
  StageRewardStats,
  MissionStepRewardsTable,
  MissionStepRewardFormModal
} from '@/components/AgentsPageComponents';
import { type StageReward } from '@/http/stageRewardAPI';
import { type MissionStepReward } from '@/http/missionStepRewardAPI';

const AgentsPage = observer(() => {
  const navigate = useNavigate();
  const { agent, stageReward, missionStepReward, caseStore } = useContext(Context) as IStoreContext;
  const { 
    isOpen: isRewardModalOpen, 
    onOpen: onRewardModalOpen, 
    onClose: onRewardModalClose 
  } = useDisclosure();
  const { 
    isOpen: isStepRewardModalOpen, 
    onOpen: onStepRewardModalOpen, 
    onClose: onStepRewardModalClose 
  } = useDisclosure();
  
  const [selectedReward, setSelectedReward] = useState<StageReward | null>(null);
  const [isEditingReward, setIsEditingReward] = useState(false);
  const [rewardFormData, setRewardFormData] = useState({
    stageNumber: 1,
    rewardAmount: 100,
    rewardCaseId: ''
  });
  const [stepRewardFormData, setStepRewardFormData] = useState({
    missionOrderIndex: 1,
    stepNumber: 1,
    rewardGems: 0
  });
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    agent.fetchAllAgents();
    stageReward.fetchAllRewards();
    missionStepReward.fetchAllRewards();
    caseStore.fetchAllCasesAdmin();
  }, [agent, stageReward, missionStepReward, caseStore]);

  const handleCreateAgent = () => {
    navigate('/agents/editor/new');
  };

  const handleDeleteAgent = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этого агента? Это действие нельзя отменить.')) {
      try {
        await agent.deleteAgent(id);
        agent.fetchAllAgents();
      } catch (error) {
        console.error('Не удалось удалить агента:', error);
      }
    }
  };

  const handleCreateReward = () => {
    setSelectedReward(null);
    setIsEditingReward(false);
    setRewardFormData({
      stageNumber: 1,
      rewardAmount: 100,
      rewardCaseId: ''
    });
    onRewardModalOpen();
  };

  const handleSaveReward = async () => {
    try {
      const rewardData = {
        stageNumber: rewardFormData.stageNumber,
        rewardAmount: rewardFormData.rewardAmount,
        rewardCaseId: rewardFormData.rewardCaseId ? Number(rewardFormData.rewardCaseId) : null
      };

      if (isEditingReward && selectedReward) {
        await stageReward.updateReward(selectedReward.stageNumber, rewardData);
      } else {
        await stageReward.createReward(rewardData);
      }
      
      onRewardModalClose();
      stageReward.fetchAllRewards();
    } catch (error) {
      console.error('Не удалось сохранить награду за этап:', error);
    }
  };

  const handleDeleteReward = async (stageNumber: number) => {
    if (window.confirm(`Удалить награду для этапа ${stageNumber}? Это действие нельзя отменить.`)) {
      try {
        await stageReward.deleteReward(stageNumber);
        stageReward.fetchAllRewards();
      } catch (error) {
        console.error('Не удалось удалить награду за этап:', error);
      }
    }
  };

  const handleToggleActive = async (stageNumber: number, isActive: boolean) => {
    try {
      await stageReward.updateReward(stageNumber, { isActive });
    } catch (error) {
      console.error('Не удалось изменить статус награды за этап:', error);
      setToast({ message: 'Не удалось изменить статус награды за этап', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleInlineUpdateStageReward = async (
    reward: StageReward,
    patch: { rewardAmount?: number; rewardCaseId?: number | null }
  ) => {
    await stageReward.updateReward(reward.stageNumber, patch);
  };

  const handleInlineUpdateStageRewardError = (message: string) => {
    setToast({ message, type: 'error' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateStepReward = () => {
    setStepRewardFormData({ missionOrderIndex: 1, stepNumber: 1, rewardGems: 0 });
    onStepRewardModalOpen();
  };

  const handleSaveStepReward = async () => {
    try {
      await missionStepReward.createReward({
        missionOrderIndex: stepRewardFormData.missionOrderIndex,
        stepNumber: stepRewardFormData.stepNumber,
        rewardGems: stepRewardFormData.rewardGems
      });
      onStepRewardModalClose();
      missionStepReward.fetchAllRewards();
    } catch (error) {
      console.error('Не удалось сохранить награду за шаг:', error);
    }
  };

  const handleInlineUpdateStepReward = async (
    reward: MissionStepReward,
    patch: { rewardGems?: number }
  ) => {
    await missionStepReward.updateReward(reward.id, patch);
  };

  const handleInlineUpdateStepRewardError = (message: string) => {
    setToast({ message, type: 'error' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteStepReward = async (id: number) => {
    if (window.confirm('Удалить эту награду за шаг? Это действие нельзя отменить.')) {
      try {
        await missionStepReward.deleteReward(id);
        missionStepReward.fetchAllRewards();
      } catch (error) {
        console.error('Не удалось удалить награду за шаг:', error);
      }
    }
  };

  const totalAgents = agent.agents.length;
  const avgPromptLength = agent.agents.length > 0
    ? agent.agents.reduce((sum, ag) => sum + ag.systemPrompt.length, 0) / agent.agents.length
    : 0;

  return (
    <div className="p-6 space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`rounded-lg px-4 py-3 text-sm shadow-lg border ${toast.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' : 'bg-green-500/90 border-green-400 text-white'}`}>
            {toast.message}
          </div>
        </div>
      )}

      <PageHeader
        title="Агенты"
        description="Управление AI-агентами и их системными промптами"
        actionButton={{
          label: "Создать агента",
          icon: Plus,
          onClick: handleCreateAgent
        }}
      />

      <AgentStats
        totalAgents={totalAgents}
        avgPromptLength={avgPromptLength}
      />

      <AgentsTable
        agents={agent.agents}
        loading={agent.loading}
        onEditAgent={(ag) => navigate(`/agents/editor/${ag.id}`)}
        onDeleteAgent={handleDeleteAgent}
      />

      {/* Stage Rewards Section */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <PageHeader
          title="Награды за миссии"
          description="Управление наградами за каждый Миссию истории"
          actionButton={{
            label: "Создать награду за миссию",
            icon: Gift,
            onClick: handleCreateReward
          }}
        />

        <div className="mt-6">
          <StageRewardStats rewards={stageReward.rewards} />
        </div>

        <div className="mt-6">
          <StageRewardsTable
            rewards={stageReward.rewards}
            loading={stageReward.loading}
            onDeleteReward={handleDeleteReward}
            onToggleActive={handleToggleActive}
            onInlineUpdateReward={handleInlineUpdateStageReward}
            onInlineUpdateError={handleInlineUpdateStageRewardError}
            cases={caseStore.cases}
          />
        </div>

        <StageRewardFormModal
          isOpen={isRewardModalOpen}
          onClose={onRewardModalClose}
          isEditing={isEditingReward}
          formData={rewardFormData}
          onFormDataChange={setRewardFormData}
          onSave={handleSaveReward}
          existingReward={selectedReward}
          cases={caseStore.cases}
        />
      </div>

      {/* Step Rewards (Missions 1 & 2) */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <PageHeader
          title="Награды за шаги (миссии 1 и 2)"
          description="Кристаллы за каждый правильный шаг в миссиях 1 и 2 (при росте прогресса)"
          actionButton={{
            label: "Создать награду за шаг",
            icon: Footprints,
            onClick: handleCreateStepReward
          }}
        />
        <div className="mt-6">
          <MissionStepRewardsTable
            rewards={missionStepReward.rewards}
            loading={missionStepReward.loading}
            onDelete={handleDeleteStepReward}
            onInlineUpdateReward={handleInlineUpdateStepReward}
            onInlineUpdateError={handleInlineUpdateStepRewardError}
          />
        </div>
        <MissionStepRewardFormModal
          isOpen={isStepRewardModalOpen}
          onClose={onStepRewardModalClose}
          isEditing={false}
          formData={stepRewardFormData}
          onFormDataChange={setStepRewardFormData}
          onSave={handleSaveStepReward}
        />
      </div>

    </div>
  );
});

export default AgentsPage;

