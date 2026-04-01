import { Button, Card, CardBody, Input } from "@heroui/react";
import { Trash2, Gem } from "lucide-react";
import { useEffect, useState } from "react";
import type { MissionStepReward } from "@/http/missionStepRewardAPI";

interface MissionStepRewardsTableProps {
  rewards: MissionStepReward[];
  loading: boolean;
  onDelete: (id: number) => void;
  onInlineUpdateReward: (reward: MissionStepReward, patch: { rewardGems?: number }) => Promise<void>;
  onInlineUpdateError: (message: string) => void;
}

export const MissionStepRewardsTable = ({
  rewards,
  loading,
  onDelete,
  onInlineUpdateReward,
  onInlineUpdateError,
}: MissionStepRewardsTableProps) => {
  const [drafts, setDrafts] = useState<Record<number, { rewardGems: string }>>({});
  const [savingField, setSavingField] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<number, { rewardGems: string }> = {};
    for (const reward of rewards) {
      next[reward.id] = { rewardGems: String(reward.rewardGems ?? 0) };
    }
    setDrafts(next);
  }, [rewards]);

  const saveRewardGemsOnBlur = async (reward: MissionStepReward) => {
    const key = `${reward.id}-rewardGems`;
    const current = drafts[reward.id];
    if (!current) return;

    const parsedValue = Number.parseInt(current.rewardGems || "0", 10);
    if (parsedValue === reward.rewardGems) return;

    try {
      setSavingField((prev) => ({ ...prev, [key]: true }));
      await onInlineUpdateReward(reward, { rewardGems: parsedValue });
    } catch (error: unknown) {
      setDrafts((prev) => ({ ...prev, [reward.id]: { rewardGems: String(reward.rewardGems ?? 0) } }));
      const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      onInlineUpdateError(maybeResponse || "Не удалось сохранить кристаллы");
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
          <div className="text-center py-8 text-gray-500">
            Наград за шаги пока нет. Добавьте правила выдачи кристаллов за правильные шаги в миссиях 1 и 2.
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400">Награды за шаги ({rewards.length})</div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {rewards.map((reward) => (
          <Card key={reward.id} className="border border-zinc-700/70 bg-zinc-900/70">
            <CardBody className="space-y-4">
              <div className="flex flex-col gap-2">
                <p className="font-semibold text-white text-xl">Миссия {reward.missionOrderIndex}</p>
                <p className="text-zinc-300">Шаг {reward.stepNumber}</p>
              </div>

              <div className="flex flex-row gap-2 items-center">
                <Gem className="w-5 h-5 text-amber-500" />
                <Input
                  type="number"
                  min={0}
                  size="md"
                  value={drafts[reward.id]?.rewardGems ?? String(reward.rewardGems)}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [reward.id]: { rewardGems: e.target.value } }))
                  }
                  onBlur={() => saveRewardGemsOnBlur(reward)}
                  isDisabled={savingField[`${reward.id}-rewardGems`]}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  startContent={<Trash2 size={14} />}
                  onPress={() => onDelete(reward.id)}
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
