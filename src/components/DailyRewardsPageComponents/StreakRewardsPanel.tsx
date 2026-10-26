import { useEffect, useState } from 'react';
import { Button, Card, CardBody, Input, Select, SelectItem } from '@heroui/react';
import { Flame, Trash2 } from 'lucide-react';
import {
  createStreakReward,
  deleteStreakReward,
  getStreakRewards,
  type StreakRewardConfig,
  type StreakRewardKind,
} from '@/http/streakAPI';

const KINDS: Array<{ id: StreakRewardKind; label: string }> = [
  { id: 'energy', label: 'Энергия' },
  { id: 'gems', label: 'Гемы' },
  { id: 'case', label: 'Кейс' },
  { id: 'reward', label: 'Награда' },
];

function rewardLabel(row: StreakRewardConfig) {
  if (row.kind === 'energy') return `Энергия +${row.amount ?? 0}`;
  if (row.kind === 'gems') return `Гемы +${row.amount ?? 0}`;
  if (row.kind === 'case') return row.title ? `Кейс: ${row.title}` : `Кейс #${row.caseId}`;
  return row.title ? `Награда: ${row.title}` : `Награда #${row.rewardId}`;
}

interface StreakRewardsPanelProps {
  cases: Array<{ id: number; name: string }>;
  rewards: Array<{ id: number; name: string }>;
}

export const StreakRewardsPanel = ({ cases, rewards }: StreakRewardsPanelProps) => {
  const [rows, setRows] = useState<StreakRewardConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [day, setDay] = useState('');
  const [kind, setKind] = useState<StreakRewardKind>('energy');
  const [amount, setAmount] = useState('');
  const [caseId, setCaseId] = useState('');
  const [rewardId, setRewardId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getStreakRewards();
      setRows(data);
      setError('');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Не удалось загрузить награды серии');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    setError('');
    try {
      await createStreakReward({
        day: Number(day),
        kind,
        amount: kind === 'energy' || kind === 'gems' ? Number(amount) : null,
        caseId: kind === 'case' ? Number(caseId) : null,
        rewardId: kind === 'reward' ? Number(rewardId) : null,
      });
      setDay('');
      setAmount('');
      setCaseId('');
      setRewardId('');
      await load();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Не удалось сохранить награду');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить награду этого дня серии?')) return;
    try {
      await deleteStreakReward(id);
      await load();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Не удалось удалить награду');
    }
  };

  return (
    <Card className="border border-zinc-700/70 bg-zinc-900/70">
      <CardBody className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <Flame className="w-5 h-5 text-orange-400" />
            Ударный режим
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            День серии, на который игрок получает награду. День засчитывается, если он прошёл или перепрошёл хотя бы одну миссию. Пропуск дня сбрасывает счётчик.
          </p>
        </div>

        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <Input
            type="number"
            min={1}
            label="День серии"
            value={day}
            onChange={(event) => setDay(event.target.value)}
          />
          <Select
            label="Тип награды"
            selectedKeys={new Set([kind])}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as StreakRewardKind | undefined;
              if (selected) setKind(selected);
            }}
          >
            {KINDS.map((item) => (
              <SelectItem key={item.id}>{item.label}</SelectItem>
            ))}
          </Select>
          {kind === 'energy' || kind === 'gems' ? (
            <Input
              type="number"
              min={1}
              label="Количество"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          ) : kind === 'case' ? (
            <Select
              label="Кейс"
              placeholder="Выберите кейс"
              selectedKeys={caseId ? new Set([caseId]) : new Set()}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string | undefined;
                setCaseId(selected || '');
              }}
            >
              {cases.map((item) => (
                <SelectItem key={String(item.id)}>{`${item.name} (#${item.id})`}</SelectItem>
              ))}
            </Select>
          ) : (
            <Select
              label="Награда"
              placeholder="Выберите награду"
              selectedKeys={rewardId ? new Set([rewardId]) : new Set()}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string | undefined;
                setRewardId(selected || '');
              }}
            >
              {rewards.map((item) => (
                <SelectItem key={String(item.id)}>{`${item.name} (#${item.id})`}</SelectItem>
              ))}
            </Select>
          )}
          <Button color="primary" isLoading={saving} onClick={() => void handleCreate()}>
            Добавить
          </Button>
        </div>

        {loading ? (
          <div className="text-sm text-zinc-400">Загрузка...</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-zinc-400">Награды серии ещё не заданы</div>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-zinc-800/70 px-3 py-2"
              >
                <div>
                  <div className="text-white font-medium">День {row.day}</div>
                  <div className="text-sm text-zinc-300">{rewardLabel(row)}</div>
                </div>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  startContent={<Trash2 size={14} />}
                  onClick={() => void handleDelete(row.id)}
                >
                  Удалить
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
