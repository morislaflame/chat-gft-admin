import { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { PageHeader, DataTable } from '@/components/ui';
import {
  getLeaderboardRules,
  updateLeaderboardRules,
  updateLeaderboardEnergyPacks,
  getLeaderboardSeasons,
  closeLeaderboardSeason,
  getLeaderboardSeasonTop,
  type LeaderboardActionType,
  type LeaderboardRule,
  type LeaderboardSeason,
  type LeaderboardTopEntry,
  type LeaderboardEnergyPack,
} from '@/http/adminAPI';
import {
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/react';
import { Save, Sparkles, Flag } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import LeaderboardPrizesSection from '@/components/LeaderboardPageComponents/LeaderboardPrizesSection';

const RULE_FIELDS: Array<{
  actionType: LeaderboardActionType;
  label: string;
  description: string;
}> = [
  {
    actionType: 'energy_spent',
    label: 'Трата энергии',
    description: 'Баллов за 1 энергию в чате (включая доп. энергию за платную подсказку)',
  },
  {
    actionType: 'referral_active',
    label: 'Реферал прошёл миссию',
    description: 'Баллы пригласившему, один раз за пару за сезон',
  },
  {
    actionType: 'artifact_use',
    label: 'Использование артефакта',
    description: 'За использование артефакта в истории',
  },
  {
    actionType: 'premium_purchase',
    label: 'Покупка Premium',
    description: 'За успешную покупку пасса',
  },
  {
    actionType: 'mission_complete',
    label: 'Завершение миссии',
    description: 'За первое прохождение миссии (не повтор)',
  },
  {
    actionType: 'daily_reward',
    label: 'Ежедневная награда',
    description: 'За получение дейлика',
  },
];

const emptyRuleValues = (): Record<LeaderboardActionType, string> => ({
  energy_spent: '',
  referral_active: '',
  artifact_use: '',
  premium_purchase: '',
  energy_pack_purchase: '',
  mission_complete: '',
  daily_reward: '',
});

function errorMessage(err: unknown, fallback: string) {
  const errorObj = err as { response?: { data?: { message?: string } } };
  return errorObj.response?.data?.message || fallback;
}

type EnergyPackDraft = {
  productId: number;
  name: string;
  energy: number;
  points: string;
};

function packsToDraft(packs: LeaderboardEnergyPack[]): EnergyPackDraft[] {
  return packs.map((pack) => ({
    productId: pack.productId,
    name: pack.name,
    energy: pack.energy,
    points: String(pack.points),
  }));
}

const LeaderboardPage = observer(() => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [values, setValues] = useState<Record<LeaderboardActionType, string>>(emptyRuleValues);
  const [energyPacks, setEnergyPacks] = useState<EnergyPackDraft[]>([]);
  const [current, setCurrent] = useState<LeaderboardSeason | null>(null);
  const [top, setTop] = useState<LeaderboardTopEntry[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const applyRules = (next: LeaderboardRule[]) => {
    const nextValues = emptyRuleValues();
    for (const rule of next) {
      nextValues[rule.actionType] = String(rule.points);
    }
    setValues(nextValues);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rulesRes, seasonsRes] = await Promise.all([
        getLeaderboardRules(),
        getLeaderboardSeasons(),
      ]);
      applyRules(rulesRes.rules);
      setEnergyPacks(packsToDraft(rulesRes.energyPacks || []));
      setCurrent(seasonsRes.current);
      if (seasonsRes.current?.id) {
        const topRes = await getLeaderboardSeasonTop(seasonsRes.current.id);
        setTop(topRes.top);
      } else {
        setTop([]);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'Не удалось загрузить лидерборд');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveRules = async () => {
    const payload: Partial<Record<LeaderboardActionType, number>> = {};
    for (const field of RULE_FIELDS) {
      const raw = parseInt(values[field.actionType], 10);
      if (!Number.isInteger(raw) || raw < 0) {
        setError(`«${field.label}» должно быть целым числом ≥ 0`);
        setSuccess(null);
        return;
      }
      payload[field.actionType] = raw;
    }

    const packPayload: Array<{ productId: number; points: number }> = [];
    for (const pack of energyPacks) {
      const raw = parseInt(pack.points, 10);
      if (!Number.isInteger(raw) || raw < 0) {
        setError(`Баллы за «${pack.name}» должны быть целым числом ≥ 0`);
        setSuccess(null);
        return;
      }
      packPayload.push({ productId: pack.productId, points: raw });
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await updateLeaderboardRules(payload);
      applyRules(res.rules);
      if (packPayload.length) {
        const packsRes = await updateLeaderboardEnergyPacks(packPayload);
        setEnergyPacks(packsToDraft(packsRes.energyPacks || []));
      }
      setSuccess('Правила сохранены. Новые значения действуют только вперёд.');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'Не удалось сохранить правила');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSeason = async () => {
    setClosing(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await closeLeaderboardSeason();
      onClose();
      setSuccess(
        `Сезон завершён. Зафиксировано наград: ${result.awarded}. Premium сброшен у ${result.premiumReset}. Бот отправит сообщения.`
      );
      await load();
    } catch (err: unknown) {
      setError(errorMessage(err, 'Не удалось завершить сезон'));
    } finally {
      setClosing(false);
    }
  };

  const playerName = (entry: LeaderboardTopEntry) => {
    if (entry.user.firstName) return entry.user.firstName;
    if (entry.user.username) return `@${entry.user.username}`;
    return `Игрок #${entry.user.id}`;
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Лидерборд"
        description="Баллы, призы сезона и таблица лидеров. При закрытии сезона награды фиксируются, бот пишет победителям, купленный Premium сбрасывается."
      />

      {error && (
        <Card className="border border-red-500">
          <CardBody>
            <div className="text-red-500 text-sm">{error}</div>
          </CardBody>
        </Card>
      )}
      {success && (
        <Card className="border border-emerald-500">
          <CardBody>
            <div className="text-emerald-500 text-sm">{success}</div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold">Текущий сезон</h3>
              {current ? (
                <p className="text-sm text-zinc-400">
                  Сезон #{current.id} · начат {formatDate(current.startedAt)}
                </p>
              ) : (
                <p className="text-sm text-zinc-400">Активного сезона нет</p>
              )}
            </div>
            <Button
              color="danger"
              variant="flat"
              startContent={<Flag size={16} />}
              onPress={onOpen}
              isDisabled={!current || loading}
            >
              Завершить сезон
            </Button>
          </div>
        </CardBody>
      </Card>

      <LeaderboardPrizesSection />

      <Card>
        <CardBody className="space-y-4">
          <h3 className="text-xl font-semibold">Правила баллов</h3>
          <p className="text-sm text-zinc-400">
            Сколько очков даёт каждое действие. Ноль — действие не начисляет баллы.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RULE_FIELDS.map((field) => (
              <Input
                key={field.actionType}
                label={field.label}
                type="number"
                min={0}
                value={values[field.actionType]}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.actionType]: e.target.value }))
                }
                description={field.description}
                startContent={<Sparkles className="w-4 h-4 text-amber-400" />}
              />
            ))}
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Пакеты энергии</h4>
              <p className="text-sm text-zinc-400">
                У каждого пакета свои баллы за покупку. Ноль — покупка этого пакета не даёт очков.
              </p>
            </div>
            {energyPacks.length === 0 ? (
              <p className="text-sm text-zinc-500">Пакетов энергии пока нет</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {energyPacks.map((pack) => (
                  <Input
                    key={pack.productId}
                    label={pack.name}
                    type="number"
                    min={0}
                    value={pack.points}
                    onChange={(e) =>
                      setEnergyPacks((prev) =>
                        prev.map((item) =>
                          item.productId === pack.productId
                            ? { ...item, points: e.target.value }
                            : item
                        )
                      )
                    }
                    description={`${pack.energy} энергии`}
                    startContent={<Sparkles className="w-4 h-4 text-amber-400" />}
                  />
                ))}
              </div>
            )}
          </div>
          <Button
            color="primary"
            startContent={<Save size={16} />}
            onPress={handleSaveRules}
            isLoading={saving || loading}
          >
            Сохранить правила
          </Button>
        </CardBody>
      </Card>

      <DataTable
        title="Топ текущего сезона"
        columns={[
          { key: 'rank', label: 'Место' },
          { key: 'player', label: 'Игрок' },
          { key: 'userId', label: 'ID' },
          { key: 'points', label: 'Баллы' },
        ]}
        data={top}
        loading={loading}
        emptyMessage="Пока никто не набрал баллы"
        renderCell={(item, columnKey) => {
          const entry = item as LeaderboardTopEntry;
          if (columnKey === 'rank') return entry.rank;
          if (columnKey === 'player') return playerName(entry);
          if (columnKey === 'userId') return entry.user.id;
          if (columnKey === 'points') {
            return (
              <span className="inline-flex items-center gap-1">
                {entry.points}
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </span>
            );
          }
          return '-';
        }}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Завершить сезон?</ModalHeader>
          <ModalBody>
            Таблица текущего сезона будет закрыта, откроется новый пустой сезон.
            Награды за места зафиксируются за игроками, бот отправит им сообщение.
            Купленный Premium сбросится у всех, у кого он сейчас включён. Правила баллов не сбрасываются.
            Это нельзя отменить.
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={closing}>
              Отмена
            </Button>
            <Button color="danger" onPress={handleCloseSeason} isLoading={closing}>
              Завершить сезон
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

export default LeaderboardPage;
