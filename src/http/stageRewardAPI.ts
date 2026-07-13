import { $authHost } from "./index";
import type { Mission } from "./agentAPI";
import type { Case } from "./caseAPI";

export interface StageRewardMission {
  id: number;
  agentId: number;
  title: string;
  titleEn?: string | null;
  orderIndex: number;
  level: number;
  agent?: {
    id: number;
    historyName: string;
    displayName?: string | null;
  } | null;
}

export interface StageReward {
  id: number;
  missionId: number;
  rewardAmount: number;
  rewardCaseId?: number | null;
  rewardCase?: Case | null;
  isActive: boolean;
  createdAt: string;
  mission?: StageRewardMission | null;
}

export interface CreateStageRewardData {
  missionId: number;
  rewardAmount: number;
  rewardCaseId?: number | null;
}

export interface UpdateStageRewardData {
  rewardAmount?: number;
  rewardCaseId?: number | null;
  isActive?: boolean;
}

export type { Mission };

export const getAllStageRewards = async (): Promise<StageReward[]> => {
  const { data } = await $authHost.get("api/admin/stage-rewards");
  return data;
};

export const getStageRewardById = async (id: number): Promise<StageReward> => {
  const { data } = await $authHost.get(`api/admin/stage-rewards/${id}`);
  return data;
};

export const createStageReward = async (
  rewardData: CreateStageRewardData
): Promise<StageReward> => {
  const { data } = await $authHost.post("api/admin/stage-rewards", rewardData);
  return data;
};

export const updateStageReward = async (
  id: number,
  rewardData: UpdateStageRewardData
): Promise<StageReward> => {
  const { data } = await $authHost.put(`api/admin/stage-rewards/${id}`, rewardData);
  return data;
};

export const deleteStageReward = async (id: number): Promise<void> => {
  await $authHost.delete(`api/admin/stage-rewards/${id}`);
};
