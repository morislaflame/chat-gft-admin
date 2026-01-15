import { makeAutoObservable, runInAction } from "mobx";
import {
  createTrafficSource,
  deleteTrafficSource,
  getTrafficSources,
  getTrafficSourcesMetrics,
  updateTrafficSource,
  type TrafficSource,
  type TrafficSourcesMetricsResponse,
} from "@/http/trafficSourceAPI";

export default class TrafficSourceStore {
  _sources: TrafficSource[] = [];
  _metrics: TrafficSourcesMetricsResponse | null = null;
  _loading = false;
  _error = "";

  constructor() {
    makeAutoObservable(this);
  }

  setSources(sources: TrafficSource[]) {
    this._sources = sources;
  }

  setMetrics(metrics: TrafficSourcesMetricsResponse | null) {
    this._metrics = metrics;
  }

  setLoading(loading: boolean) {
    this._loading = loading;
  }

  setError(error: string) {
    this._error = error;
  }

  async fetchSources() {
    try {
      this.setLoading(true);
      this.setError("");
      const data = await getTrafficSources();
      runInAction(() => this.setSources(data.sources || []));
    } catch (error: unknown) {
      runInAction(() => {
        const err = error as { response?: { data?: { message?: string } } };
        this.setError(err.response?.data?.message || "Failed to fetch traffic sources");
      });
    } finally {
      runInAction(() => this.setLoading(false));
    }
  }

  async fetchMetrics(days = 30, activeDays = 7) {
    try {
      this.setLoading(true);
      this.setError("");
      const data = await getTrafficSourcesMetrics(days, activeDays);
      runInAction(() => this.setMetrics(data));
    } catch (error: unknown) {
      runInAction(() => {
        const err = error as { response?: { data?: { message?: string } } };
        this.setError(err.response?.data?.message || "Failed to fetch traffic metrics");
      });
    } finally {
      runInAction(() => this.setLoading(false));
    }
  }

  async createSource(payload: { name: string; sourceUrl?: string | null }) {
    try {
      this.setLoading(true);
      this.setError("");
      const created = await createTrafficSource(payload);
      runInAction(() => {
        this._sources = [created, ...this._sources];
      });
      return created;
    } catch (error: unknown) {
      runInAction(() => {
        const err = error as { response?: { data?: { message?: string } } };
        this.setError(err.response?.data?.message || "Failed to create traffic source");
      });
      throw error;
    } finally {
      runInAction(() => this.setLoading(false));
    }
  }

  async updateSource(id: number, payload: Partial<{ name: string; sourceUrl: string | null; isActive: boolean }>) {
    try {
      this.setLoading(true);
      this.setError("");
      const updated = await updateTrafficSource(id, payload);
      runInAction(() => {
        const idx = this._sources.findIndex((s) => s.id === id);
        if (idx >= 0) this._sources[idx] = { ...this._sources[idx], ...updated };
      });
      return updated;
    } catch (error: unknown) {
      runInAction(() => {
        const err = error as { response?: { data?: { message?: string } } };
        this.setError(err.response?.data?.message || "Failed to update traffic source");
      });
      throw error;
    } finally {
      runInAction(() => this.setLoading(false));
    }
  }

  async deleteSource(id: number) {
    try {
      this.setLoading(true);
      this.setError("");
      await deleteTrafficSource(id);
      runInAction(() => {
        this._sources = this._sources.filter((s) => s.id !== id);
      });
    } catch (error: unknown) {
      runInAction(() => {
        const err = error as { response?: { data?: { message?: string } } };
        this.setError(err.response?.data?.message || "Failed to delete traffic source");
      });
      throw error;
    } finally {
      runInAction(() => this.setLoading(false));
    }
  }

  get sources() {
    return this._sources;
  }

  get metrics() {
    return this._metrics;
  }

  get loading() {
    return this._loading;
  }

  get error() {
    return this._error;
  }
}


