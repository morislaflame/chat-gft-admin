import { 
  Button,
  Chip
} from '@heroui/react';
import { Edit, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';

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

  const getRewardTypeColor = (type: string) => {
    return type === 'energy' ? 'secondary' : 'primary';
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

  const columns = [
    { key: 'type', label: 'ТИП' },
    { key: 'description', label: 'ОПИСАНИЕ' },
    { key: 'reward', label: 'НАГРАДА' },
    { key: 'target', label: 'ЦЕЛЬ' },
    { key: 'code', label: 'КОД' },
    { key: 'metadata', label: 'МЕТАДАННЫЕ' },
    { key: 'actions', label: 'ДЕЙСТВИЯ' },
  ];

  const renderCell = (task: Task, columnKey: string) => {
    switch (columnKey) {
      case 'type':
        return (
          <Chip color={getTaskTypeColor(task.type)} variant="flat">
            {task.type}
          </Chip>
        );
      case 'description':
        return (
          <div>
            <p className="font-medium">{task.description}</p>
          </div>
        );
      case 'reward':
        return (
          <div className="flex items-center gap-2">
            <Chip color={getRewardTypeColor(task.rewardType)} size="sm">
              {task.rewardType === 'energy' ? 'Энергия' : 'Токены'}
            </Chip>
            <span className="font-semibold">{task.reward}</span>
          </div>
        );
      case 'target':
        return <span className="font-medium">{task.targetCount}</span>;
      case 'code':
        return task.code ? (
          <Chip color="default" variant="flat" size="sm">
            {TASK_CODES[task.code] || task.code}
          </Chip>
        ) : (
          <span className="text-gray-400">-</span>
        );
      case 'metadata':
        return (
          <div className="max-w-xs">
            <p className="text-sm text-gray-300 break-words">
              {formatMetadata(task)}
            </p>
          </div>
        );
      case 'actions':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Edit size={14} />}
              onClick={() => onEditTask(task)}
            >
              Редактировать
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={<Trash2 size={14} />}
              onClick={() => onDeleteTask(task.id)}
            >
              Удалить
            </Button>
          </div>
        );
      default:
        return '-';
    }
  };

  return (
    <DataTable
      title={`Все задачи (${tasks.length})`}
      columns={columns}
      data={tasks}
      loading={loading}
      renderCell={renderCell}
      emptyMessage="Задачи не найдены"
    />
  );
};
