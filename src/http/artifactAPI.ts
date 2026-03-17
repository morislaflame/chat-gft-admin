import { $authHost } from "./index";
import type { MediaFile } from "./agentAPI";

export type ArtifactBoostType = "COMPANION" | "KEY" | "WEAPON" | "ARMOR" | "TRINKET";

export interface Artifact {
  id: number;
  code: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  level: number;
  boostType: ArtifactBoostType;
  boost?: any | null;
  mediaId?: number | null;
  media?: MediaFile | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArtifactData {
  code: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  level?: number;
  boostType: ArtifactBoostType;
  boost?: any | null;
  mediaId?: number | null;
}

export interface UpdateArtifactData {
  code?: string;
  name?: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  level?: number;
  boostType?: ArtifactBoostType;
  boost?: any | null;
  mediaId?: number | null;
}

export const getAllArtifacts = async (): Promise<Artifact[]> => {
  const { data } = await $authHost.get("api/artifact/all");
  return data;
};

export const createArtifact = async (payload: CreateArtifactData): Promise<Artifact> => {
  const { data } = await $authHost.post("api/artifact/create", payload);
  return data;
};

export const updateArtifact = async (id: number, payload: UpdateArtifactData): Promise<Artifact> => {
  const { data } = await $authHost.put(`api/artifact/${id}`, payload);
  return data;
};

export const deleteArtifact = async (id: number): Promise<{ success: boolean }> => {
  const { data } = await $authHost.delete(`api/artifact/${id}`);
  return data;
};

export interface UploadArtifactMediaResponse {
  success: boolean;
  artifact: Artifact;
  media: MediaFile;
}

export const uploadArtifactMedia = async (id: number, mediaFile: File): Promise<UploadArtifactMediaResponse> => {
  const formData = new FormData();
  formData.append("media", mediaFile);

  const { data } = await $authHost.post(`api/artifact/${id}/upload-media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteArtifactMedia = async (id: number): Promise<{ success: boolean; artifact: Artifact }> => {
  const { data } = await $authHost.delete(`api/artifact/${id}/media`);
  return data;
};

