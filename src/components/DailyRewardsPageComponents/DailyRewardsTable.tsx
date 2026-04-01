import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem
} from '@heroui/react';
import { useEffect, useState } from 'react';
import { Trash2, Zap, Gem } from 'lucide-react';
import { type DailyReward } from '@/http/dailyRewardAPI';

interface DailyRewardsTableProps {
  rewards: DailyReward[];
  loading: boolean;
  onDeleteReward: (id: number) => void;
  onInlineUpdateReward: (reward: DailyReward, patch: {
    reward?: number;
    secondReward?: number;
    rewardCaseId?: number | null;
  }) => Promise<void>;
  onInlineUpdateError: (message: string) => void;
  cases: Array<{ id: number; name: string }>;
}

export const DailyRewardsTable = ({
  rewards,
  loading,
  onDeleteReward,
  onInlineUpdateReward,
  onInlineUpdateError,
  cases
}: DailyRewardsTableProps) => {
  const [drafts, setDrafts] = useState<Record<number, {
    reward: string;
    secondReward: string;
    rewardCaseId: string;
  }>>({});
  const [savingField, setSavingField] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<number, {
      reward: string;
      secondReward: string;
      rewardCaseId: string;
    }> = {};
    for (const reward of rewards) {
      next[reward.id] = {
        reward: String(reward.reward ?? 0),
        secondReward: String(reward.secondReward ?? 0),
        rewardCaseId: reward.rewardCaseId ? String(reward.rewardCaseId) : ''
      };
    }
    setDrafts(next);
  }, [rewards]);

  const setDraftField = (
    rewardId: number,
    field: 'reward' | 'secondReward' | 'rewardCaseId',
    value: string
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [rewardId]: {
        reward: prev[rewardId]?.reward ?? '0',
        secondReward: prev[rewardId]?.secondReward ?? '0',
        rewardCaseId: prev[rewardId]?.rewardCaseId ?? '',
        [field]: value
      }
    }));
  };

  const saveOnBlur = async (reward: DailyReward, field: 'reward' | 'secondReward') => {
    const key = `${reward.id}-${field}`;
    const current = drafts[reward.id];
    if (!current) return;

    const parsedValue = Number.parseInt(current[field] || '0', 10);
    const originalValue =
      field === 'reward'
        ? reward.reward
        : (reward.secondReward ?? 0);

    if (parsedValue === originalValue) return;

    try {
      setSavingField((prev) => ({ ...prev, [key]: true }));
      await onInlineUpdateReward(reward, { [field]: parsedValue });
    } catch (error: unknown) {
      let errorMessage = 'Не удалось сохранить изменение';
      if (typeof error === 'object' && error !== null) {
        const maybeResponse = error as { response?: { data?: { message?: string } } };
        if (maybeResponse.response?.data?.message) {
          errorMessage = maybeResponse.response.data.message;
        }
      }
      setDraftField(
        reward.id,
        field,
        String(
          field === 'reward'
            ? reward.reward
            : (reward.secondReward ?? 0)
        )
      );
      onInlineUpdateError(errorMessage);
    } finally {
      setSavingField((prev) => ({ ...prev, [key]: false }));
    }
  };

  const saveCaseOnChange = async (reward: DailyReward, nextCaseId: string) => {
    const key = `${reward.id}-rewardCaseId`;
    const parsedNextCaseId = nextCaseId ? Number.parseInt(nextCaseId, 10) : null;
    const originalCaseId = reward.rewardCaseId ?? null;
    if (parsedNextCaseId === originalCaseId) return;

    try {
      setSavingField((prev) => ({ ...prev, [key]: true }));
      await onInlineUpdateReward(reward, { rewardCaseId: parsedNextCaseId });
    } catch (error: unknown) {
      let errorMessage = 'Не удалось сохранить изменение кейса';
      if (typeof error === 'object' && error !== null) {
        const maybeResponse = error as { response?: { data?: { message?: string } } };
        if (maybeResponse.response?.data?.message) {
          errorMessage = maybeResponse.response.data.message;
        }
      }
      setDraftField(reward.id, 'rewardCaseId', reward.rewardCaseId ? String(reward.rewardCaseId) : '');
      onInlineUpdateError(errorMessage);
    } finally {
      setSavingField((prev) => ({ ...prev, [key]: false }));
    }
  };

  const isInitialLoading = loading && rewards.length === 0;

  if (isInitialLoading) {
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
          <div className="text-center py-8 text-gray-500">Ежедневные награды не настроены</div>
        </CardBody>
      </Card>
    );
  }

  const sorted = [...rewards].sort((a, b) => a.day - b.day);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400">Ежедневные награды ({rewards.length})</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {sorted.map((reward) => (
          <Card key={reward.id} className="border border-zinc-700/70 bg-zinc-900/70">
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between text-2xl font-bold text-white mb-2">
                  День {reward.day}
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

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-zinc-800/70 p-2">
                  <div className="flex items-center gap-1 text-xs text-zinc-300">
                    <Zap className="w-3.5 h-3.5 text-purple-500" />
                    Энергия
                  </div>
                  <Input
                    type="number"
                    min={0}
                    size="sm"
                    className="mt-1"
                    value={drafts[reward.id]?.reward ?? String(reward.reward)}
                    onChange={(e) => setDraftField(reward.id, 'reward', e.target.value)}
                    onBlur={() => saveOnBlur(reward, 'reward')}
                    isDisabled={savingField[`${reward.id}-reward`]}
                  />
                </div>
                <div className="rounded-lg bg-zinc-800/70 p-2">
                  <div className="flex items-center gap-1 text-xs text-zinc-300">
                    <Gem className="w-3.5 h-3.5 text-amber-500" />
                    Гемы
                  </div>
                  <Input
                    type="number"
                    min={0}
                    size="sm"
                    className="mt-1"
                    value={drafts[reward.id]?.secondReward ?? String(reward.secondReward ?? 0)}
                    onChange={(e) => setDraftField(reward.id, 'secondReward', e.target.value)}
                    onBlur={() => saveOnBlur(reward, 'secondReward')}
                    isDisabled={savingField[`${reward.id}-secondReward`]}
                  />
                </div>
              </div>


              <Select
                size="sm"
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
              >
                {(item) => <SelectItem key={item.id}>{item.label}</SelectItem>}
              </Select>

              <div className="flex justify-end gap-2 pt-1">
                
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

