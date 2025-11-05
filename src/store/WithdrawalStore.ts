import { makeAutoObservable, runInAction } from "mobx";
import {
  getMyWithdrawalRequests,
  getAllWithdrawalRequests,
  updateWithdrawalStatus,
  getWithdrawalStatistics,
  type WithdrawalRequest,
  type WithdrawalRequestsResponse,
  type WithdrawalStatistics
} from "@/http/withdrawalAPI";

export default class WithdrawalStore {
  _requests: WithdrawalRequest[] = [];
  _myRequests: WithdrawalRequest[] = [];
  _statistics: WithdrawalStatistics | null = null;
  _loading = false;
  _error = '';
  _pagination = {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  };

  constructor() {
    makeAutoObservable(this);
  }

  setRequests(requests: WithdrawalRequest[]) {
    this._requests = requests;
  }

  setMyRequests(requests: WithdrawalRequest[]) {
    this._myRequests = requests;
  }

  setStatistics(statistics: WithdrawalStatistics | null) {
    this._statistics = statistics;
  }

  setPagination(pagination: Partial<typeof this._pagination>) {
    this._pagination = { ...this._pagination, ...pagination };
  }

  setLoading(loading: boolean) {
    this._loading = loading;
  }

  setError(error: string) {
    this._error = error;
  }

  async fetchAllRequests(params?: { status?: string; page?: number; limit?: number }) {
    try {
      this.setLoading(true);
      this.setError('');
      const data: WithdrawalRequestsResponse = await getAllWithdrawalRequests(params);
      runInAction(() => {
        this.setRequests(data.requests);
        this.setPagination({
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages
        });
      });
    } catch (error: unknown) {
      runInAction(() => {
        const axiosError = error as { response?: { data?: { message?: string } } };
        this.setError(axiosError.response?.data?.message || 'Failed to fetch withdrawal requests');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async fetchMyRequests() {
    try {
      this.setLoading(true);
      this.setError('');
      const data = await getMyWithdrawalRequests();
      runInAction(() => {
        this.setMyRequests(data);
      });
    } catch (error: unknown) {
      runInAction(() => {
        const axiosError = error as { response?: { data?: { message?: string } } };
        this.setError(axiosError.response?.data?.message || 'Failed to fetch my withdrawal requests');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async updateStatus(id: number, status: 'pending' | 'completed' | 'rejected') {
    try {
      this.setLoading(true);
      this.setError('');
      const updatedRequest = await updateWithdrawalStatus(id, { status });
      runInAction(() => {
        const index = this._requests.findIndex(req => req.id === id);
        if (index !== -1) {
          this._requests[index] = updatedRequest;
        }
      });
      return updatedRequest;
    } catch (error: unknown) {
      runInAction(() => {
        const axiosError = error as { response?: { data?: { message?: string } } };
        this.setError(axiosError.response?.data?.message || 'Failed to update withdrawal status');
      });
      throw error;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async fetchStatistics(params?: { startDate?: string; endDate?: string }) {
    try {
      this.setLoading(true);
      this.setError('');
      const data = await getWithdrawalStatistics(params);
      runInAction(() => {
        this.setStatistics(data);
      });
    } catch (error: unknown) {
      runInAction(() => {
        const axiosError = error as { response?: { data?: { message?: string } } };
        this.setError(axiosError.response?.data?.message || 'Failed to fetch withdrawal statistics');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  get requests() {
    return this._requests;
  }

  get myRequests() {
    return this._myRequests;
  }

  get statistics() {
    return this._statistics;
  }

  get pagination() {
    return this._pagination;
  }

  get loading() {
    return this._loading;
  }

  get error() {
    return this._error;
  }
}

