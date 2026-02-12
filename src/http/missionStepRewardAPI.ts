import { $authHost } from "./index";

export interface MissionStepReward {
  id: number;
  missionOrderIndex: number;
  stepNumber: number;
  rewardGems: number;
  createdAt: string;
}

export interface CreateMissionStepRewardData {
  missionOrderIndex: number;
  stepNumber: number;
  rewardGems: number;
}

export interface UpdateMissionStepRewardData {
  rewardGems?: number;
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
