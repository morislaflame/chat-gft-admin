import { $authHost } from "./index";

export interface CompanionPayload {
  id: number;
  agentId: number;
  code: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  isActive: boolean;
  media?: { id: number; url: string; mimeType: string } | null;
}

export interface UpsertCompanionData {
  code: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  isActive?: boolean;
}

export const getAgentCompanion = async (agentId: number): Promise<CompanionPayload | null> => {
  const { data } = await $authHost.get(`api/companion/admin/agent/${agentId}/companion`);
  return data.companion ?? null;
};

export const upsertAgentCompanion = async (
  agentId: number,
  payload: UpsertCompanionData,
): Promise<CompanionPayload> => {
  const { data } = await $authHost.put(`api/companion/admin/agent/${agentId}/companion`, payload);
  return data.companion;
};

export const deleteAgentCompanion = async (agentId: number): Promise<void> => {
  await $authHost.delete(`api/companion/admin/agent/${agentId}/companion`);
};

export const uploadAgentCompanionMedia = async (
  agentId: number,
  file: File,
): Promise<CompanionPayload> => {
  const formData = new FormData();
  formData.append("media", file);
  const { data } = await $authHost.post(
    `api/companion/admin/agent/${agentId}/companion/upload-media`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.companion;
};

export const deleteAgentCompanionMedia = async (agentId: number): Promise<CompanionPayload> => {
  const { data } = await $authHost.delete(`api/companion/admin/agent/${agentId}/companion/media`);
  return data.companion;
};

export interface UserCompanionInventoryItem {
  historyName: string;
  displayName: string | null;
  companion: CompanionPayload;
  owned: boolean;
  grantedAt: string | null;
}

export const getUserCompanionsInventory = async (
  userId: number | string,
): Promise<UserCompanionInventoryItem[]> => {
  const { data } = await $authHost.get(`api/companion/admin/user/${userId}/companions-inventory`);
  return data.histories ?? [];
};

export const grantUserCompanion = async (
  userId: number | string,
  historyName: string,
): Promise<{ granted: CompanionPayload; alreadyOwned: boolean }> => {
  const { data } = await $authHost.post(`api/companion/admin/user/${userId}/grant-companion`, {
    historyName,
  });
  return { granted: data.granted, alreadyOwned: data.alreadyOwned === true };
};

export const revokeUserCompanion = async (
  userId: number | string,
  historyName: string,
): Promise<void> => {
  await $authHost.delete(`api/companion/admin/user/${userId}/companion`, {
    data: { historyName },
  });
};
