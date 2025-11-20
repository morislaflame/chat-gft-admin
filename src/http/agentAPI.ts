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
    createdAt: string;
    updatedAt: string;
    video?: MediaFile | null;
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

