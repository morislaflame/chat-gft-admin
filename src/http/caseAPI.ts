import { $authHost } from "./index";

export interface CaseItemPayload {
  type: "reward" | "gems" | "energy";
  rewardId?: number | null;
  amount?: number | null;
  weight: number;
}

export interface CaseItem extends CaseItemPayload {
  id: number;
}

export interface Case {
  id: number;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  price: number;
  image?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  mediaFile?: {
    id: number;
    url: string;
    mimeType: string;
  } | null;
  items?: CaseItem[];
}

export type CaseOpenResultType = "reward" | "gems" | "energy";

export interface CaseOpenHistoryReward {
  id: number;
  name: string;
  description?: string | null;
  onlyCase?: boolean;
  isActive?: boolean;
  price?: number;
  mediaFile?: {
    id: number;
    url: string;
    mimeType: string;
  } | null;
}

export interface UserOpenedCaseHistoryEntry {
  userCaseId: number;
  purchasedAt: string;
  openedAt: string;
  case: {
    id: number;
    name: string;
    description?: string | null;
    price: number;
    isActive: boolean;
    mediaFile?: {
      id: number;
      url: string;
      mimeType: string;
    } | null;
  } | null;
  result: {
    type: CaseOpenResultType | null;
    caseItemId: number | null;
    amount?: number;
    reward?: CaseOpenHistoryReward;
  };
}

export interface UserOpenedCasesHistoryResponse {
  userId: number;
  totalOpened: number;
  byCase: Array<{ caseId: number; caseName: string; count: number }>;
  byDropType: { reward: number; gems: number; energy: number };
  opens: UserOpenedCaseHistoryEntry[];
  pagination: { limit: number; offset: number; returned: number };
}

const appendCaseFormData = (formData: FormData, payload: {
  name?: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  price?: number;
  image?: string | null;
  isActive?: boolean;
  items?: CaseItemPayload[];
}) => {
  if (payload.name !== undefined) formData.append("name", payload.name);
  if (payload.nameEn !== undefined) formData.append("nameEn", payload.nameEn ?? "");
  if (payload.description !== undefined) formData.append("description", payload.description ?? "");
  if (payload.descriptionEn !== undefined) formData.append("descriptionEn", payload.descriptionEn ?? "");
  if (payload.price !== undefined) formData.append("price", payload.price.toString());
  // FormData doesn't accept null values
  if (payload.image !== undefined && payload.image !== null) formData.append("image", payload.image);
  if (payload.isActive !== undefined) formData.append("isActive", payload.isActive.toString());
  if (payload.items !== undefined) formData.append("items", JSON.stringify(payload.items));
};

export const createCase = async (
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
) => {
  const formData = new FormData();
  appendCaseFormData(formData, payload);
  if (imageFile) {
    formData.append("image", imageFile);
  }
  const { data } = await $authHost.post("api/case/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateCase = async (
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
) => {
  const formData = new FormData();
  appendCaseFormData(formData, payload);
  if (imageFile) {
    formData.append("image", imageFile);
  }
  const { data } = await $authHost.put(`api/case/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteCase = async (id: number) => {
  const { data } = await $authHost.delete(`api/case/delete/${id}`);
  return data;
};

export const getAllCasesAdmin = async () => {
  const { data } = await $authHost.get("api/case/all");
  return data;
};

export const getActiveCases = async () => {
  const { data } = await $authHost.get("api/case/active");
  return data;
};

export const getUserOpenedCasesHistory = async (
  userId: number | string,
  params?: { limit?: number; offset?: number }
): Promise<UserOpenedCasesHistoryResponse> => {
  const { data } = await $authHost.get(`api/case/user/${userId}/open-history`, { params });
  return data;
};
