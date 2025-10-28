export interface Order {
  id: number;
  productName: string;
  attemptsPurchased: number;
  price: number;
  status: string;
  user?: {
    username?: string;
  };
  userId: number;
  createdAt: string;
  updatedAt: string;
  telegramPaymentChargeId?: string;
  metadata?: Record<string, unknown>;
}
