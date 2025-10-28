export interface UserInfo {
    id: number;
    telegramId: string | null;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    language: string | null;
    balance: number;
    createdAt: string;
    messageCount?: number;
    firstMessageAt?: string;
    purchases?: { starsAmount: number; createdAt: string }[];
}