import { 
  Button,
  Switch,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
} from '@heroui/react';
import { Trash2, Package, Gem } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type StageReward } from '@/http/stageRewardAPI';

interface StageRewardsTableProps {
  rewards: StageReward[];
  loading: boolean;
  onDeleteReward: (stageNumber: number) => void;
  onToggleActive: (stageNumber: number, isActive: boolean) => void;
  onInlineUpdateReward: (reward: StageReward, patch: { rewardAmount?: number; rewardCaseId?: number | null }) => Promise<void>;
  onInlineUpdateError: (message: string) => void;
  cases: Array<{ id: number; name: string }>;
}

export const StageRewardsTable = ({ 
  rewards, 
  loading, 
  onDeleteReward,
  onToggleActive,
  onInlineUpdateReward,
  onInlineUpdateError,
  cases
}: StageRewardsTableProps) => {
  const [drafts, setDrafts] = useState<Record<number, { rewardAmount: string; rewardCaseId: string }>>({});
  const [savingField, setSavingField] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<number, { rewardAmount: string; rewardCaseId: string }> = {};
    for (const reward of rewards) {
      next[reward.id] = {
        rewardAmount: String(reward.rewardAmount ?? 0),
        rewardCaseId: reward.rewardCaseId ? String(reward.rewardCaseId) : ''
      };
    }
    setDrafts(next);
  }, [rewards]);

  const setDraftField = (rewardId: number, field: 'rewardAmount' | 'rewardCaseId', value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [rewardId]: {
        rewardAmount: prev[rewardId]?.rewardAmount ?? '0',
        rewardCaseId: prev[rewardId]?.rewardCaseId ?? '',
        [field]: value
      }
    }));
  };

  const saveRewardAmountOnBlur = async (reward: StageReward) => {
    const key = `${reward.id}-rewardAmount`;
    const current = drafts[reward.id];
    if (!current) return;

    const parsedValue = Number.parseInt(current.rewardAmount || '0', 10);
    if (parsedValue === reward.rewardAmount) return;

    try {
      setSavingField((prev) => ({ ...prev, [key]: true }));
      await onInlineUpdateReward(reward, { rewardAmount: parsedValue });
    } catch (error: unknown) {
      setDraftField(reward.id, 'rewardAmount', String(reward.rewardAmount ?? 0));
      const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      onInlineUpdateError(maybeResponse || 'Не удалось сохранить сумму награды');
    } finally {
      setSavingField((prev) => ({ ...prev, [key]: false }));
    }
  };

  const saveCaseOnChange = async (reward: StageReward, nextCaseId: string) => {
    const key = `${reward.id}-rewardCaseId`;
    const parsedNextCaseId = nextCaseId ? Number.parseInt(nextCaseId, 10) : null;
    const originalCaseId = reward.rewardCaseId ?? null;
    if (parsedNextCaseId === originalCaseId) return;

    try {
      setSavingField((prev) => ({ ...prev, [key]: true }));
      await onInlineUpdateReward(reward, { rewardCaseId: parsedNextCaseId });
    } catch (error: unknown) {
      setDraftField(reward.id, 'rewardCaseId', reward.rewardCaseId ? String(reward.rewardCaseId) : '');
      const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      onInlineUpdateError(maybeResponse || 'Не удалось сохранить кейс награды');
    } finally {
      setSavingField((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading && rewards.length === 0) {
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

  if (rewards.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-gray-500">Награды за этапы не найдены</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400">Награды за этапы ({rewards.length})</div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {rewards.map((reward) => (
          <Card key={reward.id} className="border border-zinc-700/70 bg-zinc-900/70">
            <CardBody className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center justify-between w-full gap-3">
                  <div>
                    <p className="font-semibold text-white text-xl">Этап {reward.stageNumber}</p>
                  </div>
                  <Switch
                    isSelected={reward.isActive}
                    onValueChange={(isSelected) => onToggleActive(reward.stageNumber, isSelected)}
                    color="success"
                  />
                </div>
              </div>

              <div className="flex flex-row gap-2">
                <div className="flex items-center gap-2 text-zinc-200">
                  <Gem className="w-5 h-5 text-amber-500" />
                </div>
                <Input
                  type="number"
                  min={0}
                  size="md"
                  value={drafts[reward.id]?.rewardAmount ?? String(reward.rewardAmount)}
                  onChange={(e) => setDraftField(reward.id, 'rewardAmount', e.target.value)}
                  onBlur={() => saveRewardAmountOnBlur(reward)}
                  isDisabled={savingField[`${reward.id}-rewardAmount`]}
                />
              </div>

              <Select
                size="md"
                label="Кейс в награду"
                placeholder="Выберите кейс"
                items={[
                  { id: '__none__', label: 'Нет' },
                  ...cases.map((c) => ({ id: String(c.id), label: `${c.name} (#${c.id})` }))
                ]}
                selectedKeys={new Set([drafts[reward.id]?.rewardCaseId || '__none__'])}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string | undefined;
                  const nextCaseId = selected === '__none__' ? '' : (selected || '');
                  setDraftField(reward.id, 'rewardCaseId', nextCaseId);
                  void saveCaseOnChange(reward, nextCaseId);
                }}
                isDisabled={savingField[`${reward.id}-rewardCaseId`]}
                startContent={<Package className="w-4 h-4 text-zinc-400" />}
              >
                {(item) => <SelectItem key={item.id}>{item.label}</SelectItem>}
              </Select>


              <div className="flex justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  startContent={<Trash2 size={14} />}
                  onClick={() => onDeleteReward(reward.stageNumber)}
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

