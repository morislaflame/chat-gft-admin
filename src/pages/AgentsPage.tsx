import { useEffect, useState, useContext } from 'react';
import { useDisclosure } from '@heroui/react';
import { Plus } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { PageHeader } from '@/components/ui';
import { AgentStats, AgentsTable, AgentFormModal } from '@/components/AgentsPageComponents';
import { type Agent } from '@/http/agentAPI';

const AgentsPage = observer(() => {
  const { agent } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    historyName: '',
    systemPrompt: ''
  });

  useEffect(() => {
    agent.fetchAllAgents();
  }, [agent]);

  const handleCreateAgent = () => {
    setSelectedAgent(null);
    setIsEditing(false);
    setFormData({
      historyName: '',
      systemPrompt: ''
    });
    onOpen();
  };

  const handleEditAgent = (ag: Agent) => {
    setSelectedAgent(ag);
    setIsEditing(true);
    setFormData({
      historyName: ag.historyName,
      systemPrompt: ag.systemPrompt
    });
    onOpen();
  };

  const handleSaveAgent = async () => {
    try {
      const agentData = {
        historyName: formData.historyName,
        systemPrompt: formData.systemPrompt
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
    </div>
  );
});

export default AgentsPage;

