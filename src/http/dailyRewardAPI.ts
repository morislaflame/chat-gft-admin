import { $authHost } from "./index";

export interface DailyReward {
  id: number;
  day: number;
  reward: number;
  rewardType: 'energy' | 'tokens';
  rewardCaseId?: number | null;
  rewardCase?: {
    id: number;
    name: string;
    nameEn?: string | null;
    description?: string | null;
    descriptionEn?: string | null;
    price: number;
    isActive: boolean;
    image?: string | null;
    mediaFile?: { id: number; url: string; mimeType: string } | null;
  } | null;
  secondReward: number;
  secondRewardType: 'energy' | 'tokens' | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const createDailyReward = async (rewardData: {
  day: number;
  reward: number;
  rewardType: 'energy' | 'tokens';
  rewardCaseId?: number | null;
  secondReward?: number;
  secondRewardType?: 'energy' | 'tokens' | null;
  description: string;
}) => {
  const { data } = await $authHost.post('api/dailyReward/create', rewardData);
  return data;
};

export const getAllDailyRewards = async () => {
  const { data } = await $authHost.get('api/dailyReward/get');
  return data;
};

export const updateDailyRewardByDay = async (day: number, rewardData: {
  reward?: number;
  rewardType?: 'energy' | 'tokens';
  rewardCaseId?: number | null;
  secondReward?: number;
  secondRewardType?: 'energy' | 'tokens' | null;
  description?: string;
}) => {
  const { data } = await $authHost.put(`api/dailyReward/update/day/${day}`, rewardData);
  return data;
};

export const deleteDailyReward = async (id: number) => {
  const { data } = await $authHost.delete(`api/dailyReward/delete/${id}`);
  return data;
};

export const resetDailyRewards = async () => {
  const { data } = await $authHost.post('api/dailyReward/reset');
  return data;
};

