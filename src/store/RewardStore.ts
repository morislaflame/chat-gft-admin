import { makeAutoObservable, runInAction } from "mobx";
import { 
    createReward, 
    getAllRewards, 
    updateReward, 
    deleteReward, 
    getAvailableRewards,
    purchaseReward,
    getMyPurchases,
    getRewardStats
} from "@/http/rewardAPI";

export interface MediaFile {
    id: number;
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    bucket: string;
    url: string;
    entityType: string;
    entityId: number;
    createdAt: string;
}

export interface Reward {
    id: number;
    name: string;
    price: number;
    tonPrice?: number;
    description?: string;
    isActive: boolean;
    onlyCase?: boolean;
    createdAt: string;
    updatedAt: string;
    reward?: MediaFile;
}

export interface UserReward {
    id: number;
    userId: number;
    rewardId: number;
    purchasePrice: number;
    purchaseDate: string;
    createdAt: string;
    updatedAt: string;
    reward?: Reward;
    user?: any;
}

export interface RewardStats {
    totalRewards: number;
    activeRewards: number;
    totalPurchases: number;
    claimedRewards: number;
    topRewards: Array<{
        rewardId: number;
        purchaseCount: number;
        reward: {
            name: string;
            price: number;
        };
    }>;
}

export interface PurchaseResponse {
    message: string;
    userReward: UserReward;
    newBalance: number;
}

export default class RewardStore {
    _rewards: Reward[] = [];
    _availableRewards: Reward[] = [];
    _myPurchases: UserReward[] = [];
    _stats: RewardStats | null = null;
    _loading = false;
    _error = '';

    constructor() {
        makeAutoObservable(this);
    }

    setRewards(rewards: Reward[]) {
        this._rewards = rewards;
    }

    setAvailableRewards(rewards: Reward[]) {
        this._availableRewards = rewards;
    }

    setMyPurchases(purchases: UserReward[]) {
        this._myPurchases = purchases;
    }

    setStats(stats: RewardStats | null) {
        this._stats = stats;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setError(error: string) {
        this._error = error;
    }

    async createReward(rewardData: {
        name: string;
        price: number;
        tonPrice?: number;
        description?: string;
        onlyCase?: boolean;
        isActive?: boolean;
    }, imageFile?: File) {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await createReward(rewardData, imageFile);
            runInAction(() => {
                this._rewards.unshift(data);
            });
            return data;
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to create reward');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async updateReward(id: number, rewardData: {
        name?: string;
        price?: number;
        tonPrice?: number;
        description?: string;
        isActive?: boolean;
        onlyCase?: boolean;
    }, imageFile?: File) {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await updateReward(id, rewardData, imageFile);
            runInAction(() => {
                const index = this._rewards.findIndex(reward => reward.id === id);
                if (index !== -1) {
                    this._rewards[index] = data;
                }
            });
            return data;
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to update reward');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async deleteReward(id: number) {
        try {
            this.setLoading(true);
            this.setError('');
            await deleteReward(id);
            runInAction(() => {
                this._rewards = this._rewards.filter(reward => reward.id !== id);
            });
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to delete reward');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async fetchAllRewards() {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await getAllRewards();
            runInAction(() => {
                this.setRewards(data);
            });
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to fetch rewards');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async fetchAvailableRewards() {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await getAvailableRewards();
            runInAction(() => {
                this.setAvailableRewards(data);
            });
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to fetch available rewards');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async purchaseReward(id: number): Promise<PurchaseResponse> {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await purchaseReward(id);
            // Обновляем список покупок
            await this.fetchMyPurchases();
            return data;
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to purchase reward');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async fetchMyPurchases() {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await getMyPurchases();
            runInAction(() => {
                this.setMyPurchases(data);
            });
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to fetch my purchases');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async fetchRewardStats() {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await getRewardStats();
            runInAction(() => {
                this.setStats(data);
            });
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to fetch reward stats');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    get rewards() {
        return this._rewards;
    }

    get availableRewards() {
        return this._availableRewards;
    }

    get myPurchases() {
        return this._myPurchases;
    }

    get stats() {
        return this._stats;
    }

    get loading() {
        return this._loading;
    }

    get error() {
        return this._error;
    }
}
