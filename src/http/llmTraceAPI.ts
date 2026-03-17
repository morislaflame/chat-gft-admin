import { $authHost } from "./index";

export interface LLMTraceListItem {
  id: number;
  createdAt: string;
  userId: number;
  historyName: string;
  missionId?: number | null;
  durationMs?: number | null;
  clientRequest?: unknown;
  backendComputed?: unknown;
  error?: string | null;
}

export interface LLMTraceListResponse {
  traces: LLMTraceListItem[];
  pagination: { limit: number; offset: number; total: number };
}

export interface LLMTraceDetails extends LLMTraceListItem {
  clientRequest?: unknown;
  backendComputed?: unknown;
  llmRequest?: unknown;
  llmResponse?: unknown;
  llmDebugTrace?: unknown;
  backendResponse?: unknown;
}

export const getLLMTraces = async (params?: {
  userId?: number;
  historyName?: string;
  missionId?: number;
  limit?: number;
  offset?: number;
}): Promise<LLMTraceListResponse> => {
  const { data } = await $authHost.get("api/admin/llm-traces", { params });
  return data;
};

export const getLLMTraceById = async (id: number): Promise<LLMTraceDetails> => {
  const { data } = await $authHost.get(`api/admin/llm-traces/${id}`);
  return data;
};

