import { $authHost } from "./index";

export interface WithdrawalRequest {
  id: number;
  userId: number;
  userRewardId: number;
  status: 'pending' | 'completed' | 'rejected';
  completedAt?: string;
  completedBy?: number;
  createdAt: string;
  updatedAt: string;
  userReward?: {
    id: number;
    userId: number;
    rewardId: number;
    purchasePrice: number;
    purchaseDate: string;
    reward?: {
      id: number;
      name: string;
      price: number;
      description?: string;
    };
  };
  user?: {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    telegramId?: number;
  };
  admin?: {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface WithdrawalRequestsResponse {
  requests: WithdrawalRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WithdrawalStatistics {
  total: {
    totalRequests: number;
    pendingRequests: number;
    completedRequests: number;
    rejectedRequests: number;
  };
  dailyStats: Array<{
    date: string;
    count: number;
    status: string;
  }>;
  rewardStats: Array<{
    rewardId: number;
    rewardName: string;
    requestCount: number;
  }>;
  hourlyStats: Array<{
    hour: number;
    count: number;
  }>;
}

export const createWithdrawalRequest = async (data: { userRewardId: number }) => {
  const { data: response } = await $authHost.post('api/withdrawal/create', data);
  return response;
};

export const getMyWithdrawalRequests = async () => {
  const { data } = await $authHost.get('api/withdrawal/my-requests');
  return data;
};

export const getAllWithdrawalRequests = async (params?: { status?: string; page?: number; limit?: number }) => {
  const { data } = await $authHost.get('api/withdrawal/all', { params });
  return data;
};

export const updateWithdrawalStatus = async (id: number, data: { status: 'pending' | 'completed' | 'rejected' }) => {
  const { data: response } = await $authHost.put(`api/withdrawal/${id}/update-status`, data);
  return response;
};

export const getWithdrawalStatistics = async (params?: { startDate?: string; endDate?: string }) => {
  const { data } = await $authHost.get('api/withdrawal/statistics', { params });
  return data;
};

