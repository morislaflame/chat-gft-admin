import { makeAutoObservable, runInAction } from "mobx";
import {
  getAllMissionStepRewards,
  createMissionStepReward,
  updateMissionStepReward,
  deleteMissionStepReward,
  type MissionStepReward as MissionStepRewardType,
  type CreateMissionStepRewardData,
  type UpdateMissionStepRewardData,
} from "@/http/missionStepRewardAPI";

function compareByMissionStep(a: MissionStepRewardType, b: MissionStepRewardType): number {
  const la = Number(a.mission?.level) || 1;
  const lb = Number(b.mission?.level) || 1;
  if (la !== lb) return la - lb;
  const oa = Number(a.mission?.orderIndex) || 0;
  const ob = Number(b.mission?.orderIndex) || 0;
  if (oa !== ob) return oa - ob;
  if (a.missionId !== b.missionId) return a.missionId - b.missionId;
  return a.stepNumber - b.stepNumber;
}

export default class MissionStepRewardStore {
  _rewards: MissionStepRewardType[] = [];
  _loading = false;
  _error = "";

  constructor() {
    makeAutoObservable(this);
  }

  setRewards(rewards: MissionStepRewardType[]) {
    this._rewards = rewards;
  }

  setLoading(loading: boolean) {
    this._loading = loading;
  }

  setError(error: string) {
    this._error = error;
  }

  async createReward(payload: CreateMissionStepRewardData) {
    try {
      this.setLoading(true);
      this.setError("");
      const data = await createMissionStepReward(payload);
      runInAction(() => {
        this._rewards.push(data);
        this._rewards.sort(compareByMissionStep);
      });
      return data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      runInAction(() => {
        this.setError(err.response?.data?.message || "Failed to create step reward");
      });
      throw error;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async updateReward(id: number, payload: UpdateMissionStepRewardData) {
    try {
      this.setLoading(true);
      this.setError("");
      const data = await updateMissionStepReward(id, payload);
      runInAction(() => {
        const index = this._rewards.findIndex((r) => r.id === id);
        if (index !== -1) {
          this._rewards[index] = data;
        }
      });
      return data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      runInAction(() => {
        this.setError(err.response?.data?.message || "Failed to update step reward");
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
      await deleteMissionStepReward(id);
      runInAction(() => {
        this._rewards = this._rewards.filter((r) => r.id !== id);
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      runInAction(() => {
        this.setError(err.response?.data?.message || "Failed to delete step reward");
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
      const data = await getAllMissionStepRewards();
      runInAction(() => {
        this.setRewards(data);
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      runInAction(() => {
        this.setError(err.response?.data?.message || "Failed to fetch step rewards");
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
