import { $authHost } from "./index";
import type { Artifact } from "./artifactAPI";

export interface ArtifactMarketStatRow {
  artifactId: number;
  artifact: Artifact | null;
  buyCount: number;
  sellCount: number;
  buyTotalPrice: number;
  sellTotalPrice: number;
}

export interface ArtifactMarketStatsResponse {
  stats: ArtifactMarketStatRow[];
  totals: {
    buyCount: number;
    sellCount: number;
    buyTotalPrice: number;
    sellTotalPrice: number;
  };
}

export type ArtifactEventType =
  | "RECEIVE"
  | "USE"
  | "BUY"
  | "SELL"
  | "BURN_LEVEL"
  | "FIRST_MISSION_GRANT"
  | "ADMIN_GRANT";

export interface ArtifactEventRow {
  id: number;
  userId: number;
  artifactId: number;
  historyName: string;
  type: ArtifactEventType;
  delta: number;
  quantityAfter: number | null;
  missionId: number | null;
  stepIndex: number | null;
  price: number | null;
  balanceBefore: number | null;
  balanceAfter: number | null;
  createdAt: string;
  artifact?: Artifact | null;
  mission?: { id: number; title: string; level: number; orderIndex: number } | null;
}

/** @deprecated use ArtifactEventRow */
export type ArtifactTransactionRow = ArtifactEventRow;

export interface UserArtifactEventsResponse {
  events: ArtifactEventRow[];
  totals: {
    buyCount: number;
    sellCount: number;
    buyTotalPrice: number;
    sellTotalPrice: number;
  };
}

/** @deprecated use UserArtifactEventsResponse */
export type UserArtifactTransactionsResponse = UserArtifactEventsResponse & {
  transactions: ArtifactEventRow[];
};

export const getArtifactMarketStats = async (): Promise<ArtifactMarketStatsResponse> => {
  const { data } = await $authHost.get("api/artifact-market/admin/stats");
  return data;
};

export const getUserArtifactEvents = async (
  userId: string | number,
  limit = 200
): Promise<UserArtifactEventsResponse> => {
  const { data } = await $authHost.get(`api/artifact-market/admin/user/${userId}/transactions`, {
    params: { limit },
  });
  return {
    events: data.events ?? data.transactions ?? [],
    totals: data.totals,
  };
};

/** @deprecated use getUserArtifactEvents */
export const getUserArtifactTransactions = getUserArtifactEvents;

export const ARTIFACT_EVENT_TYPE_LABELS: Record<ArtifactEventType, string> = {
  RECEIVE: "Находка в миссии",
  USE: "Применение в миссии",
  BUY: "Покупка",
  SELL: "Продажа",
  BURN_LEVEL: "Сжигание при открытии уровня",
  FIRST_MISSION_GRANT: "Награда за 1-ю миссию",
  ADMIN_GRANT: "Выдача админом",
};
