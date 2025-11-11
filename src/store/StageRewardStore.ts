import { makeAutoObservable, runInAction } from "mobx";
import { 
    getAllStageRewards, 
    createStageReward, 
    updateStageReward, 
    deleteStageReward, 
    type StageReward, 
    type CreateStageRewardData, 
    type UpdateStageRewardData 
} from "@/http/stageRewardAPI";

export default class StageRewardStore {
    _rewards: StageReward[] = [];
    _loading = false;
    _error = '';

    constructor() {
        makeAutoObservable(this);
    }

    setRewards(rewards: StageReward[]) {
        this._rewards = rewards;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setError(error: string) {
        this._error = error;
    }

    async createReward(rewardData: CreateStageRewardData) {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await createStageReward(rewardData);
            runInAction(() => {
                this._rewards.push(data);
                this._rewards.sort((a, b) => a.stageNumber - b.stageNumber);
            });
            return data;
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to create stage reward');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async updateReward(stageNumber: number, rewardData: UpdateStageRewardData) {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await updateStageReward(stageNumber, rewardData);
            runInAction(() => {
                const index = this._rewards.findIndex(reward => reward.stageNumber === stageNumber);
                if (index !== -1) {
                    this._rewards[index] = data;
                }
            });
            return data;
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to update stage reward');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async deleteReward(stageNumber: number) {
        try {
            this.setLoading(true);
            this.setError('');
            await deleteStageReward(stageNumber);
            runInAction(() => {
                this._rewards = this._rewards.filter(reward => reward.stageNumber !== stageNumber);
            });
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to delete stage reward');
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
            const data = await getAllStageRewards();
            runInAction(() => {
                this.setRewards(data);
            });
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to fetch stage rewards');
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

    get loading() {
        return this._loading;
    }

    get error() {
        return this._error;
    }

    getRewardByStageNumber(stageNumber: number): StageReward | undefined {
        return this._rewards.find(reward => reward.stageNumber === stageNumber);
    }
}

