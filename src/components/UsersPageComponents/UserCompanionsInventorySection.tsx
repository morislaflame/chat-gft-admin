import React, { useState } from "react";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { PawPrint } from "lucide-react";
import {
  grantUserCompanion,
  revokeUserCompanion,
  type UserCompanionInventoryItem,
} from "@/http/companionAPI";

type UserCompanionsInventorySectionProps = {
  userId: number | string;
  items: UserCompanionInventoryItem[];
  loading: boolean;
  error: string | null;
  onChanged: () => void;
};

const UserCompanionsInventorySection: React.FC<UserCompanionsInventorySectionProps> = ({
  userId,
  items,
  loading,
  error,
  onChanged,
}) => {
  const [busyHistory, setBusyHistory] = useState<string | null>(null);

  const handleGrant = async (historyName: string) => {
    setBusyHistory(historyName);
    try {
      await grantUserCompanion(userId, historyName);
      onChanged();
    } catch (e) {
      console.error("Failed to grant companion:", e);
    } finally {
      setBusyHistory(null);
    }
  };

  const handleRevoke = async (historyName: string) => {
    if (!window.confirm(`Отозвать компаньона для ${historyName}?`)) return;
    setBusyHistory(historyName);
    try {
      await revokeUserCompanion(userId, historyName);
      onChanged();
    } catch (e) {
      console.error("Failed to revoke companion:", e);
    } finally {
      setBusyHistory(null);
    }
  };

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-violet-400" />
            Компаньоны
          </h3>
          <Chip size="sm" variant="flat" color="secondary">
            {items.filter((i) => i.owned).length} / {items.length}
          </Chip>
        </div>

        {error ? <div className="text-sm text-red-500">{error}</div> : null}

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            Ни для одной истории не настроен компаньон.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.historyName}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-700/60 p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {item.displayName || item.historyName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.companion.code} · {item.companion.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Chip size="sm" color={item.owned ? "success" : "default"} variant="flat">
                    {item.owned ? "Выдан" : "Не выдан"}
                  </Chip>
                  {item.owned ? (
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      isLoading={busyHistory === item.historyName}
                      onPress={() => void handleRevoke(item.historyName)}
                    >
                      Отозвать
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      color="secondary"
                      variant="flat"
                      isLoading={busyHistory === item.historyName}
                      onPress={() => void handleGrant(item.historyName)}
                    >
                      Выдать
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default UserCompanionsInventorySection;
