import { useEffect, useState, useContext } from 'react';
import { useDisclosure } from '@heroui/react';
import { Plus, Gift } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { PageHeader } from '@/components/ui';
import { 
  AgentStats, 
  AgentsTable, 
  AgentFormModal,
  StageRewardsTable,
  StageRewardFormModal,
  StageRewardStats
} from '@/components/AgentsPageComponents';
import { type Agent } from '@/http/agentAPI';
import { type StageReward } from '@/http/stageRewardAPI';

const AgentsPage = observer(() => {
  const { agent, stageReward, caseStore } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isRewardModalOpen, 
    onOpen: onRewardModalOpen, 
    onClose: onRewardModalClose 
  } = useDisclosure();
  
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedReward, setSelectedReward] = useState<StageReward | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingReward, setIsEditingReward] = useState(false);
  const [formData, setFormData] = useState({
    historyName: '',
    displayName: '',
    displayNameEn: '',
    systemPrompt: '',
    description: '',
    descriptionEn: '',
    orderIndex: '0',
    isActive: true
  });
  const [rewardFormData, setRewardFormData] = useState({
    stageNumber: 1,
    rewardAmount: 100,
    rewardCaseId: ''
  });

  useEffect(() => {
    agent.fetchAllAgents();
    stageReward.fetchAllRewards();
    caseStore.fetchAllCasesAdmin();
  }, [agent, stageReward, caseStore]);

  const handleCreateAgent = () => {
    setSelectedAgent(null);
    setIsEditing(false);
    setFormData({
      historyName: '',
      displayName: '',
      displayNameEn: '',
      systemPrompt: '',
      description: '',
      descriptionEn: '',
      orderIndex: '0',
      isActive: true
    });
    onOpen();
  };

  const handleEditAgent = async (ag: Agent) => {
    setSelectedAgent(ag);
    setIsEditing(true);
    setFormData({
      historyName: ag.historyName,
      displayName: ag.displayName || '',
      displayNameEn: ag.displayNameEn || '',
      systemPrompt: ag.systemPrompt,
      description: ag.description || '',
      descriptionEn: ag.descriptionEn || '',
      orderIndex: ag.orderIndex.toString(),
      isActive: ag.isActive ?? true
    });
    // Загружаем миссии для выбранного агента
    await agent.fetchAgentMissions(ag.id);
    onOpen();
  };

  const handleSaveAgent = async () => {
    try {
      const agentData = {
        historyName: formData.historyName,
        displayName: formData.displayName || null,
        displayNameEn: formData.displayNameEn || null,
        systemPrompt: formData.systemPrompt,
        description: formData.description || null,
        descriptionEn: formData.descriptionEn || null,
        orderIndex: parseInt(formData.orderIndex) || 0,
        isActive: formData.isActive
      };

      if (isEditing && selectedAgent) {
        await agent.updateAgent(selectedAgent.id, agentData);
      } else {
        await agent.createAgent(agentData);
      }
      
      onClose();
      agent.fetchAllAgents();
    } catch (error) {
      console.error('Failed to save agent:', error);
    }
  };

  const handleDeleteAgent = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      try {
        await agent.deleteAgent(id);
        agent.fetchAllAgents();
      } catch (error) {
        console.error('Failed to delete agent:', error);
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

  const handleEditReward = (reward: StageReward) => {
    setSelectedReward(reward);
    setIsEditingReward(true);
    setRewardFormData({
      stageNumber: reward.stageNumber,
      rewardAmount: reward.rewardAmount,
      rewardCaseId: reward.rewardCaseId ? String(reward.rewardCaseId) : ''
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
      console.error('Failed to save stage reward:', error);
    }
  };

  const handleDeleteReward = async (stageNumber: number) => {
    if (window.confirm(`Are you sure you want to delete the reward for stage ${stageNumber}? This action cannot be undone.`)) {
      try {
        await stageReward.deleteReward(stageNumber);
        stageReward.fetchAllRewards();
      } catch (error) {
        console.error('Failed to delete stage reward:', error);
      }
    }
  };

  const handleToggleActive = async (stageNumber: number, isActive: boolean) => {
    try {
      await stageReward.updateReward(stageNumber, { isActive });
      stageReward.fetchAllRewards();
    } catch (error) {
      console.error('Failed to toggle stage reward status:', error);
    }
  };

  const totalAgents = agent.agents.length;
  const avgPromptLength = agent.agents.length > 0
    ? agent.agents.reduce((sum, ag) => sum + ag.systemPrompt.length, 0) / agent.agents.length
    : 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Agents"
        description="Manage AI agents and their system prompts"
        actionButton={{
          label: "Create Agent",
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
        onEditAgent={handleEditAgent}
        onDeleteAgent={handleDeleteAgent}
      />

      <AgentFormModal
        isOpen={isOpen}
        onClose={onClose}
        isEditing={isEditing}
        formData={formData}
        onFormDataChange={setFormData}
        onSave={handleSaveAgent}
        selectedAgent={selectedAgent}
        missions={selectedAgent ? agent.getMissions(selectedAgent.id) : []}
        missionsLoading={selectedAgent ? agent.isMissionsLoading(selectedAgent.id) : false}
        onUploadVideo={async (agentId, videoFile) => {
          await agent.uploadVideo(agentId, videoFile);
          agent.fetchAllAgents();
        }}
        onUploadAvatar={async (agentId, avatarFile) => {
          await agent.uploadAvatar(agentId, avatarFile);
          agent.fetchAllAgents();
        }}
        onUploadPreview={async (agentId, previewFile) => {
          await agent.uploadPreview(agentId, previewFile);
          agent.fetchAllAgents();
        }}
        onUploadBackground={async (agentId, backgroundFile) => {
          await agent.uploadBackground(agentId, backgroundFile);
          agent.fetchAllAgents();
        }}
        onCreateMission={async (agentId, missionData) => {
          await agent.createAgentMission(agentId, missionData);
          agent.fetchAgentMissions(agentId);
        }}
        onUpdateMission={async (agentId, missionId, missionData) => {
          await agent.updateAgentMission(agentId, missionId, missionData);
          agent.fetchAgentMissions(agentId);
        }}
        onDeleteMission={async (agentId, missionId) => {
          await agent.deleteAgentMission(agentId, missionId);
          agent.fetchAgentMissions(agentId);
        }}
        onUploadMissionVideo={async (agentId, missionId, videoFile) => {
          await agent.uploadMissionVideo(agentId, missionId, videoFile);
          agent.fetchAgentMissions(agentId);
        }}
        onDeleteVideo={async (agentId) => {
          await agent.deleteAgentVideo(agentId);
          agent.fetchAllAgents();
        }}
        onDeleteAvatar={async (agentId) => {
          await agent.deleteAgentAvatar(agentId);
          agent.fetchAllAgents();
        }}
        onDeletePreview={async (agentId) => {
          await agent.deleteAgentPreview(agentId);
          agent.fetchAllAgents();
        }}
        onDeleteBackground={async (agentId) => {
          await agent.deleteAgentBackground(agentId);
          agent.fetchAllAgents();
        }}
        onDeleteMissionVideo={async (agentId, missionId) => {
          await agent.deleteMissionVideo(agentId, missionId);
          agent.fetchAgentMissions(agentId);
        }}
      />

      {/* Stage Rewards Section */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <PageHeader
          title="Stage Rewards"
          description="Manage rewards for each stage of the story (each story has 3 stages)"
          actionButton={{
            label: "Create Stage Reward",
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
            onEditReward={handleEditReward}
            onDeleteReward={handleDeleteReward}
            onToggleActive={handleToggleActive}
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

    </div>
  );
});

export default AgentsPage;

