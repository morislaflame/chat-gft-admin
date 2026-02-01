import { makeAutoObservable, runInAction } from "mobx";
import {
  createCase,
  deleteCase,
  getActiveCases,
  getAllCasesAdmin,
  getUserOpenedCasesHistory,
  updateCase,
  type Case,
  type CaseItemPayload,
  type UserOpenedCasesHistoryResponse,
} from "@/http/caseAPI";

export default class CaseStore {
  _cases: Case[] = [];
  _activeCases: Case[] = [];
  _loading = false;
  _error = "";

  _userOpenedCasesHistory: UserOpenedCasesHistoryResponse | null = null;
  _userOpenedCasesHistoryLoading = false;
  _userOpenedCasesHistoryError = "";
  _userOpenedCasesHistoryForUserId: number | string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setCases(cases: Case[]) {
    this._cases = cases;
  }

  setActiveCases(cases: Case[]) {
    this._activeCases = cases;
  }

  setLoading(loading: boolean) {
    this._loading = loading;
  }

  setError(error: string) {
    this._error = error;
  }

  setUserOpenedCasesHistory(history: UserOpenedCasesHistoryResponse | null, userId: number | string | null) {
    this._userOpenedCasesHistory = history;
    this._userOpenedCasesHistoryForUserId = userId;
  }

  setUserOpenedCasesHistoryLoading(loading: boolean) {
    this._userOpenedCasesHistoryLoading = loading;
  }

  setUserOpenedCasesHistoryError(error: string) {
    this._userOpenedCasesHistoryError = error;
  }

  async fetchAllCasesAdmin() {
    try {
      this.setLoading(true);
      this.setError("");
      const data = await getAllCasesAdmin();
      runInAction(() => {
        this.setCases(data);
      });
    } catch (error: any) {
      runInAction(() => {
        this.setError(error.response?.data?.message || "Не удалось загрузить кейсы");
      });
    } finally {
      runInAction(() => this.setLoading(false));
    }
  }

  async fetchActiveCases() {
    try {
      this.setLoading(true);
      this.setError("");
      const data = await getActiveCases();
      runInAction(() => this.setActiveCases(data));
    } catch (error: any) {
      runInAction(() => {
        this.setError(error.response?.data?.message || "Не удалось загрузить активные кейсы");
      });
    } finally {
      runInAction(() => this.setLoading(false));
    }
  }

  async createCase(
    payload: {
      name: string;
      nameEn?: string | null;
      description?: string;
      descriptionEn?: string | null;
      price: number;
      image?: string;
      isActive?: boolean;
      items: CaseItemPayload[];
    },
    imageFile?: File
  ) {
    try {
      this.setLoading(true);
      this.setError("");
      const data = await createCase(payload, imageFile);
      runInAction(() => {
        this._cases.unshift(data);
      });
      return data;
    } catch (error: any) {
      runInAction(() => {
        this.setError(error.response?.data?.message || "Не удалось создать кейс");
      });
      throw error;
    } finally {
      runInAction(() => this.setLoading(false));
    }
  }

  async updateCase(
    id: number,
    payload: Partial<{
      name: string;
      nameEn: string | null;
      description: string | null;
      descriptionEn: string | null;
      price: number;
      image: string | null;
      isActive: boolean;
      items: CaseItemPayload[];
    }>,
    imageFile?: File
  ) {
    try {
      this.setLoading(true);
      this.setError("");
      const data = await updateCase(id, payload, imageFile);
      runInAction(() => {
        const index = this._cases.findIndex((c) => c.id === id);
        if (index !== -1) {
          this._cases[index] = data;
        }
      });
      return data;
    } catch (error: any) {
      runInAction(() => {
        this.setError(error.response?.data?.message || "Не удалось обновить кейс");
      });
      throw error;
    } finally {
      runInAction(() => this.setLoading(false));
    }
  }

  async deleteCase(id: number) {
    try {
      this.setLoading(true);
      this.setError("");
      await deleteCase(id);
      runInAction(() => {
        this._cases = this._cases.filter((c) => c.id !== id);
      });
    } catch (error: any) {
      runInAction(() => {
        this.setError(error.response?.data?.message || "Не удалось удалить кейс");
      });
      throw error;
    } finally {
      runInAction(() => this.setLoading(false));
    }
  }

  async fetchUserOpenedCasesHistory(userId: number | string, params?: { limit?: number; offset?: number }) {
    try {
      this.setUserOpenedCasesHistoryLoading(true);
      this.setUserOpenedCasesHistoryError("");
      const data = await getUserOpenedCasesHistory(userId, params);
      runInAction(() => {
        this.setUserOpenedCasesHistory(data, userId);
      });
    } catch (error: any) {
      runInAction(() => {
        this.setUserOpenedCasesHistory(null, userId);
        this.setUserOpenedCasesHistoryError(
          error.response?.data?.message || "Не удалось загрузить историю открытий кейсов"
        );
      });
    } finally {
      runInAction(() => this.setUserOpenedCasesHistoryLoading(false));
    }
  }

  get cases() {
    return this._cases;
  }

  get activeCases() {
    return this._activeCases;
  }

  get loading() {
    return this._loading;
  }

  get error() {
    return this._error;
  }

  get userOpenedCasesHistory() {
    return this._userOpenedCasesHistory;
  }

  get userOpenedCasesHistoryLoading() {
    return this._userOpenedCasesHistoryLoading;
  }

  get userOpenedCasesHistoryError() {
    return this._userOpenedCasesHistoryError;
  }

  get userOpenedCasesHistoryForUserId() {
    return this._userOpenedCasesHistoryForUserId;
  }
}
