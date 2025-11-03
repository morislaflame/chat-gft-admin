// API Response Types

export interface UserInfo {
  id: number;
  email?: string;
  telegramId?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  balance: number;
  energy: number;
  language?: string;
  onboardingSeen: boolean;
  refCode?: string;
  referredBy?: number;
  referralCount: number;
  referralDepositBonusAwarded: number;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Admin API Types
export interface AdminUser {
  id: number;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  language?: string;
  balance: number;
  createdAt: string;
}

export interface AdminUserDetails extends AdminUser {
  registeredAt: string;
  messageCount: number;
  firstMessageAt?: string;
  gifts: any[];
  purchases: any[];
  messages: any[];
}

export interface PurchaseStats {
  total_purchases: number;
  total_stars: number;
}

export interface Analytics {
  dau: Array<{ day: string; count: number }>;
  wau: Array<{ week: string; count: number }>;
  mau: Array<{ month: string; count: number }>;
  retention: {
    total_users: number;
    next_day: number;
    next_day_percent: number;
    next_week: number;
    next_week_percent: number;
  };
}

// Message API Types
export interface MessageHistory {
  id: number;
  userId: number;
  messageText: string;
  responseText: string;
  isCongratulation: boolean;
  createdAt: string;
}

export interface MessageStats {
  userId: number;
  messageCount: number;
  lastMessageTime: string;
  messagesUntilCongratulation: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface MessageResponse {
  userId: number;
  message: string;
  response: string;
  messageCount: number;
  isCongratulation: boolean;
  messagesUntilCongratulation: number;
  newBalance: number;
  timestamp: string;
}

// Quest API Types
export interface Task {
  id: number;
  type: 'DAILY' | 'ONE_TIME' | 'SPECIAL';
  reward: number;
  rewardType: string;
  description: string;
  targetCount: number;
  code?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface UserTask {
  id: number;
  userId: number;
  taskId: number;
  progress: number;
  completed: boolean;
  completedAt?: string;
  lastProgressAt?: string;
  completionContext?: any;
  createdAt: string;
  updatedAt: string;
  task?: Task;
}

export interface TaskResponse {
  success: boolean;
  message: string;
  userTask?: UserTask;
  completed?: boolean;
  alreadyCompleted?: boolean;
}

// Payment API Types
export interface Order {
  id: number;
  userId: number;
  productName: string;
  price: number;
  attemptsPurchased: number;
  status: 'initial' | 'completed' | 'paid' | 'refunded';
  telegramPaymentChargeId?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username?: string;
    email?: string;
  };
}

export interface InvoiceResponse {
  invoiceLink: string;
}

// Product API Types
export interface Product {
  id: number;
  name: string;
  energy: number;
  starsPrice: number;
  createdAt: string;
  updatedAt: string;
}

// Reward API Types
export interface MediaFile {
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
}

export interface Reward {
  id: number;
  name: string;
  price: number;
  tonPrice?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  reward?: MediaFile;
}

export interface UserReward {
  id: number;
  userId: number;
  rewardId: number;
  purchasePrice: number;
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
  reward?: Reward;
  user?: any;
}

export interface RewardStats {
  totalRewards: number;
  activeRewards: number;
  totalPurchases: number;
  claimedRewards: number;
  topRewards: Array<{
    rewardId: number;
    purchaseCount: number;
    reward: {
      name: string;
      price: number;
    };
  }>;
}

export interface PurchaseResponse {
  message: string;
  userReward: UserReward;
  newBalance: number;
}
