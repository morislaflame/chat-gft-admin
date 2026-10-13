import { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Input, Select, SelectItem, Switch } from '@heroui/react';
import { X } from 'lucide-react';
import {
  getLeaderboardPrizes,
  type LeaderboardActionType,
  type LeaderboardEvent,
  type LeaderboardEventWrite,
  type LeaderboardPrize,
} from '@/http/adminAPI';
import { getAllCasesAdmin, type Case } from '@/http/caseAPI';
import {
  EVENT_ACTIONS,
  buildEventTiers,
  eventTierLabel,
  type EventTierDraft,
} from '@/utils/leaderboardEvents';
import { CaseThumb, PrizeThumb } from './LeaderboardPrizesSection';

function toLocalInput(iso: string | undefined) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function mergeTiers(count: number, previous: EventTierDraft[]): EventTierDraft[] {
  const next = buildEventTiers(count);
  const byKey = new Map(previous.map((tier) => [`${tier.rankFrom}:${tier.rankTo}`, tier]));
  return next.map((tier) => {
    const saved = byKey.get(`${tier.rankFrom}:${tier.rankTo}`);
    if (!saved) return tier;
    return { ...tier, prizeIds: saved.prizeIds, cases: saved.cases };
  });
}

function tiersFromEvent(event: LeaderboardEvent | null | undefined): EventTierDraft[] {
  if (!event) return buildEventTiers(10);
  return mergeTiers(
    event.prizePlaceCount,
    event.tiers.map((tier) => ({
      id: tier.id,
      rankFrom: tier.rankFrom ?? tier.from,
      rankTo: tier.rankTo ?? tier.to,
      prizeIds: tier.prizeIds || [],
      cases: (tier.cases || []).map((item) => ({
        caseId: item.caseId,
        quantity: item.quantity || 1,
      })),
    }))
  );
}

function caseMedia(item?: Case): { url: string; mimeType: string } | null {
  if (item?.mediaFile?.url && item.mediaFile.mimeType) {
    return { url: item.mediaFile.url, mimeType: item.mediaFile.mimeType };
  }
  if (item?.image) return { url: item.image, mimeType: 'image/png' };
  return null;
}

type TierRewardsProps = {
  tier: EventTierDraft;
  prizes: LeaderboardPrize[];
  cases: Case[];
  onChange: (patch: (tier: EventTierDraft) => EventTierDraft) => void;
};

function TierRewards({ tier, prizes, cases, onChange }: TierRewardsProps) {
  const [qtyDraft, setQtyDraft] = useState<Record<number, string>>({});
  const prizeById = useMemo(() => new Map(prizes.map((prize) => [prize.id, prize])), [prizes]);
  const caseById = useMemo(() => new Map(cases.map((item) => [item.id, item])), [cases]);
  const remainingPrizes = prizes.filter((prize) => !tier.prizeIds.includes(prize.id));
  const remainingCases = cases.filter((item) => !tier.cases.some((row) => row.caseId === item.id));

  const commitQuantity = (caseId: number) => {
    const raw = qtyDraft[caseId];
    if (raw == null) return;
    setQtyDraft((prev) => {
      const next = { ...prev };
      delete next[caseId];
      return next;
    });
    const quantity = parseInt(raw, 10);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return;
    onChange((current) => ({
      ...current,
      cases: current.cases.map((row) => (row.caseId === caseId ? { ...row, quantity } : row)),
    }));
  };

  return (
    <div className="rounded-xl border border-zinc-800 p-3">
      <div className="mb-2 text-sm font-medium">{eventTierLabel(tier.rankFrom, tier.rankTo)}</div>
      {tier.prizeIds.length === 0 && tier.cases.length === 0 ? (
        <p className="mb-2 text-xs text-zinc-500">Награды не выбраны</p>
      ) : null}
      {tier.prizeIds.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {tier.prizeIds.map((prizeId) => {
            const prize = prizeById.get(prizeId);
            const name = prize?.name || `Приз #${prizeId}`;
            return (
              <div key={prizeId} className="flex items-center gap-2 rounded-lg border border-zinc-700 py-1 pl-1 pr-1">
                <PrizeThumb prize={prize} className="h-8 w-8 object-contain" />
                <span className="max-w-[8rem] truncate text-xs">{name}</span>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label={`Убрать ${name}`}
                  onPress={() =>
                    onChange((current) => ({
                      ...current,
                      prizeIds: current.prizeIds.filter((id) => id !== prizeId),
                    }))
                  }
                >
                  <X size={14} />
                </Button>
              </div>
            );
          })}
        </div>
      ) : null}
      {tier.cases.length > 0 ? (
        <div className="mb-2 space-y-2">
          {tier.cases.map((row) => {
            const item = caseById.get(row.caseId);
            const name = item?.name || `Кейс #${row.caseId}`;
            return (
              <div key={row.caseId} className="flex items-center gap-2">
                <CaseThumb media={caseMedia(item)} />
                <span className="min-w-0 flex-1 truncate text-xs">{name}</span>
                <Input
                  size="sm"
                  type="number"
                  min={1}
                  max={99}
                  label="Шт."
                  className="w-20"
                  value={qtyDraft[row.caseId] ?? String(row.quantity)}
                  onValueChange={(value) => setQtyDraft((prev) => ({ ...prev, [row.caseId]: value }))}
                  onBlur={() => commitQuantity(row.caseId)}
                />
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label={`Убрать кейс ${name}`}
                  onPress={() =>
                    onChange((current) => ({
                      ...current,
                      cases: current.cases.filter((caseRow) => caseRow.caseId !== row.caseId),
                    }))
                  }
                >
                  <X size={14} />
                </Button>
              </div>
            );
          })}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Select
          size="sm"
          label="Добавить приз"
          placeholder={prizes.length ? 'Выберите приз' : 'Каталог пуст'}
          selectedKeys={new Set<string>()}
          isDisabled={remainingPrizes.length === 0}
          onSelectionChange={(keys) => {
            const prizeId = Number(Array.from(keys)[0]);
            if (!Number.isInteger(prizeId) || prizeId < 1) return;
            onChange((current) =>
              current.prizeIds.includes(prizeId)
                ? current
                : { ...current, prizeIds: [...current.prizeIds, prizeId] }
            );
          }}
        >
          {remainingPrizes.map((prize) => (
            <SelectItem key={String(prize.id)} textValue={prize.name}>
              {prize.name}
            </SelectItem>
          ))}
        </Select>
        <Select
          size="sm"
          label="Добавить кейс"
          placeholder={cases.length ? 'Выберите кейс' : 'Кейсов нет'}
          selectedKeys={new Set<string>()}
          isDisabled={remainingCases.length === 0}
          onSelectionChange={(keys) => {
            const caseId = Number(Array.from(keys)[0]);
            if (!Number.isInteger(caseId) || caseId < 1) return;
            onChange((current) =>
              current.cases.some((row) => row.caseId === caseId)
                ? current
                : { ...current, cases: [...current.cases, { caseId, quantity: 1 }] }
            );
          }}
        >
          {remainingCases.map((item) => (
            <SelectItem key={String(item.id)} textValue={item.name}>
              {item.isActive ? item.name : `${item.name} (скрыт)`}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
}

type LeaderboardEventEditorProps = {
  initial?: LeaderboardEvent | null;
  submitLabel: string;
  onSubmit: (payload: LeaderboardEventWrite) => Promise<void>;
};

const LeaderboardEventEditor = ({ initial, submitLabel, onSubmit }: LeaderboardEventEditorProps) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [startsAt, setStartsAt] = useState(toLocalInput(initial?.startsAt));
  const [endsAt, setEndsAt] = useState(toLocalInput(initial?.endsAt));
  const [allActions, setAllActions] = useState(initial?.allActions !== false);
  const [actionTypes, setActionTypes] = useState<LeaderboardActionType[]>(
    initial?.allActions === false ? initial.actionTypes : EVENT_ACTIONS.map((item) => item.actionType)
  );
  const [placeCount, setPlaceCount] = useState(String(initial?.prizePlaceCount || 10));
  const [tiers, setTiers] = useState<EventTierDraft[]>(() => tiersFromEvent(initial));
  const [prizes, setPrizes] = useState<LeaderboardPrize[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getLeaderboardPrizes(), getAllCasesAdmin()])
      .then(([prizeData, caseData]) => {
        if (cancelled) return;
        setPrizes(prizeData.prizes || []);
        setCases(Array.isArray(caseData) ? caseData : []);
      })
      .catch(() => {
        if (!cancelled) setError('Не удалось загрузить призы и кейсы');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setTitle(initial?.title || '');
    setStartsAt(toLocalInput(initial?.startsAt));
    setEndsAt(toLocalInput(initial?.endsAt));
    setAllActions(initial?.allActions !== false);
    setActionTypes(
      initial?.allActions === false ? initial.actionTypes : EVENT_ACTIONS.map((item) => item.actionType)
    );
    setPlaceCount(String(initial?.prizePlaceCount || 10));
    setTiers(tiersFromEvent(initial));
  }, [initial]);

  const singleTiers = tiers.filter((tier) => tier.rankFrom === tier.rankTo);
  const poolTiers = tiers.filter((tier) => tier.rankFrom !== tier.rankTo);
  const endsInPast = Boolean(endsAt) && new Date(endsAt).getTime() <= Date.now();

  const changePlaceCount = (value: string) => {
    setPlaceCount(value);
    const count = Number(value);
    if (Number.isInteger(count) && count >= 1 && count <= 100) {
      setTiers((prev) => mergeTiers(count, prev));
    }
  };

  const toggleAction = (actionType: LeaderboardActionType, checked: boolean) => {
    setActionTypes((prev) =>
      checked ? [...new Set([...prev, actionType])] : prev.filter((item) => item !== actionType)
    );
  };

  const updateTier = (id: string, patch: (tier: EventTierDraft) => EventTierDraft) => {
    setTiers((prev) => prev.map((tier) => (tier.id === id ? patch(tier) : tier)));
  };

  const handleSubmit = async () => {
    setError(null);
    const count = Number(placeCount);
    if (!title.trim()) {
      setError('Укажите название');
      return;
    }
    if (!startsAt || !endsAt || new Date(endsAt) <= new Date(startsAt)) {
      setError('Конец ивента должен быть позже начала');
      return;
    }
    if (!Number.isInteger(count) || count < 1 || count > 100) {
      setError('Число призовых мест от 1 до 100');
      return;
    }
    if (!allActions && actionTypes.length === 0) {
      setError('Выберите действия или все баллы');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        allActions,
        actionTypes,
        prizePlaceCount: count,
        tiers: tiers.map((tier) => ({
          rankFrom: tier.rankFrom,
          rankTo: tier.rankTo,
          prizeIds: tier.prizeIds,
          cases: tier.cases,
        })),
      });
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message || 'Не удалось сохранить ивент');
    } finally {
      setSaving(false);
    }
  };

  const renderTier = (tier: EventTierDraft) => (
    <TierRewards
      key={tier.id}
      tier={tier}
      prizes={prizes}
      cases={cases}
      onChange={(patch) => updateTier(tier.id, patch)}
    />
  );

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <Input label="Название" value={title} onValueChange={setTitle} maxLength={120} isRequired />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Начало"
            type="datetime-local"
            value={startsAt}
            onValueChange={setStartsAt}
            description="Можно поставить прошедшую дату: баллы за это время уже посчитаны"
          />
          <Input label="Конец" type="datetime-local" value={endsAt} onValueChange={setEndsAt} />
        </div>
        <Input
          label="Призовых мест"
          type="number"
          min={1}
          max={100}
          value={placeCount}
          onValueChange={changePlaceCount}
          description="1–10 по одному месту, дальше диапазоны по 10: 11–20, 21–30 и так далее"
        />
      </section>

      <section className="space-y-3">
        <h4 className="font-medium">Какие баллы считать</h4>
        <Switch isSelected={allActions} onValueChange={setAllActions}>
          Все действия, за которые начисляются баллы лидерборда
        </Switch>
        {!allActions ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {EVENT_ACTIONS.map((action) => (
              <Checkbox
                key={action.actionType}
                isSelected={actionTypes.includes(action.actionType)}
                onValueChange={(checked) => toggleAction(action.actionType, checked)}
              >
                {action.label}
              </Checkbox>
            ))}
          </div>
        ) : null}
        <p className="text-xs text-zinc-500">
          Возвраты вычитаются. Правила баллов те же, что у сезона.
        </p>
      </section>

      <section className="space-y-3">
        <div>
          <h4 className="font-medium">Награды</h4>
          <p className="text-xs text-zinc-500">
            Призы берутся из библиотеки выше и выдаются вручную. Кейсы попадут в инвентарь сами, когда ивент закончится.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">{singleTiers.map(renderTier)}</div>
        {poolTiers.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">{poolTiers.map(renderTier)}</div>
        ) : null}
      </section>

      {endsInPast ? (
        <p className="text-sm text-amber-500">
          Конец уже прошёл. Сразу после сохранения итоги зафиксируются, кейсы начислятся, бот напишет победителям.
          Изменить это потом будет нельзя.
        </p>
      ) : null}
      {error ? <div className="text-sm text-red-500">{error}</div> : null}
      <Button color="primary" onPress={handleSubmit} isLoading={saving}>
        {submitLabel}
      </Button>
    </div>
  );
};

export default LeaderboardEventEditor;
