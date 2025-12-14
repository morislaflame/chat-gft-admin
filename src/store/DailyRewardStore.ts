import { makeAutoObservable, runInAction } from "mobx";
import {
  createDailyReward,
  getAllDailyRewards,
  updateDailyRewardByDay,
  deleteDailyReward,
  resetDailyRewards,
  type DailyReward
} from "@/http/dailyRewardAPI";

export default class DailyRewardStore {
  _dailyRewards: DailyReward[] = [];
  _loading = false;
  _error = '';

  constructor() {
    makeAutoObservable(this);
  }

  setDailyRewards(rewards: DailyReward[]) {
    this._dailyRewards = rewards;
  }

  setLoading(loading: boolean) {
    this._loading = loading;
  }

  setError(error: string) {
    this._error = error;
  }

  async createDailyReward(rewardData: {
    day: number;
    reward: number;
    rewardType: 'energy' | 'tokens';
    secondReward?: number;
    secondRewardType?: 'energy' | 'tokens' | null;
    description: string;
  }) {
    try {
      this.setLoading(true);
      this.setError('');
      const data = await createDailyReward(rewardData);
      runInAction(() => {
        this._dailyRewards.push(data);
        // Сортируем по дню
        this._dailyRewards.sort((a, b) => a.day - b.day);
      });
      return data;
    } catch (error: any) {
      runInAction(() => {
        this.setError(error.response?.data?.message || 'Failed to create daily reward');
      });
      throw error;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async updateDailyRewardByDay(day: number, rewardData: {
    reward?: number;
    rewardType?: 'energy' | 'tokens';
    secondReward?: number;
    secondRewardType?: 'energy' | 'tokens' | null;
    description?: string;
  }) {
    try {
      this.setLoading(true);
      this.setError('');
      const data = await updateDailyRewardByDay(day, rewardData);
      runInAction(() => {
        const index = this._dailyRewards.findIndex(reward => reward.day === day);
        if (index !== -1) {
          this._dailyRewards[index] = data;
          // Сортируем по дню
          this._dailyRewards.sort((a, b) => a.day - b.day);
        }
      });
      return data;
    } catch (error: any) {
      runInAction(() => {
        this.setError(error.response?.data?.message || 'Failed to update daily reward');
      });
      throw error;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async deleteDailyReward(id: number) {
    try {
      this.setLoading(true);
      this.setError('');
      await deleteDailyReward(id);
      runInAction(() => {
        this._dailyRewards = this._dailyRewards.filter(reward => reward.id !== id);
      });
    } catch (error: any) {
      runInAction(() => {
        this.setError(error.response?.data?.message || 'Failed to delete daily reward');
      });
      throw error;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async fetchAllDailyRewards() {
    try {
      this.setLoading(true);
      this.setError('');
      const data = await getAllDailyRewards();
      runInAction(() => {
        this.setDailyRewards(data);
      });
    } catch (error: any) {
      runInAction(() => {
        this.setError(error.response?.data?.message || 'Failed to fetch daily rewards');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async resetDailyRewards() {
    try {
      this.setLoading(true);
      this.setError('');
      const data = await resetDailyRewards();
      return data;
    } catch (error: any) {
      runInAction(() => {
        this.setError(error.response?.data?.message || 'Failed to reset daily rewards');
      });
      throw error;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  get dailyRewards() {
    return this._dailyRewards;
  }

  get loading() {
    return this._loading;
  }

  get error() {
    return this._error;
  }
}

