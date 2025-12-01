import { $authHost } from "./index";

export interface MediaFile {
    id: number;
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    bucket: string;
    url: string | null;
    entityType: string;
    entityId: number | null;
    createdAt: string;
}

export interface Agent {
    id: number;
    historyName: string;
    systemPrompt: string;
    description?: string | null;
    videoId?: number | null;
    avatarId?: number | null;
    previewId?: number | null;
    backgroundId?: number | null;
    createdAt: string;
    updatedAt: string;
    video?: MediaFile | null;
    avatar?: MediaFile | null;
    preview?: MediaFile | null;
    background?: MediaFile | null;
}

export interface CreateAgentData {
    historyName: string;
    systemPrompt: string;
    description?: string | null;
}

export interface UpdateAgentData {
    historyName?: string;
    systemPrompt?: string;
    description?: string | null;
    videoId?: number | null;
    avatarId?: number | null;
    previewId?: number | null;
    backgroundId?: number | null;
}

export const createAgent = async (agentData: CreateAgentData) => {
    const { data } = await $authHost.post('api/agent/create', agentData);
    return data;
};

export const getAllAgents = async () => {
    const { data } = await $authHost.get('api/agent/all');
    return data;
};

export const getAgentById = async (id: number) => {
    const { data } = await $authHost.get(`api/agent/${id}`);
    return data;
};

export const updateAgent = async (id: number, agentData: UpdateAgentData) => {
    const { data } = await $authHost.put(`api/agent/${id}`, agentData);
    return data;
};

export const deleteAgent = async (id: number) => {
    const { data } = await $authHost.delete(`api/agent/${id}`);
    return data;
};

export interface UploadVideoResponse {
    success: boolean;
    agent: Agent;
    video: MediaFile;
}

export const uploadAgentVideo = async (id: number, videoFile: File): Promise<UploadVideoResponse> => {
    const formData = new FormData();
    formData.append('video', videoFile);
    
    const { data } = await $authHost.post(`api/agent/${id}/upload-video`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export interface UploadAvatarResponse {
    success: boolean;
    agent: Agent;
    avatar: MediaFile;
}

export const uploadAgentAvatar = async (id: number, avatarFile: File): Promise<UploadAvatarResponse> => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    const { data } = await $authHost.post(`api/agent/${id}/upload-avatar`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export interface UploadPreviewResponse {
    success: boolean;
    agent: Agent;
    preview: MediaFile;
}

export const uploadAgentPreview = async (id: number, previewFile: File): Promise<UploadPreviewResponse> => {
    const formData = new FormData();
    formData.append('preview', previewFile);
    
    const { data } = await $authHost.post(`api/agent/${id}/upload-preview`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export interface UploadBackgroundResponse {
    success: boolean;
    agent: Agent;
    background: MediaFile;
}

export const uploadAgentBackground = async (id: number, backgroundFile: File): Promise<UploadBackgroundResponse> => {
    const formData = new FormData();
    formData.append('background', backgroundFile);
    
    const { data } = await $authHost.post(`api/agent/${id}/upload-background`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export interface Mission {
    id: number;
    agentId: number;
    title: string;
    description?: string | null;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMissionData {
    title: string;
    description?: string | null;
    orderIndex: number;
}

export interface UpdateMissionData {
    title?: string;
    description?: string | null;
    orderIndex?: number;
}

export const getAgentMissions = async (agentId: number): Promise<Mission[]> => {
    const { data } = await $authHost.get(`api/agent/${agentId}/missions`);
    return data;
};

export const createMission = async (agentId: number, missionData: CreateMissionData): Promise<Mission> => {
    const { data } = await $authHost.post(`api/agent/${agentId}/missions`, missionData);
    return data;
};

export const updateMission = async (agentId: number, missionId: number, missionData: UpdateMissionData): Promise<Mission> => {
    const { data } = await $authHost.put(`api/agent/${agentId}/missions/${missionId}`, missionData);
    return data;
};

export const deleteMission = async (agentId: number, missionId: number): Promise<void> => {
    await $authHost.delete(`api/agent/${agentId}/missions/${missionId}`);
};

