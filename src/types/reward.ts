export interface Reward {
  id: number;
  name: string;
  price: number;
  tonPrice?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  reward?: {
    url: string;
  };
}
