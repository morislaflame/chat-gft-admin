import { makeAutoObservable, runInAction } from "mobx";
import { getUsers, getUserDetails, getTotalPurchases, getAnalytics, getDashboardData } from "@/http/adminAPI";

export interface User {
    id: number;
    telegramId: number | null;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    language?: string | null;
    balance: number;
    energy: number;
    createdAt: string;
}

export interface UserDetails {
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

export interface PurchaseStats {
    total_purchases: number;
    total_stars: number;
}

export interface Analytics {
    dau: Array<{ day: string; count: number }>;
    wau: Array<{ week: string; count: number }>;
    mau: Array<{ month: string; count: number }>;
    retention: {
        total_users: number;
        next_day: number;
        next_day_percent: number;
        next_week: number;
        next_week_percent: number;
    };
}

export interface DashboardData {
    userStats: {
        totalUsers: number;
    };
    messageStats: {
        messageCount: number;
    };
    questStats: {
        activeQuests: number;
    };
    rewardStats: {
        totalRewards: number;
        activeRewards: number;
        totalPurchases: number;
    };
    orderStats: {
        totalOrders: number;
        completedOrders: number;
    };
    productStats: {
        totalProducts: number;
    };
    purchaseStats: {
        total_purchases: number;
        total_stars: number;
    };
}

export default class AdminStore {
    _users: User[] = [];
    _selectedUser: UserDetails | null = null;
    _purchaseStats: PurchaseStats | null = null;
    _analytics: Analytics | null = null;
    _dashboardData: DashboardData | null = null;
    _loading = false;
    _error = '';

    constructor() {
        makeAutoObservable(this);
    }

    setUsers(users: User[]) {
        this._users = users;
    }

    setSelectedUser(user: UserDetails | null) {
        this._selectedUser = user;
    }

    setPurchaseStats(stats: PurchaseStats | null) {
        this._purchaseStats = stats;
    }

    setAnalytics(analytics: Analytics | null) {
        this._analytics = analytics;
    }

    setDashboardData(dashboardData: DashboardData | null) {
        this._dashboardData = dashboardData;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setError(error: string) {
        this._error = error;
    }

    async fetchUsers() {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await getUsers();
            runInAction(() => {
                this.setUsers(data.users);
            });
        } catch (error: unknown) {
            runInAction(() => {
                const err = error as { response?: { data?: { message?: string } } };
                this.setError(err.response?.data?.message || 'Failed to fetch users');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async fetchUserDetails(userId: string) {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await getUserDetails(userId);
            runInAction(() => {
                this.setSelectedUser(data);
            });
        } catch (error: unknown) {
            runInAction(() => {
                const err = error as { response?: { data?: { message?: string } } };
                this.setError(err.response?.data?.message || 'Failed to fetch user details');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async fetchPurchaseStats() {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await getTotalPurchases();
            runInAction(() => {
                this.setPurchaseStats(data);
            });
        } catch (error: unknown) {
            runInAction(() => {
                const err = error as { response?: { data?: { message?: string } } };
                this.setError(err.response?.data?.message || 'Failed to fetch purchase stats');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async fetchAnalytics() {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await getAnalytics();
            runInAction(() => {
                this.setAnalytics(data);
            });
        } catch (error: unknown) {
            runInAction(() => {
                const err = error as { response?: { data?: { message?: string } } };
                this.setError(err.response?.data?.message || 'Failed to fetch analytics');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async fetchDashboardData() {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await getDashboardData();
            runInAction(() => {
                this.setDashboardData(data);
            });
        } catch (error: unknown) {
            runInAction(() => {
                const err = error as { response?: { data?: { message?: string } } };
                this.setError(err.response?.data?.message || 'Failed to fetch dashboard data');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    get users() {
        return this._users;
    }

    get selectedUser() {
        return this._selectedUser;
    }

    get purchaseStats() {
        return this._purchaseStats;
    }

    get analytics() {
        return this._analytics;
    }

    get dashboardData() {
        return this._dashboardData;
    }

    get loading() {
        return this._loading;
    }

    get error() {
        return this._error;
    }
}
