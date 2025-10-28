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
  metadata?: any;
}

interface TasksTableProps {
  tasks: Task[];
  loading: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

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

  const columns = [
    { key: 'type', label: 'TYPE' },
    { key: 'description', label: 'DESCRIPTION' },
    { key: 'reward', label: 'REWARD' },
    { key: 'target', label: 'TARGET' },
    { key: 'code', label: 'CODE' },
    { key: 'actions', label: 'ACTIONS' },
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
            {task.metadata && (
              <p className="text-sm text-gray-500">
                {JSON.stringify(task.metadata)}
              </p>
            )}
          </div>
        );
      case 'reward':
        return (
          <div className="flex items-center gap-2">
            <Chip color={getRewardTypeColor(task.rewardType)} size="sm">
              {task.rewardType}
            </Chip>
            <span className="font-semibold">{task.reward}</span>
          </div>
        );
      case 'target':
        return <span className="font-medium">{task.targetCount}</span>;
      case 'code':
        return task.code ? (
          <code className="px-2 py-1 rounded text-sm">
            {task.code}
          </code>
        ) : (
          <span className="text-gray-400">-</span>
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
              Edit
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={<Trash2 size={14} />}
              onClick={() => onDeleteTask(task.id)}
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
      title={`All Tasks (${tasks.length})`}
      columns={columns}
      data={tasks}
      loading={loading}
      renderCell={renderCell}
      emptyMessage="No tasks found"
    />
  );
};
