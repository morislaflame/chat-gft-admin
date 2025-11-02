import { $authHost } from "./index";

export interface Agent {
    id: number;
    historyName: string;
    systemPrompt: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAgentData {
    historyName: string;
    systemPrompt: string;
}

export interface UpdateAgentData {
    historyName?: string;
    systemPrompt?: string;
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

