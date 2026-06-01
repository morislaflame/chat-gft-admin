import { getAgentMissions, getAllAgents, type Mission } from '@/http/agentAPI';

export type MissionCatalogByHistory = Map<string, Map<number, MissionDisplayInfo>>;

export type MissionLike = {
  id?: number;
  level?: number;
  orderIndex?: number;
  title?: string;
};

export type MissionDisplayInfo = {
  level: number;
  orderIndex: number;
  title: string;
  /** Заголовок для UI: Ур. 2 · №1 — Новый берег */
  label: string;
};

export function compareMissionStoryOrder(a: Pick<Mission, 'level' | 'orderIndex'>, b: Pick<Mission, 'level' | 'orderIndex'>): number {
  const la = Number(a.level) || 1;
  const lb = Number(b.level) || 1;
  if (la !== lb) return la - lb;
  return (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0);
}

export function buildMissionDisplayMap(missions: Mission[]): Map<number, MissionDisplayInfo> {
  const map = new Map<number, MissionDisplayInfo>();
  for (const m of missions) {
    const level = Number(m.level) || 1;
    const orderIndex = Number(m.orderIndex) || 0;
    const title = (m.title || '').trim() || `id ${m.id}`;
    map.set(m.id, {
      level,
      orderIndex,
      title,
      label: `Ур. ${level} · №${orderIndex} — ${title}`,
    });
  }
  return map;
}

export function formatMissionFromFields(mission: MissionLike): string {
  const level = Number(mission.level) || 1;
  const orderIndex = Number(mission.orderIndex) || 0;
  const title = (mission.title || '').trim();
  if (title) return `Ур. ${level} · №${orderIndex} — ${title}`;
  return `Ур. ${level} · №${orderIndex}`;
}

export function formatMissionGroupLabel(
  missionId: number | null,
  missionMap: Map<number, MissionDisplayInfo>,
): string {
  if (missionId === null) return 'Без миссии';
  const info = missionMap.get(missionId);
  if (info) return info.label;
  return `Неизвестная миссия (id ${missionId})`;
}

/** Подпись миссии для таблиц: из вложенного mission, каталога по истории или fallback по id. */
export function resolveMissionLabel(
  catalog: MissionCatalogByHistory,
  historyName: string | null | undefined,
  missionId: number | null | undefined,
  mission?: MissionLike | null,
): string {
  if (mission && (mission.title || mission.orderIndex != null || mission.level != null)) {
    return formatMissionFromFields(mission);
  }
  if (missionId == null) return '—';
  const map = historyName ? catalog.get(historyName) : undefined;
  if (map) return formatMissionGroupLabel(missionId, map);
  return `id ${missionId}`;
}

export async function fetchAllMissionCatalogs(): Promise<MissionCatalogByHistory> {
  const agents = await getAllAgents();
  const entries = await Promise.all(
    agents.map(async (agent) => {
      const missions = await getAgentMissions(agent.id);
      return [agent.historyName, buildMissionDisplayMap(missions)] as const;
    }),
  );
  return new Map(entries);
}

export function compareMissionGroups(
  a: { missionId: number | null },
  b: { missionId: number | null },
  missionMap: Map<number, MissionDisplayInfo>,
): number {
  if (a.missionId === null && b.missionId === null) return 0;
  if (a.missionId === null) return 1;
  if (b.missionId === null) return -1;

  const ma = missionMap.get(a.missionId);
  const mb = missionMap.get(b.missionId);
  if (ma && mb) return compareMissionStoryOrder(ma, mb);
  if (ma) return -1;
  if (mb) return 1;
  return a.missionId - b.missionId;
}
