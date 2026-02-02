import { $authHost } from "./index";

export interface StageReward {
    id: number;
    stageNumber: number;
    rewardAmount: number;
    rewardCaseId?: number | null;
    rewardCase?: {
        id: number;
        name: string;
        nameEn?: string | null;
        description?: string | null;
        descriptionEn?: string | null;
        mediaFile?: { id: number; url: string; mimeType: string } | null;
    } | null;
    isActive: boolean;
    createdAt: string;
}

export interface CreateStageRewardData {
    stageNumber: number;
    rewardAmount: number;
    rewardCaseId?: number | null;
}

export interface UpdateStageRewardData {
    rewardAmount?: number;
    isActive?: boolean;
    rewardCaseId?: number | null;
}

export const getAllStageRewards = async () => {
    const { data } = await $authHost.get('api/admin/stage-rewards');
    return data;
};

export const getStageRewardByNumber = async (stageNumber: number) => {
    const { data } = await $authHost.get(`api/admin/stage-rewards/${stageNumber}`);
    return data;
};

export const createStageReward = async (rewardData: CreateStageRewardData) => {
    const { data } = await $authHost.post('api/admin/stage-rewards', rewardData);
    return data;
};

export const updateStageReward = async (stageNumber: number, rewardData: UpdateStageRewardData) => {
    const { data } = await $authHost.put(`api/admin/stage-rewards/${stageNumber}`, rewardData);
    return data;
};

export const deleteStageReward = async (stageNumber: number) => {
    const { data } = await $authHost.delete(`api/admin/stage-rewards/${stageNumber}`);
    return data;
};

