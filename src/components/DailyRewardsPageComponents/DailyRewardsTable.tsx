import {
  Chip,
  Button,
} from '@heroui/react';
import { Edit, Trash2, Zap, Coins } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { formatDate } from '@/utils/formatters';
import { type DailyReward } from '@/http/dailyRewardAPI';

interface DailyRewardsTableProps {
  rewards: DailyReward[];
  loading: boolean;
  onEditReward: (reward: DailyReward) => void;
  onDeleteReward: (id: number) => void;
}

export const DailyRewardsTable = ({
  rewards,
  loading,
  onEditReward,
  onDeleteReward
}: DailyRewardsTableProps) => {
  const columns = [
    { key: 'day', label: 'DAY' },
    { key: 'rewards', label: 'REWARDS' },
    { key: 'description', label: 'DESCRIPTION' },
    { key: 'created', label: 'CREATED' },
    { key: 'actions', label: 'ACTIONS' },
  ];

  const renderCell = (reward: DailyReward, columnKey: string) => {
    switch (columnKey) {
      case 'day':
        return (
          <div className="flex items-center space-x-2">
            <Chip color="primary" variant="flat" size="lg">
              Day {reward.day}
            </Chip>
          </div>
        );
      case 'reward':
      case 'rewards':
        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold">{reward.reward}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Coins className="w-4 h-4 text-green-500" />
              <span className="font-semibold">{reward.secondReward}</span>
            </div>
          </div>
        );
      case 'description':
        return (
          <span className="text-sm text-gray-700 max-w-xs truncate">
            {reward.description}
          </span>
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
              onClick={() => onDeleteReward(reward.id)}
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
      title={`Daily Rewards (${rewards.length})`}
      columns={columns}
      data={rewards}
      loading={loading}
      renderCell={renderCell}
      emptyMessage="No daily rewards configured"
    />
  );
};

