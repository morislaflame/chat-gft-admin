export interface ReferralBonus {
  energy?: number;
  balance?: number;
}

export type ProductType = 'energy' | 'premium';

export interface Product {
  id: number;
  name: string;
  type?: ProductType;
  energy: number;
  starsPrice: number;
  referralBonus?: ReferralBonus | null;
  createdAt: string;
  updatedAt: string;
}
