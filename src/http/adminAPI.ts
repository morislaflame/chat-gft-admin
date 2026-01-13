import { $authHost } from "./index";

export interface UsersResponse {
    users: Array<{
        id: number;
        telegramId: number | null;
        username: string | null;
        firstName: string | null;
        lastName: string | null;
        language: string | null;
        balance: number;
        energy: number;
        createdAt: string;
    }>;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const getUsers = async (
    page?: number, 
    limit?: number, 
    id?: string, 
    telegramId?: string, 
    username?: string
): Promise<UsersResponse> => {
    const params: { 
        page?: number; 
        limit?: number; 
        id?: string; 
        telegramId?: string; 
        username?: string 
    } = {};
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;
    if (id !== undefined && id !== '') params.id = id;
    if (telegramId !== undefined && telegramId !== '') params.telegramId = telegramId;
    if (username !== undefined && username !== '') params.username = username;
    
    const { data } = await $authHost.get('api/admin/users', { params });
    return data;
};

export interface UserDetailsResponse {
    userId: number;
    user: {
        id: number;
        telegramId: number | null;
        username: string | null;
        firstName: string | null;
        lastName: string | null;
        language: string | null;
        balance: number;
        energy: number;
        createdAt: string;
        selectedHistoryName: string;
    };
    registeredAt: string;
    messageCount: number;
    firstMessageAt: string | null;
    purchases: Array<{
        starsAmount: number;
        createdAt: string;
    }>;
    referralCount: number;
    purchasedRewardsCount: number;
}

export const getUserDetails = async (userId: string): Promise<UserDetailsResponse> => {
    const { data } = await $authHost.get(`api/admin/user/${userId}/details`);
    return data;
};

export interface UpdateBalanceResponse {
    success: boolean;
    message: string;
    balance: number;
}

export interface UpdateEnergyResponse {
    success: boolean;
    message: string;
    energy: number;
}

export const updateUserBalance = async (userId: number, amount: number): Promise<UpdateBalanceResponse> => {
    const { data } = await $authHost.put(`api/admin/user/${userId}/balance`, { amount });
    return data;
};

export const updateUserEnergy = async (userId: number, amount: number): Promise<UpdateEnergyResponse> => {
    const { data } = await $authHost.put(`api/admin/user/${userId}/energy`, { amount });
    return data;
};

export const setUserBalance = async (userId: number, balance: number): Promise<UpdateBalanceResponse> => {
    const { data } = await $authHost.put(`api/admin/user/${userId}/balance/set`, { balance });
    return data;
};

export const setUserEnergy = async (userId: number, energy: number): Promise<UpdateEnergyResponse> => {
    const { data } = await $authHost.put(`api/admin/user/${userId}/energy/set`, { energy });
    return data;
};

export interface DeleteUserResponse {
    success: boolean;
    message: string;
}

export const deleteUser = async (userId: number): Promise<DeleteUserResponse> => {
    const { data } = await $authHost.delete(`api/admin/user/${userId}`);
    return data;
};

export const getTotalPurchases = async () => {
    const { data } = await $authHost.get('api/admin/purchases');
    return data;
};

export const getAnalytics = async () => {
    const { data } = await $authHost.get('api/admin/analytics');
    return data;
};

export interface RecentUserSession {
    userId: number;
    telegramId: number | null;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    historyName: string;
    lastActiveAt: string;
    sessionUserMessages: number;
}

export interface DashboardDataResponse {
    userStats: { totalUsers: number };
    messageStats: { messageCount: number };
    questStats: { activeQuests: number };
    rewardStats: { totalRewards: number; activeRewards: number; totalPurchases: number };
    orderStats: { totalOrders: number; completedOrders: number };
    productStats: { totalProducts: number };
    purchaseStats: { total_purchases: number; total_stars: number };
    recentUsers?: RecentUserSession[];
}

export const getDashboardData = async (): Promise<DashboardDataResponse> => {
    const { data } = await $authHost.get('api/admin/dashboard');
    return data;
};

export interface ResetUserHistoryResponse {
    success: boolean;
    message: string;
    deletedChatMessages: number;
    deletedUserMissions: number;
}

export interface UserChatHistoryResponse {
    userId: number;
    historyName: string;
    totalMessages: number;
    userMessageCount: number;
    assistantMessageCount: number;
    history: Array<{
        id: number;
        userMessage: string;
        assistantMessage: string | null;
        createdAt: string;
    }>;
}

export const resetUserHistory = async (userId: number, historyName: string): Promise<ResetUserHistoryResponse> => {
    const { data } = await $authHost.post(`api/admin/user/${userId}/reset-history`, { historyName });
    return data;
};

export const getUserChatHistory = async (userId: number, historyName: string): Promise<UserChatHistoryResponse> => {
    const { data } = await $authHost.get(`api/admin/user/${userId}/chat-history`, {
        params: { historyName }
    });
    return data;
};