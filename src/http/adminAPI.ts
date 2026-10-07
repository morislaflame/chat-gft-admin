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
        hasResourceAnomaly?: boolean;
        isPremium?: boolean;
        premiumPurchasedAt?: string | null;
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
    username?: string,
    anomalyOnly?: boolean,
    premiumOnly?: boolean,
): Promise<UsersResponse> => {
    const params: { 
        page?: number; 
        limit?: number; 
        id?: string; 
        telegramId?: string; 
        username?: string;
        anomalyOnly?: boolean;
        premiumOnly?: boolean;
    } = {};
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;
    if (id !== undefined && id !== '') params.id = id;
    if (telegramId !== undefined && telegramId !== '') params.telegramId = telegramId;
    if (username !== undefined && username !== '') params.username = username;
    if (anomalyOnly === true) params.anomalyOnly = true;
    if (premiumOnly === true) params.premiumOnly = true;
    
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
        isPremium?: boolean;
        freeMissionAccess?: boolean;
        premiumPurchasedAt?: string | null;
        premiumOrderId?: number | null;
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
    premiumStats?: { premiumUsers: number; total_purchases: number; total_stars: number };
    recentUsers?: RecentUserSession[];
}

export const getDashboardData = async (): Promise<DashboardDataResponse> => {
    const { data } = await $authHost.get('api/admin/dashboard');
    return data;
};

export interface EconomySettings {
    energyCapRegular: number;
    energyCapPremium: number;
    dailyRewardPremiumMultiplier: number;
    updatedAt?: string | null;
    premiumProduct?: {
        id: number;
        name: string;
        type?: string;
        starsPrice: number;
        energy: number;
        referralBonus?: {
            energy?: number;
            balance?: number;
        } | null;
    } | null;
}

export interface PremiumStatsResponse extends EconomySettings {
    premiumUsers: number;
    totalUsers: number;
    conversionPercent: number;
    purchases: {
        total_purchases: number;
        total_stars: number;
    };
    settings: {
        energyCapRegular: number;
        energyCapPremium: number;
        dailyRewardPremiumMultiplier: number;
        updatedAt?: string | null;
    };
}

export const getEconomySettings = async (): Promise<EconomySettings> => {
    const { data } = await $authHost.get('api/admin/economy-settings');
    return data;
};

export const updateEconomySettings = async (payload: {
    energyCapRegular?: number;
    energyCapPremium?: number;
    dailyRewardPremiumMultiplier?: number;
}): Promise<EconomySettings> => {
    const { data } = await $authHost.put('api/admin/economy-settings', payload);
    return data;
};

export const getPremiumStats = async (): Promise<PremiumStatsResponse> => {
    const { data } = await $authHost.get('api/admin/premium/stats');
    return data;
};

export const upsertPremiumProduct = async (payload: {
    name: string;
    starsPrice: number;
    referralBonus?: { energy?: number; balance?: number } | null;
}): Promise<EconomySettings> => {
    const { data } = await $authHost.put('api/admin/premium/product', payload);
    return data;
};

export const setUserFreeMissionAccess = async (
    userId: string | number,
    freeMissionAccess: boolean,
): Promise<{
    success: boolean;
    userId: number;
    freeMissionAccess: boolean;
}> => {
    const { data } = await $authHost.put(`api/admin/user/${userId}/free-mission-access`, {
        freeMissionAccess,
    });
    return data;
};

export const setUserPremium = async (
    userId: string | number,
    isPremium: boolean,
): Promise<{
    success: boolean;
    userId: number;
    isPremium: boolean;
    premiumPurchasedAt: string | null;
    premiumOrderId: number | null;
    energyCap: number;
}> => {
    const { data } = await $authHost.put(`api/admin/user/${userId}/premium`, { isPremium });
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

export type UserResourceType = 'energy' | 'balance';

export interface UserResourceEventRow {
    id: number;
    userId: number;
    resource: UserResourceType;
    type: string;
    delta: number;
    balanceBefore: number | null;
    balanceAfter: number | null;
    historyName: string | null;
    missionId: number | null;
    createdAt: string;
    meta?: Record<string, unknown> | null;
    mission?: {
        id: number;
        title: string;
        level: number;
        orderIndex: number;
    } | null;
}

export interface UserResourceEventsResponse {
    userId: number;
    events: UserResourceEventRow[];
}

export const getUserResourceEvents = async (
    userId: string | number,
    limit = 300,
): Promise<UserResourceEventsResponse> => {
    const { data } = await $authHost.get(`api/admin/user/${userId}/resource-events`, {
        params: { limit },
    });
    return {
        userId: data.userId,
        events: Array.isArray(data.events) ? data.events : [],
    };
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

export interface PushFailedBreakdownItem {
    error_type: 'chat_not_found' | 'bot_blocked' | 'rate_limited' | 'user_deactivated' | 'bot_kicked' | 'rate_limiter_internal' | 'unknown' | 'other';
    count: number;
}

export interface PushStats {
    overall: {
        sent: number;
        failed: number;
        holdout: number;
        clicks: number;
        returns: number;
        failedBreakdown: PushFailedBreakdownItem[];
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
        failedChatNotFound: number;
        failedBotBlocked: number;
        failedOther: number;
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

// ========== LLM PROMPT REGISTRY ==========

export type PromptCategory = 'engine' | 'runtime' | 'compose';
export type PromptVersionStatus = 'draft' | 'active' | 'archived';

export interface PromptVersion {
    id: number;
    templateId: number;
    version: number;
    status: PromptVersionStatus;
    body: string;
    changelog: string | null;
    createdByUserId: number | null;
    createdAt: string;
    updatedAt: string;
}

export type PromptVersionSummary = Pick<
    PromptVersion,
    'id' | 'version' | 'status' | 'updatedAt' | 'changelog'
>;

export interface PromptTemplate {
    id: number;
    key: string;
    name: string;
    description: string | null;
    category: PromptCategory;
    sortOrder: number;
    placeholders: string[] | null;
    activeVersionId: number | null;
    /** List endpoint: summary without body. Detail: may include body. */
    activeVersion?: (PromptVersionSummary & { body?: string }) | null;
    versions?: PromptVersion[];
    createdAt: string;
    updatedAt: string;
}

export interface PromptSeedResult {
    success: boolean;
    created: string[];
    skipped: string[];
    draftForced: string[];
    inventoryDoc: string;
}

export const getPromptTemplates = async (
    category?: PromptCategory,
    signal?: AbortSignal
): Promise<PromptTemplate[]> => {
    const params: { category?: string } = {};
    if (category) params.category = category;
    const { data } = await $authHost.get('api/admin/prompts', { params, signal });
    return data;
};

export const getPromptTemplate = async (
    id: number,
    signal?: AbortSignal
): Promise<PromptTemplate> => {
    const { data } = await $authHost.get(`api/admin/prompts/${id}`, { signal });
    return data;
};

export const seedPromptTemplates = async (force = false): Promise<PromptSeedResult> => {
    const { data } = await $authHost.post('api/admin/prompts/seed', { force }, {
        params: force ? { force: 'true' } : undefined,
    });
    return data;
};

export const exportPromptTemplates = async (): Promise<Blob> => {
    const { data } = await $authHost.get('api/admin/prompts/export', { responseType: 'blob' });
    return data as Blob;
};

/** Upserts the single draft (or creates it). activate=true saves+activates atomically. */
export const createPromptVersion = async (
    templateId: number,
    payload: { body: string; changelog?: string | null; activate?: boolean }
): Promise<PromptTemplate> => {
    const { data } = await $authHost.post(`api/admin/prompts/${templateId}/versions`, payload);
    return data;
};

export const updatePromptDraftVersion = async (
    versionId: number,
    payload: {
        body?: string;
        changelog?: string | null;
        expectedUpdatedAt?: string;
    }
): Promise<PromptVersion> => {
    const { data } = await $authHost.put(`api/admin/prompts/versions/${versionId}`, payload);
    return data;
};

export const activatePromptVersion = async (
    versionId: number,
    payload?: { body?: string; changelog?: string | null }
): Promise<PromptTemplate> => {
    const { data } = await $authHost.post(
        `api/admin/prompts/versions/${versionId}/activate`,
        payload || {}
    );
    return data;
};

// ========== LEADERBOARD ==========

export type LeaderboardActionType =
    | 'energy_spent'
    | 'referral_active'
    | 'artifact_use'
    | 'premium_purchase'
    | 'energy_pack_purchase'
    | 'mission_complete'
    | 'daily_reward';

export interface LeaderboardRule {
    actionType: LeaderboardActionType;
    points: number;
    unit: string | null;
}

export interface LeaderboardSeason {
    id: number;
    status: 'active' | 'closed';
    startedAt: string;
    endedAt: string | null;
    closedByUserId: number | null;
}

export interface LeaderboardTopEntry {
    rank: number;
    points: number;
    user: {
        id: number;
        username: string | null;
        firstName: string | null;
    };
}

export const getLeaderboardRules = async (): Promise<{
    rules: LeaderboardRule[];
    energyPacks: LeaderboardEnergyPack[];
}> => {
    const { data } = await $authHost.get('api/admin/leaderboard/rules');
    return data;
};

export const updateLeaderboardRules = async (
    rules: Partial<Record<LeaderboardActionType, number>>
): Promise<{ rules: LeaderboardRule[] }> => {
    const { data } = await $authHost.put('api/admin/leaderboard/rules', rules);
    return data;
};

export interface LeaderboardEnergyPack {
    productId: number;
    name: string;
    energy: number;
    points: number;
}

export const updateLeaderboardEnergyPacks = async (
    packs: Array<{ productId: number; points: number }>
): Promise<{ energyPacks: LeaderboardEnergyPack[] }> => {
    const { data } = await $authHost.put('api/admin/leaderboard/energy-packs', { packs });
    return data;
};

export const getLeaderboardSeasons = async (): Promise<{
    current: LeaderboardSeason | null;
    seasons: LeaderboardSeason[];
}> => {
    const { data } = await $authHost.get('api/admin/leaderboard/season');
    return data;
};

export const closeLeaderboardSeason = async (): Promise<{
    closed: LeaderboardSeason;
    opened: LeaderboardSeason;
    awarded: number;
    premiumReset: number;
}> => {
    const { data } = await $authHost.post('api/admin/leaderboard/season/close');
    return data;
};

export const getLeaderboardSeasonTop = async (
    seasonId: number,
    limit?: number
): Promise<{ seasonId: number; top: LeaderboardTopEntry[] }> => {
    const { data } = await $authHost.get(`api/admin/leaderboard/season/${seasonId}/top`, {
        params: limit != null ? { limit } : undefined,
    });
    return data;
};

export interface LeaderboardPrizeMedia {
    id: number;
    url: string;
    mimeType: string | null;
}

export interface LeaderboardPrize {
    id: number;
    name: string;
    preview: LeaderboardPrizeMedia | null;
    animation: LeaderboardPrizeMedia | null;
}

export interface LeaderboardTierCase {
    caseId: number;
    quantity: number;
    name: string;
    imageUrl: string | null;
    mediaFile?: { url: string; mimeType: string } | null;
}

export interface LeaderboardPrizeTier {
    id: string;
    from: number;
    to: number;
    kind: 'podium' | 'single' | 'pool';
    titleKey: string;
    prizeIds: number[];
    cases: LeaderboardTierCase[];
}

export const getLeaderboardPrizes = async (): Promise<{
    prizes: LeaderboardPrize[];
    tiers: LeaderboardPrizeTier[];
}> => {
    const { data } = await $authHost.get('api/admin/leaderboard/prizes');
    return data;
};

export const createLeaderboardPrize = async (name: string, animationFile: File): Promise<LeaderboardPrize> => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', animationFile);
    const { data } = await $authHost.post('api/admin/leaderboard/prizes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const uploadLeaderboardPrizePreview = async (id: number, previewFile: File): Promise<LeaderboardPrize> => {
    const formData = new FormData();
    formData.append('preview', previewFile);
    const { data } = await $authHost.put(`api/admin/leaderboard/prizes/${id}/preview`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const deleteLeaderboardPrize = async (id: number): Promise<{ ok: boolean }> => {
    const { data } = await $authHost.delete(`api/admin/leaderboard/prizes/${id}`);
    return data;
};

export const setLeaderboardTierPrizes = async (payload: {
    rankFrom: number;
    rankTo: number;
    prizeIds: number[];
}): Promise<{ prizes: LeaderboardPrize[]; tiers: LeaderboardPrizeTier[] }> => {
    const { data } = await $authHost.put('api/admin/leaderboard/prize-tiers', payload);
    return data;
};

export const setLeaderboardTierCases = async (payload: {
    rankFrom: number;
    rankTo: number;
    cases: Array<{ caseId: number; quantity: number }>;
}): Promise<{ prizes: LeaderboardPrize[]; tiers: LeaderboardPrizeTier[] }> => {
    const { data } = await $authHost.put('api/admin/leaderboard/case-tiers', payload);
    return data;
};