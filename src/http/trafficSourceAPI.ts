import { $authHost } from "./index";

export interface TrafficSource {
  id: number;
  name: string;
  sourceUrl: string | null;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  usersCount?: number;
}

export interface GetTrafficSourcesResponse {
  sources: TrafficSource[];
}

export interface TrafficSourcesMetricsResponse {
  startDate: string; // YYYY-MM-DD
  activeDays: number;
  activeStartDate: string; // YYYY-MM-DD
  days: string[]; // YYYY-MM-DD[]
  sources: Array<
    TrafficSource & {
      activeUsersCount: number;
      metrics: {
        messagesTotal: number;
        rewardPurchasesTotal: number;
        energyOrdersTotal: number;
        energyStarsTotal: number;
        casePurchasesTotal: number;
      };
      series: {
        messages: number[];
        rewardPurchases: number[];
        energyOrders: number[];
        energyStars: number[];
        casePurchases: number[];
      };
    }
  >;
}

export const getTrafficSources = async (): Promise<GetTrafficSourcesResponse> => {
  const { data } = await $authHost.get("api/admin/traffic-sources");
  return data;
};

export const getTrafficSourcesMetrics = async (
  days = 30,
  activeDays = 7
): Promise<TrafficSourcesMetricsResponse> => {
  const { data } = await $authHost.get("api/admin/traffic-sources/metrics", {
    params: { days, activeDays },
  });
  return data;
};

export const createTrafficSource = async (payload: {
  name: string;
  sourceUrl?: string | null;
}): Promise<TrafficSource> => {
  const { data } = await $authHost.post("api/admin/traffic-sources", payload);
  return data;
};

export const updateTrafficSource = async (
  id: number,
  payload: Partial<{ name: string; sourceUrl: string | null; isActive: boolean }>
): Promise<TrafficSource> => {
  const { data } = await $authHost.put(`api/admin/traffic-sources/${id}`, payload);
  return data;
};

export const deleteTrafficSource = async (id: number): Promise<{ success: boolean }> => {
  const { data } = await $authHost.delete(`api/admin/traffic-sources/${id}`);
  return data;
};


