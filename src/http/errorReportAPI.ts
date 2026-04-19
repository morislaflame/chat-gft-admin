import { $authHost } from "./index";

export interface ClientErrorReportItem {
  id: string;
  userId: number;
  telegramId: number | null;
  historyName: string;
  missionId: number | null;
  reportKind: string;
  httpStatus: number | null;
  serverMessage: string | null;
  serverCode: string | null;
  clientMessage: string | null;
  suggestionId: string | null;
  payForSuggestionId: string | null;
  beginReplay: boolean;
  llmTraceId: string | null;
  createdAt: string;
  user: {
    id: number;
    telegramId: number | null;
    username: string | null;
    firstName: string | null;
  } | null;
}

export interface ErrorReportsListResponse {
  reports: ClientErrorReportItem[];
  pagination: { limit: number; offset: number; total: number };
}

export const getErrorReports = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<ErrorReportsListResponse> => {
  const { data } = await $authHost.get("api/admin/error-reports", { params });
  return data;
};
