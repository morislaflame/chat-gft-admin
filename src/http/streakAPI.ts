import { $authHost } from './index';

export type StreakRewardKind = 'case' | 'reward' | 'energy' | 'gems';

export interface StreakRewardConfig {
  id: number;
  day: number;
  kind: StreakRewardKind;
  amount: number | null;
  caseId: number | null;
  rewardId: number | null;
  title: string;
  titleEn: string | null;
  imageUrl: string | null;
}

export const getStreakRewards = async (): Promise<StreakRewardConfig[]> => {
  const { data } = await $authHost.get<StreakRewardConfig[]>('api/streak/rewards');
  return data;
};

export const createStreakReward = async (payload: {
  day: number;
  kind: StreakRewardKind;
  amount?: number | null;
  caseId?: number | null;
  rewardId?: number | null;
}) => {
  const { data } = await $authHost.post<StreakRewardConfig>('api/streak/rewards', payload);
  return data;
};

export const deleteStreakReward = async (id: number) => {
  const { data } = await $authHost.delete(`api/streak/rewards/${id}`);
  return data;
};
