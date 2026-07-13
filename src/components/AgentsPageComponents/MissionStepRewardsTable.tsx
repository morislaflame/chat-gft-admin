import { Button, Card, CardBody, Input } from "@heroui/react";
import { Trash2, Gem, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import type { MissionStepReward } from "@/http/missionStepRewardAPI";

interface MissionStepRewardsTableProps {
  rewards: MissionStepReward[];
  loading: boolean;
  onDelete: (id: number) => void;
  onInlineUpdateReward: (
    reward: MissionStepReward,
    patch: { rewardGems?: number; rewardEnergy?: number }
  ) => Promise<void>;
  onInlineUpdateError: (message: string) => void;
}

type Draft = { rewardGems: string; rewardEnergy: string };

export const MissionStepRewardsTable = ({
  rewards,
  loading,
  onDelete,
  onInlineUpdateReward,
  onInlineUpdateError,
}: MissionStepRewardsTableProps) => {
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [savingField, setSavingField] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<number, Draft> = {};
    for (const reward of rewards) {
      next[reward.id] = {
        rewardGems: String(reward.rewardGems ?? 0),
        rewardEnergy: String(reward.rewardEnergy ?? 0),
      };
    }
    setDrafts(next);
  }, [rewards]);

  const saveFieldOnBlur = async (
    reward: MissionStepReward,
    field: "rewardGems" | "rewardEnergy"
  ) => {
    const key = `${reward.id}-${field}`;
    const current = drafts[reward.id];
    if (!current) return;

    const parsedValue = Number.parseInt(current[field] || "0", 10);
    const currentValue = Number(reward[field] ?? 0);
    if (parsedValue === currentValue) return;

    try {
      setSavingField((prev) => ({ ...prev, [key]: true }));
      await onInlineUpdateReward(reward, { [field]: parsedValue });
    } catch (error: unknown) {
      setDrafts((prev) => ({
        ...prev,
        [reward.id]: {
          rewardGems: String(reward.rewardGems ?? 0),
          rewardEnergy: String(reward.rewardEnergy ?? 0),
        },
      }));
      const maybeResponse = (error as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      onInlineUpdateError(
        maybeResponse ||
          (field === "rewardGems"
            ? "Не удалось сохранить кристаллы"
            : "Не удалось сохранить энергию")
      );
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
            Наград за шаги пока нет. Добавьте правила выдачи кристаллов и/или энергии за правильные
            шаги в любой миссии.
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
                <Gem className="w-5 h-5 text-amber-500 shrink-0" />
                <Input
                  type="number"
                  min={0}
                  size="md"
                  aria-label="Кристаллы"
                  value={drafts[reward.id]?.rewardGems ?? String(reward.rewardGems ?? 0)}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [reward.id]: {
                        rewardGems: e.target.value,
                        rewardEnergy: prev[reward.id]?.rewardEnergy ?? String(reward.rewardEnergy ?? 0),
                      },
                    }))
                  }
                  onBlur={() => saveFieldOnBlur(reward, "rewardGems")}
                  isDisabled={savingField[`${reward.id}-rewardGems`]}
                />
              </div>

              <div className="flex flex-row gap-2 items-center">
                <Zap className="w-5 h-5 text-yellow-400 shrink-0" />
                <Input
                  type="number"
                  min={0}
                  size="md"
                  aria-label="Энергия"
                  value={drafts[reward.id]?.rewardEnergy ?? String(reward.rewardEnergy ?? 0)}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [reward.id]: {
                        rewardGems: prev[reward.id]?.rewardGems ?? String(reward.rewardGems ?? 0),
                        rewardEnergy: e.target.value,
                      },
                    }))
                  }
                  onBlur={() => saveFieldOnBlur(reward, "rewardEnergy")}
                  isDisabled={savingField[`${reward.id}-rewardEnergy`]}
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
