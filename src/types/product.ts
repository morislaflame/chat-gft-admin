export interface ReferralBonus {
  energy?: number;
  balance?: number;
}

export interface Product {
  id: number;
  name: string;
  energy: number;
  starsPrice: number;
  referralBonus?: ReferralBonus | null;
  createdAt: string;
  updatedAt: string;
}
