import { 
  Chip,
  Button,
  Card,
  CardBody
} from '@heroui/react';
import { Edit, Trash2, Video } from 'lucide-react';
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
  if (loading && agents.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (agents.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-gray-500">Агенты не найдены</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400">Все агенты ({agents.length})</div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="border border-zinc-700/70 bg-zinc-900/70">
            <CardBody className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-semibold text-white text-xl">{agent.displayName}</p>
                    <p className="text-xs text-zinc-400">ID: {agent.id}</p>
                  </div>
                </div>
                {agent.video ? (
                  <Chip color="success" variant="flat" startContent={<Video className="w-4 h-4" />}>
                    Есть видео
                  </Chip>
                ) : (
                  <Chip color="default" variant="flat">Нет видео</Chip>
                )}
              </div>

              <div className="rounded-lg bg-zinc-800/70 p-3 space-y-2">
                <p className="text-xs text-zinc-400">Системный промпт</p>
                <p className="text-sm text-zinc-200 line-clamp-3">{agent.systemPrompt}</p>
                <Chip color={agent.systemPrompt.length > 500 ? 'success' : 'default'} variant="flat" size="sm">
                  {agent.systemPrompt.length} симв.
                </Chip>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-zinc-800/60 p-2">
                  <p className="text-xs text-zinc-400">Создано</p>
                  <p className="text-zinc-200">{formatDate(agent.createdAt)}</p>
                </div>
                <div className="rounded-lg bg-zinc-800/60 p-2">
                  <p className="text-xs text-zinc-400">Обновлено</p>
                  <p className="text-zinc-200">{formatDate(agent.updatedAt)}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<Edit size={14} />}
                  onClick={() => onEditAgent(agent)}
                >
                  Изменить
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  startContent={<Trash2 size={14} />}
                  onClick={() => onDeleteAgent(agent.id)}
                >
                  Удалить
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

