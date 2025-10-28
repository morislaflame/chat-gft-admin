import { makeAutoObservable, runInAction } from "mobx";
import { 
    createTask, 
    deleteTask, 
    updateTask, 
    getTasks, 
    completeTask, 
    getMyTasks,
    checkChannelSubscription,
    checkReferralUsersTask,
    checkChatBoost
} from "@/http/questAPI";

export interface Task {
    id: number;
    type: 'DAILY' | 'ONE_TIME' | 'SPECIAL';
    reward: number;
    rewardType: 'tokens' | 'energy';
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

export default class QuestStore {
    _tasks: Task[] = [];
    _myTasks: UserTask[] = [];
    _loading = false;
    _error = '';

    constructor() {
        makeAutoObservable(this);
    }

    setTasks(tasks: Task[]) {
        this._tasks = tasks;
    }

    setMyTasks(tasks: UserTask[]) {
        this._myTasks = tasks;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setError(error: string) {
        this._error = error;
    }

    async createTask(taskData: {
        type: string;
        reward: number;
        rewardType: string;
        description: string;
        targetCount: number;
        code?: string;
        metadata?: any;
    }) {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await createTask(taskData);
            runInAction(() => {
                this._tasks.unshift(data);
            });
            return data;
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to create task');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async deleteTask(id: number) {
        try {
            this.setLoading(true);
            this.setError('');
            await deleteTask(id);
            runInAction(() => {
                this._tasks = this._tasks.filter(task => task.id !== id);
            });
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to delete task');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async updateTask(id: number, taskData: any) {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await updateTask(id, taskData);
            runInAction(() => {
                const index = this._tasks.findIndex(task => task.id === id);
                if (index !== -1) {
                    this._tasks[index] = data;
                }
            });
            return data;
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to update task');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async fetchTasks(type?: string) {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await getTasks(type);
            runInAction(() => {
                this.setTasks(data);
            });
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to fetch tasks');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async completeTask(taskId: number): Promise<TaskResponse> {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await completeTask(taskId);
            // Обновляем список задач пользователя
            await this.fetchMyTasks();
            return data;
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to complete task');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async fetchMyTasks() {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await getMyTasks();
            runInAction(() => {
                this.setMyTasks(data);
            });
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to fetch my tasks');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async checkChannelSubscription(taskId: number): Promise<TaskResponse> {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await checkChannelSubscription(taskId);
            // Обновляем список задач пользователя
            await this.fetchMyTasks();
            return data;
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to check channel subscription');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async checkReferralUsersTask(taskId: number): Promise<TaskResponse> {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await checkReferralUsersTask(taskId);
            // Обновляем список задач пользователя
            await this.fetchMyTasks();
            return data;
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to check referral users task');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async checkChatBoost(taskId: number): Promise<TaskResponse> {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await checkChatBoost(taskId);
            // Обновляем список задач пользователя
            await this.fetchMyTasks();
            return data;
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to check chat boost');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    get tasks() {
        return this._tasks;
    }

    get myTasks() {
        return this._myTasks;
    }

    get loading() {
        return this._loading;
    }

    get error() {
        return this._error;
    }
}
