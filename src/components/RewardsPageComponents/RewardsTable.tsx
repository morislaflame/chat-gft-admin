import {
  Chip,
  Button,
  Card,
  CardBody
} from '@heroui/react';
import { Edit, Trash2, Gift, Gem } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { type Reward } from '@/types/reward';
import { useMemo } from 'react';

interface RewardsTableProps {
  rewards: Reward[];
  loading: boolean;
  onEditReward: (reward: Reward) => void;
  onDeleteReward: (id: number) => void;
  onGeneratePreview: (reward: Reward) => void;
  previewGeneratingId: number | null;
}

export const RewardsTable = ({ 
  rewards, 
  loading, 
  onEditReward, 
  onDeleteReward,
  onGeneratePreview,
  previewGeneratingId
}: RewardsTableProps) => {
  const sortedRewards = useMemo(() => [...rewards].sort((a, b) => b.id - a.id), [rewards]);

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

  if (sortedRewards.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-gray-500">Награды не найдены</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400">Всего наград: {sortedRewards.length}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {sortedRewards.map((reward) => (
          <Card key={reward.id} className="border border-zinc-700/70 bg-zinc-900/70">
            <CardBody className="space-y-3">
              <div className="w-full h-40 rounded-xl overflow-hidden bg-zinc-800 flex items-center justify-center p-4">
                {reward.preview?.url ? (
                  <img
                    src={reward.preview.url}
                    alt={reward.name}
                    className="h-full object-cover block mx-auto"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br rounded-xl from-purple-400/30 to-pink-400/30 flex items-center justify-center">
                    <Gift className="w-10 h-10 text-white/80" />
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-white leading-tight">{reward.name}</p>
                <Chip color={reward.isActive ? 'success' : 'danger'} variant="flat" size="sm">
                  {reward.isActive ? 'Активна' : 'Неактивна'}
                </Chip>
              </div>

              <p className="text-xs text-zinc-400 line-clamp-2">{reward.description || 'Без описания'}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-zinc-200">
                  <Gem className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold text-white text-xl">{reward.price}</span>
                </div>
                {reward.tonPrice ? <span className="text-xs text-zinc-400">{reward.tonPrice} TON</span> : null}
              </div>

              <div className="text-xs text-zinc-500">{formatDate(reward.createdAt)}</div>

              <div className="flex justify-end gap-2 pt-1">
                {reward.mediaFile?.mimeType === 'application/json' && !reward.preview?.url ? (
                  <Button
                    size="sm"
                    color="secondary"
                    variant="flat"
                    isLoading={previewGeneratingId === reward.id}
                    onClick={() => onGeneratePreview(reward)}
                  >
                    Генерировать превью
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<Edit size={14} />}
                  onClick={() => onEditReward(reward)}
                >
                  Изменить
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  startContent={<Trash2 size={14} />}
                  onClick={() => onDeleteReward(reward.id)}
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
