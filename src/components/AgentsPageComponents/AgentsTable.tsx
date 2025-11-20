import { 
  Chip,
  Button
} from '@heroui/react';
import { Edit, Trash2, Bot, Video } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { formatDate } from '@/utils/formatters';
import { type Agent } from '@/http/agentAPI';

interface AgentsTableProps {
  agents: Agent[];
  loading: boolean;
  onEditAgent: (agent: Agent) => void;
  onDeleteAgent: (id: number) => void;
}

export const AgentsTable = ({ 
  agents, 
  loading, 
  onEditAgent, 
  onDeleteAgent 
}: AgentsTableProps) => {
  const columns = [
    { key: 'name', label: 'HISTORY NAME' },
    { key: 'video', label: 'VIDEO' },
    { key: 'prompt', label: 'SYSTEM PROMPT' },
    { key: 'length', label: 'PROMPT LENGTH' },
    { key: 'created', label: 'CREATED' },
    { key: 'updated', label: 'UPDATED' },
    { key: 'actions', label: 'ACTIONS' },
  ];

  const renderCell = (agent: Agent, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return (
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">{agent.historyName}</p>
              <p className="text-sm text-gray-500">ID: {agent.id}</p>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="flex items-center">
            {agent.video ? (
              <Chip
                color="success"
                variant="flat"
                startContent={<Video className="w-4 h-4" />}
              >
                Has Video
              </Chip>
            ) : (
              <Chip
                color="default"
                variant="flat"
              >
                No Video
              </Chip>
            )}
          </div>
        );
      case 'prompt':
        return (
          <div className="max-w-md">
            <p className="text-sm text-gray-700 line-clamp-2">
              {agent.systemPrompt}
            </p>
          </div>
        );
      case 'length':
        return (
          <Chip 
            color={agent.systemPrompt.length > 500 ? 'success' : 'default'} 
            variant="flat"
          >
            {agent.systemPrompt.length} chars
          </Chip>
        );
      case 'created':
        return (
          <span className="text-sm text-gray-600">
            {formatDate(agent.createdAt)}
          </span>
        );
      case 'updated':
        return (
          <span className="text-sm text-gray-600">
            {formatDate(agent.updatedAt)}
          </span>
        );
      case 'actions':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Edit size={14} />}
              onClick={() => onEditAgent(agent)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={<Trash2 size={14} />}
              onClick={() => onDeleteAgent(agent.id)}
            >
              Delete
            </Button>
          </div>
        );
      default:
        return '-';
    }
  };

  return (
    <DataTable
      title={`All Agents (${agents.length})`}
      columns={columns}
      data={agents}
      loading={loading}
      renderCell={renderCell}
      emptyMessage="No agents found"
    />
  );
};

