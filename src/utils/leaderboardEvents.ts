import type { LeaderboardActionType, LeaderboardEvent } from '@/http/adminAPI';

export const EVENT_ACTIONS: Array<{ actionType: LeaderboardActionType; label: string }> = [
  { actionType: 'energy_spent', label: 'Трата энергии' },
  { actionType: 'referral_active', label: 'Реферал прошёл миссию' },
  { actionType: 'artifact_use', label: 'Использование артефакта' },
  { actionType: 'premium_purchase', label: 'Покупка Premium' },
  { actionType: 'energy_pack_purchase', label: 'Покупка пакета энергии' },
  { actionType: 'mission_complete', label: 'Завершение миссии' },
  { actionType: 'daily_reward', label: 'Ежедневная награда' },
];

export const EVENT_ACTION_LABELS: Record<string, string> = Object.fromEntries(
  EVENT_ACTIONS.map((item) => [item.actionType, item.label])
);

export const EVENT_STATUS_LABEL: Record<LeaderboardEvent['status'], string> = {
  active: 'Идёт',
  upcoming: 'Ещё не начался',
  ended: 'Завершён',
};

export type EventTierDraft = {
  id: string;
  rankFrom: number;
  rankTo: number;
  prizeIds: number[];
  cases: Array<{ caseId: number; quantity: number }>;
  energy: number;
  gems: number;
};

export function eventTierLabel(from: number, to: number) {
  if (from === to) return `${from} место`;
  return `${from}–${to} места`;
}

export function buildEventTiers(count: number): EventTierDraft[] {
  const places = Math.floor(count);
  if (!Number.isFinite(places) || places < 1) return [];
  const capped = Math.min(100, places);
  const tiers: EventTierDraft[] = [];
  for (let place = 1; place <= Math.min(10, capped); place += 1) {
    tiers.push({ id: String(place), rankFrom: place, rankTo: place, prizeIds: [], cases: [], energy: 0, gems: 0 });
  }
  for (let from = 11; from <= capped; from += 10) {
    const to = Math.min(from + 9, capped);
    tiers.push({ id: `${from}-${to}`, rankFrom: from, rankTo: to, prizeIds: [], cases: [], energy: 0, gems: 0 });
  }
  return tiers;
}

export function formatEventWhen(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
