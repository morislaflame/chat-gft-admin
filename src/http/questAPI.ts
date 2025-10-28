import { $authHost } from "./index";

export const createTask = async (taskData: {
    type: string;
    reward: number;
    rewardType: string;
    description: string;
    targetCount: number;
    code?: string;
    metadata?: any;
}) => {
    const { data } = await $authHost.post('api/quest/create', taskData);
    return data;
};

export const deleteTask = async (id: number) => {
    const { data } = await $authHost.delete(`api/quest/delete/${id}`);
    return data;
};

export const updateTask = async (id: number, taskData: any) => {
    const { data } = await $authHost.put(`api/quest/update/${id}`, taskData);
    return data;
};

export const getTasks = async (type?: string) => {
    const params = type ? { type } : {};
    const { data } = await $authHost.get('api/quest/tasks', { params });
    return data;
};

export const completeTask = async (taskId: number) => {
    const { data } = await $authHost.post('api/quest/complete', { taskId });
    return data;
};

export const getMyTasks = async () => {
    const { data } = await $authHost.get('api/quest/my-tasks');
    return data;
};

export const checkChannelSubscription = async (taskId: number) => {
    const { data } = await $authHost.post('api/quest/check-channel-subscription', { taskId });
    return data;
};

export const checkReferralUsersTask = async (taskId: number) => {
    const { data } = await $authHost.post('api/quest/check-referral-users', { taskId });
    return data;
};

export const checkChatBoost = async (taskId: number) => {
    const { data } = await $authHost.post('api/quest/check-chat-boost', { taskId });
    return data;
};
