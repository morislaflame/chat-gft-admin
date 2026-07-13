import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { PageHeader } from '@/components/ui';
import { AgentStats, AgentsTable } from '@/components/AgentsPageComponents';
import { exportAgentsData } from '@/http/agentAPI';
import { downloadBlob, exportFilename } from '@/utils/downloadFile';

const AgentsPage = observer(() => {
  const navigate = useNavigate();
  const { agent } = useContext(Context) as IStoreContext;
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    agent.fetchAllAgents();
  }, [agent]);

  const handleCreateAgent = () => {
    navigate('/agents/editor/new');
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const blob = await exportAgentsData();
      downloadBlob(blob, exportFilename('agents_export'));
    } catch (error) {
      console.error('Не удалось выгрузить данные агентов:', error);
      setToast({ message: 'Не удалось выгрузить данные', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setExportLoading(false);
    }
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
        description="Управление AI-агентами и их системными промптами. Награды за шаги и завершение миссий настраиваются на карточках миссий в редакторе агента."
        secondaryActionButton={{
          label: exportLoading ? 'Выгрузка...' : 'Выгрузить данные',
          icon: Download,
          onClick: () => void handleExportData(),
          variant: 'flat',
        }}
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
    </div>
  );
});

export default AgentsPage;
