import { makeAutoObservable, runInAction } from "mobx";
import {
  type Artifact,
  type CreateArtifactData,
  type UpdateArtifactData,
  createArtifact,
  deleteArtifact,
  deleteArtifactMedia,
  getAllArtifacts,
  updateArtifact,
  uploadArtifactMedia,
} from "@/http/artifactAPI";

export default class ArtifactStore {
  _artifacts: Artifact[] = [];
  _loading = false;
  _error = "";

  constructor() {
    makeAutoObservable(this);
  }

  get artifacts() {
    return this._artifacts;
  }
  get loading() {
    return this._loading;
  }
  get error() {
    return this._error;
  }

  setLoading(v: boolean) {
    this._loading = v;
  }
  setError(v: string) {
    this._error = v;
  }

  async fetchAllArtifacts() {
    try {
      this.setLoading(true);
      this.setError("");
      const data = await getAllArtifacts();
      runInAction(() => {
        this._artifacts = data;
      });
    } catch (error: unknown) {
      runInAction(() => {
        const err = error as { response?: { data?: { message?: string } } };
        this.setError(err.response?.data?.message || "Failed to fetch artifacts");
      });
    } finally {
      runInAction(() => this.setLoading(false));
    }
  }

  async createArtifact(payload: CreateArtifactData) {
    try {
      this.setLoading(true);
      this.setError("");
      const created = await createArtifact(payload);
      runInAction(() => {
        this._artifacts = [created, ...this._artifacts];
      });
      return created;
    } catch (error) {
      runInAction(() => {
        const err = error as { response?: { data?: { message?: string } } };
        this.setError(err.response?.data?.message || "Failed to create artifact");
      });
      throw error;
    } finally {
      runInAction(() => this.setLoading(false));
    }
  }

  async updateArtifact(id: number, payload: UpdateArtifactData) {
    try {
      this.setLoading(true);
      this.setError("");
      const updated = await updateArtifact(id, payload);
      runInAction(() => {
        const idx = this._artifacts.findIndex((a) => a.id === id);
        if (idx !== -1) this._artifacts[idx] = updated;
      });
      return updated;
    } catch (error) {
      runInAction(() => {
        const err = error as { response?: { data?: { message?: string } } };
        this.setError(err.response?.data?.message || "Failed to update artifact");
      });
      throw error;
    } finally {
      runInAction(() => this.setLoading(false));
    }
  }

  async deleteArtifact(id: number) {
    try {
      this.setLoading(true);
      this.setError("");
      await deleteArtifact(id);
      runInAction(() => {
        this._artifacts = this._artifacts.filter((a) => a.id !== id);
      });
    } catch (error) {
      runInAction(() => {
        const err = error as { response?: { data?: { message?: string } } };
        this.setError(err.response?.data?.message || "Failed to delete artifact");
      });
      throw error;
    } finally {
      runInAction(() => this.setLoading(false));
    }
  }

  async uploadMedia(id: number, file: File) {
    const data = await uploadArtifactMedia(id, file);
    runInAction(() => {
      const idx = this._artifacts.findIndex((a) => a.id === id);
      if (idx !== -1) this._artifacts[idx] = data.artifact;
    });
    return data;
  }

  async deleteMedia(id: number) {
    const data = await deleteArtifactMedia(id);
    runInAction(() => {
      const idx = this._artifacts.findIndex((a) => a.id === id);
      if (idx !== -1) this._artifacts[idx] = data.artifact;
    });
    return data;
  }
}

