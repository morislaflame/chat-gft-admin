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
        selectedChatMissionId?: number | null;
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
    storyStats: Array<{
        historyName: string;
        displayName: string;
        completedMissions: number;
        userMessages: number;
        energySpent: number;
    }>;
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

export interface AdminGrantArtifactItem {
    id: number;
    code: string;
    name: string;
    nameEn?: string | null;
    level: number;
    boostType: string;
    ownedQty: number;
}

export interface AdminGrantArtifactHistoryGroup {
    historyName: string;
    displayName: string | null;
    levels: Array<{
        level: number;
        artifacts: AdminGrantArtifactItem[];
    }>;
}

export interface AdminArtifactsGrantCatalogResponse {
    userId: number;
    histories: AdminGrantArtifactHistoryGroup[];
}

export interface GrantUserArtifactsResponse {
    success: boolean;
    message: string;
    granted: Array<{
        artifactId: number;
        code: string;
        name: string;
        historyName: string;
        quantity: number;
    }>;
}

export const getUserArtifactsGrantCatalog = async (
    userId: string | number,
): Promise<AdminArtifactsGrantCatalogResponse> => {
    const { data } = await $authHost.get(`api/admin/user/${userId}/artifacts-grant-catalog`);
    return data;
};

export const grantUserArtifacts = async (
    userId: string | number,
    artifactIds: number[],
): Promise<GrantUserArtifactsResponse> => {
    const { data } = await $authHost.post(`api/admin/user/${userId}/grant-artifacts`, { artifactIds });
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

export interface UserChatHistoryTurn {
    id: number;
    userMessage: string | null;
    assistantMessage: string | null;
    createdAt: string;
    missionId?: number | null;
    isCongratulation?: boolean;
    suggestionKind?: string | null;
    suggestionId?: string | null;
    payable?: boolean;
    artifactAction?: boolean;
    artifactActionType?: string | null;
    artifactCode?: string | null;
    artifactApplied?: boolean;
    mainStep?: number | null;
    nextSuggestions?: unknown;
    legacyOnlyLength?: boolean;
    messageLength?: number | null;
}

export interface UserChatHistoryResponse {
    userId: number;
    historyName: string;
    turnCount: number;
    totalMessages: number;
    userMessageCount: number;
    assistantMessageCount: number;
    stats: {
        bySuggestionKind: Record<string, number>;
        payable: number;
        artifactUse: number;
        artifactReceive: number;
        legacyTurnCount: number;
    };
    history: UserChatHistoryTurn[];
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

export const exportUserChatHistory = async (
    userId: number | string,
    historyName: string,
): Promise<Blob> => {
    const { data } = await $authHost.get(`api/admin/user/${userId}/chat-history/export`, {
        params: { historyName },
        responseType: 'blob',
    });
    return data as Blob;
};

export type WithdrawalStatus = 'pending' | 'completed' | 'rejected';

export interface WithdrawalRequestAdmin {
    id: number;
    status: WithdrawalStatus;
    createdAt: string;
    completedAt: string | null;
    completedBy: number | null;
}

export interface PurchasedRewardAdmin {
    id: number;
    userId: number;
    rewardId: number;
    purchasePrice: number;
    purchaseDate: string;
    reward: {
        id: number;
        name: string;
        price: number;
        tonPrice?: number | null;
        description?: string | null;
        isActive: boolean;
        onlyCase?: boolean;
        mediaFile?: {
            id: number;
            url: string;
            mimeType: string;
        } | null;
    };
    withdrawalRequests?: WithdrawalRequestAdmin[];
}

export interface UserPurchasedRewardsResponse {
    userId: number;
    purchases: PurchasedRewardAdmin[];
}

export const getUserPurchasedRewards = async (userId: number | string): Promise<UserPurchasedRewardsResponse> => {
    const { data } = await $authHost.get(`api/admin/user/${userId}/purchased-rewards`);
    return data;
};

export interface DeleteUserPurchasedRewardResponse {
    success: boolean;
    message: string;
}

export const deleteUserPurchasedReward = async (userId: number | string, userRewardId: number): Promise<DeleteUserPurchasedRewardResponse> => {
    const { data } = await $authHost.delete(`api/admin/user/${userId}/purchased-reward/${userRewardId}`);
    return data;
};

// ========== PUSH NOTIFICATIONS SYSTEM ==========

export interface PushScenario {
    id: number;
    triggerType: string;
    segmentType: string;
    textRu: string;
    textEn: string;
    holdoutPercentage: number;
    cooldownHours: number;
    priority: number;
    status: 'draft' | 'approved' | 'active';
    createdAt: string;
    updatedAt: string;
}

export interface PushStats {
    overall: {
        sent: number;
        failed: number;
        holdout: number;
        clicks: number;
        returns: number;
    };
    scenarios: Array<{
        id: number;
        triggerType: string;
        segmentType: string;
        sent: number;
        failed: number;
        holdout: number;
        clicks: number;
        returns: number;
    }>;
}

export const getPushScenarios = async (): Promise<PushScenario[]> => {
    const { data } = await $authHost.get('api/admin/push/scenarios');
    return data;
};

export const createPushScenario = async (scenario: Partial<PushScenario>): Promise<PushScenario> => {
    const { data } = await $authHost.post('api/admin/push/scenarios', scenario);
    return data;
};

export const updatePushScenario = async (id: number, scenario: Partial<PushScenario>): Promise<PushScenario> => {
    const { data } = await $authHost.put(`api/admin/push/scenarios/${id}`, scenario);
    return data;
};

export const deletePushScenario = async (id: number): Promise<{ success: boolean; message: string }> => {
    const { data } = await $authHost.delete(`api/admin/push/scenarios/${id}`);
    return data;
};

export const getPushDryRun = async (triggerType: string, segmentType: string): Promise<{ count: number }> => {
    const { data } = await $authHost.get('api/admin/push/dry-run', {
        params: { triggerType, segmentType }
    });
    return data;
};

export const getPushStats = async (): Promise<PushStats> => {
    const { data } = await $authHost.get('api/admin/push/stats');
    return data;
};