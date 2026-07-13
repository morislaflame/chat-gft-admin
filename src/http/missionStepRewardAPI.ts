import { $authHost } from "./index";

export interface MissionStepRewardMission {
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

export interface MissionStepReward {
  id: number;
  missionId: number;
  stepNumber: number;
  rewardGems: number;
  rewardEnergy: number;
  createdAt: string;
  mission?: MissionStepRewardMission | null;
}

export interface CreateMissionStepRewardData {
  missionId: number;
  stepNumber: number;
  rewardGems: number;
  rewardEnergy: number;
}

export interface UpdateMissionStepRewardData {
  rewardGems?: number;
  rewardEnergy?: number;
}

export const getAllMissionStepRewards = async (): Promise<MissionStepReward[]> => {
  const { data } = await $authHost.get("api/admin/mission-step-rewards");
  return data;
};

export const getMissionStepRewardById = async (id: number): Promise<MissionStepReward> => {
  const { data } = await $authHost.get(`api/admin/mission-step-rewards/${id}`);
  return data;
};

export const createMissionStepReward = async (
  payload: CreateMissionStepRewardData
): Promise<MissionStepReward> => {
  const { data } = await $authHost.post("api/admin/mission-step-rewards", payload);
  return data;
};

export const updateMissionStepReward = async (
  id: number,
  payload: UpdateMissionStepRewardData
): Promise<MissionStepReward> => {
  const { data } = await $authHost.put(`api/admin/mission-step-rewards/${id}`, payload);
  return data;
};

export const deleteMissionStepReward = async (id: number): Promise<void> => {
  await $authHost.delete(`api/admin/mission-step-rewards/${id}`);
};
