import { 
  Chip,
  Button,
  Switch
} from '@heroui/react';
import { Edit, Trash2, Gift } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { formatDate } from '@/utils/formatters';
import { type StageReward } from '@/http/stageRewardAPI';

interface StageRewardsTableProps {
  rewards: StageReward[];
  loading: boolean;
  onEditReward: (reward: StageReward) => void;
  onDeleteReward: (stageNumber: number) => void;
  onToggleActive: (stageNumber: number, isActive: boolean) => void;
}

export const StageRewardsTable = ({ 
  rewards, 
  loading, 
  onEditReward, 
  onDeleteReward,
  onToggleActive
}: StageRewardsTableProps) => {
  const columns = [
    { key: 'stage', label: 'STAGE' },
    { key: 'reward', label: 'REWARD AMOUNT' },
    { key: 'status', label: 'STATUS' },
    { key: 'created', label: 'CREATED' },
    { key: 'actions', label: 'ACTIONS' },
  ];

  const renderCell = (reward: StageReward, columnKey: string) => {
    switch (columnKey) {
      case 'stage':
        return (
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Gift className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Stage {reward.stageNumber}</p>
              <p className="text-sm text-gray-500">ID: {reward.id}</p>
            </div>
          </div>
        );
      case 'reward':
        return (
          <div>
            <p className="font-semibold text-lg">{reward.rewardAmount}</p>
            <p className="text-sm text-gray-500">tokens</p>
          </div>
        );
      case 'status':
        return (
          <Switch
            isSelected={reward.isActive}
            onValueChange={(isSelected) => onToggleActive(reward.stageNumber, isSelected)}
            color="success"
          />
        );
      case 'created':
        return (
          <span className="text-sm text-gray-600">
            {formatDate(reward.createdAt)}
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
              onClick={() => onEditReward(reward)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={<Trash2 size={14} />}
              onClick={() => onDeleteReward(reward.stageNumber)}
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
      title={`Stage Rewards (${rewards.length})`}
      columns={columns}
      data={rewards}
      loading={loading}
      renderCell={renderCell}
      emptyMessage="No stage rewards found"
    />
  );
};

