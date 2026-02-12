import { Button } from "@heroui/react";
import { Edit, Trash2, Footprints } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { formatDate } from "@/utils/formatters";
import type { MissionStepReward } from "@/http/missionStepRewardAPI";

interface MissionStepRewardsTableProps {
  rewards: MissionStepReward[];
  loading: boolean;
  onEdit: (reward: MissionStepReward) => void;
  onDelete: (id: number) => void;
}

export const MissionStepRewardsTable = ({
  rewards,
  loading,
  onEdit,
  onDelete,
}: MissionStepRewardsTableProps) => {
  const columns = [
    { key: "mission", label: "MISSION" },
    { key: "step", label: "STEP" },
    { key: "gems", label: "GEMS" },
    { key: "created", label: "CREATED" },
    { key: "actions", label: "ACTIONS" },
  ];

  const renderCell = (reward: MissionStepReward, columnKey: string) => {
    switch (columnKey) {
      case "mission":
        return (
          <div className="flex items-center gap-2">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <Footprints className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="font-medium">Mission {reward.missionOrderIndex}</span>
          </div>
        );
      case "step":
        return <span className="font-semibold">Step {reward.stepNumber}</span>;
      case "gems":
        return (
          <div>
            <span className="font-semibold text-lg text-amber-600 dark:text-amber-400">
              +{reward.rewardGems}
            </span>
            <span className="text-sm text-gray-500 ml-1">gems</span>
          </div>
        );
      case "created":
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(reward.createdAt)}
          </span>
        );
      case "actions":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Edit size={14} />}
              onPress={() => onEdit(reward)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={<Trash2 size={14} />}
              onPress={() => onDelete(reward.id)}
            >
              Delete
            </Button>
          </div>
        );
      default:
        return "—";
    }
  };

  return (
    <DataTable
      title="Step rewards"
      columns={columns}
      data={rewards}
      loading={loading}
      renderCell={renderCell}
      emptyMessage="No step rewards. Add rules to give gems for correct steps in missions 1 and 2."
    />
  );
};
