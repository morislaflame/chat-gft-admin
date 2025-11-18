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
  const { agent, stageReward } = useContext(Context) as IStoreContext;
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
    systemPrompt: '',
    description: ''
  });
  const [rewardFormData, setRewardFormData] = useState({
    stageNumber: 1,
    rewardAmount: 100
  });

  useEffect(() => {
    agent.fetchAllAgents();
    stageReward.fetchAllRewards();
  }, [agent, stageReward]);

  const handleCreateAgent = () => {
    setSelectedAgent(null);
    setIsEditing(false);
    setFormData({
      historyName: '',
      systemPrompt: '',
      description: ''
    });
    onOpen();
  };

  const handleEditAgent = (ag: Agent) => {
    setSelectedAgent(ag);
    setIsEditing(true);
    setFormData({
      historyName: ag.historyName,
      systemPrompt: ag.systemPrompt,
      description: ag.description || ''
    });
    onOpen();
  };

  const handleSaveAgent = async () => {
    try {
      const agentData = {
        historyName: formData.historyName,
        systemPrompt: formData.systemPrompt,
        description: formData.description || null
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
      rewardAmount: 100
    });
    onRewardModalOpen();
  };

  const handleEditReward = (reward: StageReward) => {
    setSelectedReward(reward);
    setIsEditingReward(true);
    setRewardFormData({
      stageNumber: reward.stageNumber,
      rewardAmount: reward.rewardAmount
    });
    onRewardModalOpen();
  };

  const handleSaveReward = async () => {
    try {
      const rewardData = {
        stageNumber: rewardFormData.stageNumber,
        rewardAmount: rewardFormData.rewardAmount
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
        />
      </div>
    </div>
  );
});

export default AgentsPage;

