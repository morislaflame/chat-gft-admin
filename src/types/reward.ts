export interface Reward {
  id: number;
  name: string;
  price: number;
  tonPrice?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  mediaFile?: {
    id: number;
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    bucket: string;
    url: string;
    entityType: string;
    entityId: number;
    createdAt: string;
    updatedAt: string;
  };
}
