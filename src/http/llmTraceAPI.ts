import { $authHost } from "./index";

/** Step decision snapshot from backend (shape may evolve with API). */
export interface LLMTraceStepDecision {
  mainStepBefore?: number | null;
  mainStepAfter?: number | null;
  allowIncrement?: boolean;
}

export interface LLMTraceBackendComputed {
  stepDecision?: LLMTraceStepDecision;
}

export interface LLMTraceClientRequest {
  message?: string;
}

/** debug_trace object from LLM service when present. */
export interface LLMTraceLlmDebugTrace {
  computed?: unknown;
  [key: string]: unknown;
}

export interface LLMTraceListItem {
  id: number;
  createdAt: string;
  userId: number;
  historyName: string;
  missionId?: number | null;
  durationMs?: number | null;
  clientRequest?: LLMTraceClientRequest | null;
  backendComputed?: LLMTraceBackendComputed | null;
  error?: string | null;
}

export interface LLMTraceListResponse {
  traces: LLMTraceListItem[];
  pagination: { limit: number; offset: number; total: number };
}

export interface LLMTraceDetails extends LLMTraceListItem {
  llmRequest?: unknown;
  llmResponse?: unknown;
  llmDebugTrace?: LLMTraceLlmDebugTrace | null;
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

