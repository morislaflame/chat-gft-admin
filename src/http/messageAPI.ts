import { $authHost } from "./index";

export const getMessageHistory = async (limit?: number) => {
    const params = limit ? { limit } : {};
    const { data } = await $authHost.get('api/message/history', { params });
    return data;
};

export const getMessageStats = async () => {
    const { data } = await $authHost.get('api/message/stats');
    return data;
};

export const processMessage = async (message: string) => {
    const { data } = await $authHost.post('api/message/process', { message });
    return data;
};
