import { makeAutoObservable, runInAction } from "mobx";
import { createAgent, getAllAgents, updateAgent, deleteAgent, uploadAgentVideo, uploadAgentAvatar, uploadAgentPreview, getAgentMissions, createMission, updateMission, deleteMission, type Agent, type CreateAgentData, type UpdateAgentData, type Mission, type CreateMissionData, type UpdateMissionData } from "@/http/agentAPI";

export default class AgentStore {
    _agents: Agent[] = [];
    _loading = false;
    _error = '';
    _missions: Record<number, Mission[]> = {}; // agentId -> missions[]
    _missionsLoading: Record<number, boolean> = {}; // agentId -> loading state

    constructor() {
        makeAutoObservable(this);
    }

    setAgents(agents: Agent[]) {
        this._agents = agents;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setError(error: string) {
        this._error = error;
    }

    async createAgent(agentData: CreateAgentData) {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await createAgent(agentData);
            runInAction(() => {
                this._agents.unshift(data);
            });
            return data;
        } catch (error: unknown) {
            runInAction(() => {
                const err = error as { response?: { data?: { message?: string } } };
                this.setError(err.response?.data?.message || 'Failed to create agent');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async updateAgent(id: number, agentData: UpdateAgentData) {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await updateAgent(id, agentData);
            runInAction(() => {
                const index = this._agents.findIndex(agent => agent.id === id);
                if (index !== -1) {
                    this._agents[index] = data;
                }
            });
            return data;
        } catch (error: unknown) {
            runInAction(() => {
                const err = error as { response?: { data?: { message?: string } } };
                this.setError(err.response?.data?.message || 'Failed to update agent');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async deleteAgent(id: number) {
        try {
            this.setLoading(true);
            this.setError('');
            await deleteAgent(id);
            runInAction(() => {
                this._agents = this._agents.filter(agent => agent.id !== id);
            });
        } catch (error: unknown) {
            runInAction(() => {
                const err = error as { response?: { data?: { message?: string } } };
                this.setError(err.response?.data?.message || 'Failed to delete agent');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async fetchAllAgents() {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await getAllAgents();
            runInAction(() => {
                this.setAgents(data);
            });
        } catch (error: unknown) {
            runInAction(() => {
                const err = error as { response?: { data?: { message?: string } } };
                this.setError(err.response?.data?.message || 'Failed to fetch agents');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async uploadVideo(agentId: number, videoFile: File) {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await uploadAgentVideo(agentId, videoFile);
            runInAction(() => {
                const index = this._agents.findIndex(agent => agent.id === agentId);
                if (index !== -1) {
                    this._agents[index] = data.agent;
                }
            });
            return data;
        } catch (error: unknown) {
            runInAction(() => {
                const err = error as { response?: { data?: { message?: string } } };
                this.setError(err.response?.data?.message || 'Failed to upload video');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async uploadAvatar(agentId: number, avatarFile: File) {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await uploadAgentAvatar(agentId, avatarFile);
            runInAction(() => {
                const index = this._agents.findIndex(agent => agent.id === agentId);
                if (index !== -1) {
                    this._agents[index] = data.agent;
                }
            });
            return data;
        } catch (error: unknown) {
            runInAction(() => {
                const err = error as { response?: { data?: { message?: string } } };
                this.setError(err.response?.data?.message || 'Failed to upload avatar');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async uploadPreview(agentId: number, previewFile: File) {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await uploadAgentPreview(agentId, previewFile);
            runInAction(() => {
                const index = this._agents.findIndex(agent => agent.id === agentId);
                if (index !== -1) {
                    this._agents[index] = data.agent;
                }
            });
            return data;
        } catch (error: unknown) {
            runInAction(() => {
                const err = error as { response?: { data?: { message?: string } } };
                this.setError(err.response?.data?.message || 'Failed to upload preview');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    get agents() {
        return this._agents;
    }

    get loading() {
        return this._loading;
    }

    get error() {
        return this._error;
    }

    // Методы для работы с миссиями
    getMissions(agentId: number): Mission[] {
        return this._missions[agentId] || [];
    }

    isMissionsLoading(agentId: number): boolean {
        return this._missionsLoading[agentId] || false;
    }

    async fetchAgentMissions(agentId: number) {
        try {
            runInAction(() => {
                this._missionsLoading[agentId] = true;
            });
            const missions = await getAgentMissions(agentId);
            runInAction(() => {
                this._missions[agentId] = missions.sort((a, b) => a.orderIndex - b.orderIndex);
                this._missionsLoading[agentId] = false;
            });
        } catch (error: unknown) {
            runInAction(() => {
                const err = error as { response?: { data?: { message?: string } } };
                this.setError(err.response?.data?.message || 'Failed to fetch missions');
                this._missionsLoading[agentId] = false;
            });
        }
    }

    async createAgentMission(agentId: number, missionData: CreateMissionData) {
        try {
            this.setLoading(true);
            this.setError('');
            const mission = await createMission(agentId, missionData);
            runInAction(() => {
                if (!this._missions[agentId]) {
                    this._missions[agentId] = [];
                }
                this._missions[agentId].push(mission);
                this._missions[agentId].sort((a, b) => a.orderIndex - b.orderIndex);
            });
            return mission;
        } catch (error: unknown) {
            runInAction(() => {
                const err = error as { response?: { data?: { message?: string } } };
                this.setError(err.response?.data?.message || 'Failed to create mission');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async updateAgentMission(agentId: number, missionId: number, missionData: UpdateMissionData) {
        try {
            this.setLoading(true);
            this.setError('');
            const updatedMission = await updateMission(agentId, missionId, missionData);
            runInAction(() => {
                if (this._missions[agentId]) {
                    const index = this._missions[agentId].findIndex(m => m.id === missionId);
                    if (index !== -1) {
                        this._missions[agentId][index] = updatedMission;
                        this._missions[agentId].sort((a, b) => a.orderIndex - b.orderIndex);
                    }
                }
            });
            return updatedMission;
        } catch (error: unknown) {
            runInAction(() => {
                const err = error as { response?: { data?: { message?: string } } };
                this.setError(err.response?.data?.message || 'Failed to update mission');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async deleteAgentMission(agentId: number, missionId: number) {
        try {
            this.setLoading(true);
            this.setError('');
            await deleteMission(agentId, missionId);
            runInAction(() => {
                if (this._missions[agentId]) {
                    this._missions[agentId] = this._missions[agentId].filter(m => m.id !== missionId);
                }
            });
        } catch (error: unknown) {
            runInAction(() => {
                const err = error as { response?: { data?: { message?: string } } };
                this.setError(err.response?.data?.message || 'Failed to delete mission');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }
}

