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

export interface ArtifactTransactionRow {
  id: number;
  userId: number;
  artifactId: number;
  historyName: string;
  type: "BUY" | "SELL";
  price: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
  artifact?: Artifact | null;
}

export interface UserArtifactTransactionsResponse {
  transactions: ArtifactTransactionRow[];
  totals: {
    buyCount: number;
    sellCount: number;
    buyTotalPrice: number;
    sellTotalPrice: number;
  };
}

export const getArtifactMarketStats = async (): Promise<ArtifactMarketStatsResponse> => {
  const { data } = await $authHost.get("api/artifact-market/admin/stats");
  return data;
};

export const getUserArtifactTransactions = async (
  userId: string | number,
  limit = 200
): Promise<UserArtifactTransactionsResponse> => {
  const { data } = await $authHost.get(`api/artifact-market/admin/user/${userId}/transactions`, {
    params: { limit },
  });
  return data;
};
