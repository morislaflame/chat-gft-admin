import { makeAutoObservable, runInAction } from "mobx";
import { getMessageHistory, getMessageStats, processMessage } from "@/http/messageAPI";

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

export interface MessageHistoryResponse {
    history: MessageHistory[];
    forceProgress: {
        messagesUntilGift: number;
        totalMessagesForGift: number;
        currentProgress: number;
        messageCount: number;
    };
}

export default class MessageStore {
    _history: MessageHistory[] = [];
    _stats: MessageStats | null = null;
    _forceProgress: any = null;
    _loading = false;
    _error = '';

    constructor() {
        makeAutoObservable(this);
    }

    setHistory(history: MessageHistory[]) {
        this._history = history;
    }

    setStats(stats: MessageStats | null) {
        this._stats = stats;
    }

    setForceProgress(progress: any) {
        this._forceProgress = progress;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setError(error: string) {
        this._error = error;
    }

    async fetchMessageHistory(limit?: number) {
        try {
            this.setLoading(true);
            this.setError('');
            const data: MessageHistoryResponse = await getMessageHistory(limit);
            runInAction(() => {
                this.setHistory(data.history);
                this.setForceProgress(data.forceProgress);
            });
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to fetch message history');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async fetchMessageStats() {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await getMessageStats();
            runInAction(() => {
                this.setStats(data);
            });
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to fetch message stats');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async sendMessage(message: string): Promise<MessageResponse> {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await processMessage(message);
            // Обновляем историю после отправки сообщения
            await this.fetchMessageHistory();
            return data;
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to send message');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    get history() {
        return this._history;
    }

    get stats() {
        return this._stats;
    }

    get forceProgress() {
        return this._forceProgress;
    }

    get loading() {
        return this._loading;
    }

    get error() {
        return this._error;
    }
}
