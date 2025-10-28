import { 
  Chip,
  Button,
  Image
} from '@heroui/react';
import { Edit, Trash2, Gift, Star } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { formatDate } from '@/utils/formatters';
import { type Reward } from '@/types/reward';

interface RewardsTableProps {
  rewards: Reward[];
  loading: boolean;
  onEditReward: (reward: Reward) => void;
  onDeleteReward: (id: number) => void;
}

export const RewardsTable = ({ 
  rewards, 
  loading, 
  onEditReward, 
  onDeleteReward 
}: RewardsTableProps) => {
  const columns = [
    { key: 'reward', label: 'REWARD' },
    { key: 'price', label: 'PRICE' },
    { key: 'status', label: 'STATUS' },
    { key: 'animation', label: 'ANIMATION' },
    { key: 'created', label: 'CREATED' },
    { key: 'actions', label: 'ACTIONS' },
  ];

  const renderCell = (reward: Reward, columnKey: string) => {
    switch (columnKey) {
      case 'reward':
        return (
          <div className="flex items-center space-x-3">
            {reward.reward?.url ? (
              <Image
                src={reward.reward.url}
                alt={reward.name}
                className="w-12 h-12 object-cover rounded-lg"
                fallbackSrc="https://via.placeholder.com/48x48"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <p className="font-medium">{reward.name}</p>
              <p className="text-sm text-gray-500">{reward.description}</p>
            </div>
          </div>
        );
      case 'price':
        return (
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">{reward.price}</span>
            {reward.tonPrice && (
              <p className="text-xs text-gray-500">{reward.tonPrice} TON</p>
            )}
          </div>
        );
      case 'status':
        return (
          <Chip 
            color={reward.isActive ? 'success' : 'danger'} 
            variant="flat"
          >
            {reward.isActive ? 'Active' : 'Inactive'}
          </Chip>
        );
      case 'animation':
        return reward.reward ? (
          <Chip color="success" variant="flat" size="sm">
            Has Animation
          </Chip>
        ) : (
          <Chip color="default" variant="flat" size="sm">
            No Animation
          </Chip>
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
      title={`All Rewards (${rewards.length})`}
      columns={columns}
      data={rewards}
      loading={loading}
      renderCell={renderCell}
      emptyMessage="No rewards found"
    />
  );
};
