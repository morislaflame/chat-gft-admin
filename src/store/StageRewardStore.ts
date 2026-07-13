import { makeAutoObservable, runInAction } from "mobx";
import {
  getAllStageRewards,
  createStageReward,
  updateStageReward,
  deleteStageReward,
  type StageReward,
  type CreateStageRewardData,
  type UpdateStageRewardData,
} from "@/http/stageRewardAPI";

function compareByMission(a: StageReward, b: StageReward): number {
  const la = Number(a.mission?.level) || 1;
  const lb = Number(b.mission?.level) || 1;
  if (la !== lb) return la - lb;
  const oa = Number(a.mission?.orderIndex) || 0;
  const ob = Number(b.mission?.orderIndex) || 0;
  if (oa !== ob) return oa - ob;
  return a.missionId - b.missionId;
}

export default class StageRewardStore {
  _rewards: StageReward[] = [];
  _loading = false;
  _error = "";

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
      this.setError("");
      const data = await createStageReward(rewardData);
      runInAction(() => {
        this._rewards.push(data);
        this._rewards.sort(compareByMission);
      });
      return data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      runInAction(() => {
        this.setError(err.response?.data?.message || "Failed to create stage reward");
      });
      throw error;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async updateReward(id: number, rewardData: UpdateStageRewardData) {
    try {
      this.setLoading(true);
      this.setError("");
      const data = await updateStageReward(id, rewardData);
      runInAction(() => {
        const index = this._rewards.findIndex((reward) => reward.id === id);
        if (index !== -1) {
          this._rewards[index] = data;
        }
      });
      return data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      runInAction(() => {
        this.setError(err.response?.data?.message || "Failed to update stage reward");
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
      this.setError("");
      await deleteStageReward(id);
      runInAction(() => {
        this._rewards = this._rewards.filter((reward) => reward.id !== id);
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      runInAction(() => {
        this.setError(err.response?.data?.message || "Failed to delete stage reward");
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
      this.setError("");
      const data = await getAllStageRewards();
      runInAction(() => {
        this.setRewards(data);
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      runInAction(() => {
        this.setError(err.response?.data?.message || "Failed to fetch stage rewards");
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
}
