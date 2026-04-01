import { 
  Button,
  Chip,
  Card,
  CardBody
} from '@heroui/react';
import { Edit, Trash2, Zap, Gem } from 'lucide-react';

interface Task {
  id: number;
  type: string;
  description: string;
  reward: number;
  rewardType: string;
  targetCount: number;
  code?: string;
  metadata?: Record<string, unknown>;
}

interface TasksTableProps {
  tasks: Task[];
  loading: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

const TASK_CODES: Record<string, string> = {
  TELEGRAM_SUB: 'Подписка на канал Telegram',
  REF_USERS: 'Приглашение пользователей',
  STORY_SHARE: 'Поделиться историей',
  CHAT_BOOST: 'Буст чата'
};

export const TasksTable = ({ tasks, loading, onEditTask, onDeleteTask }: TasksTableProps) => {
  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'DAILY': return 'success';
      case 'ONE_TIME': return 'primary';
      case 'SPECIAL': return 'warning';
      default: return 'default';
    }
  };


  const getRewardTypeIcon = (type: string) => {
    return type === 'energy' ? <Zap className="w-5 h-5 text-purple-500" /> : <Gem className="w-5 h-5 text-amber-500" />;
  };

  const formatMetadata = (task: Task): string => {
    if (!task.metadata || Object.keys(task.metadata).length === 0) {
      return '-';
    }

    if (task.code === 'TELEGRAM_SUB') {
      const channelUsername = task.metadata.channelUsername;
      return `Канал: @${typeof channelUsername === 'string' ? channelUsername : 'не указан'}`;
    }

    if (task.code === 'CHAT_BOOST') {
      const channelUsername = task.metadata.channelUsername;
      return typeof channelUsername === 'string' && channelUsername
        ? `Канал: @${channelUsername}` 
        : '-';
    }

    if (task.code === 'STORY_SHARE') {
      const parts = [];
      const mediaUrl = task.metadata.mediaUrl;
      if (typeof mediaUrl === 'string' && mediaUrl) {
        parts.push(`Медиа: ${mediaUrl.substring(0, 30)}...`);
      }
      const shareText = task.metadata.shareText;
      if (typeof shareText === 'string' && shareText) {
        parts.push(`Текст: "${shareText}"`);
      }
      const widgetName = task.metadata.widgetName;
      if (typeof widgetName === 'string' && widgetName) {
        parts.push(`Виджет: ${widgetName}`);
      }
      return parts.length > 0 ? parts.join(' | ') : '-';
    }

    // Для других кодов или без кода показываем JSON
    try {
      return JSON.stringify(task.metadata);
    } catch {
      return '-';
    }
  };

  if (loading) {
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

  if (tasks.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-gray-500">Задачи не найдены</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400">Все задачи ({tasks.length})</div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="border border-zinc-700/70 bg-zinc-900/70">
            <CardBody className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Chip color={getTaskTypeColor(task.type)} variant="flat" size="sm">{task.type}</Chip>
                <Chip color="default" variant="flat" size="sm">{TASK_CODES[task.code || ""] || task.code || "-"}</Chip>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-xl">Награда:</span>
                {getRewardTypeIcon(task.rewardType)}
                <span className="font-semibold text-white text-xl">{task.reward}</span>
                
              </div>

              <p className="text-xs text-zinc-400">Количество для выполнения: {task.targetCount}</p>

              <p className="text-md line-clamp-2">{formatMetadata(task)}</p>

              <div className="flex justify-end gap-2 pt-1">
                <Button size="sm" color="primary" variant="flat" startContent={<Edit size={14} />} onClick={() => onEditTask(task)}>
                  Редактировать
                </Button>
                <Button size="sm" color="danger" variant="flat" startContent={<Trash2 size={14} />} onClick={() => onDeleteTask(task.id)}>
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
