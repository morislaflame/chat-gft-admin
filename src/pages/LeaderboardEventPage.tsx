import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { Sparkles, Trash2 } from 'lucide-react';
import { DataTable, PageHeader } from '@/components/ui';
import {
  deleteLeaderboardEvent,
  getLeaderboardEvent,
  updateLeaderboardEvent,
  type LeaderboardEvent,
  type LeaderboardEventResult,
  type LeaderboardEventTopEntry,
  type LeaderboardEventWrite,
} from '@/http/adminAPI';
import LeaderboardEventEditor from '@/components/LeaderboardPageComponents/LeaderboardEventEditor';
import { EVENT_ACTION_LABELS, EVENT_STATUS_LABEL, formatEventWhen } from '@/utils/leaderboardEvents';

function playerName(entry: LeaderboardEventTopEntry) {
  if (entry.user.firstName) return entry.user.firstName;
  if (entry.user.username) return `@${entry.user.username}`;
  return `Игрок #${entry.user.id}`;
}

function errorMessage(err: unknown, fallback: string) {
  const errorObj = err as { response?: { data?: { message?: string } } };
  return errorObj.response?.data?.message || fallback;
}

function Points({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      {value}
      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
    </span>
  );
}

const LeaderboardEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const id = Number(eventId);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [event, setEvent] = useState<LeaderboardEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!Number.isInteger(id) || id < 1) {
      setError('Некорректный ивент');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setEvent(await getLeaderboardEvent(id));
    } catch (err: unknown) {
      setError(errorMessage(err, 'Ивент не найден'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async (payload: LeaderboardEventWrite) => {
    setError(null);
    setSuccess(null);
    const next = await updateLeaderboardEvent(id, payload);
    setEvent(next);
    setSuccess(
      next.settledAt
        ? 'Сохранено. Ивент уже закончился, итоги зафиксированы, бот отправит сообщения.'
        : 'Сохранено'
    );
  };

  const handleDelete = async () => {
    if (!event) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteLeaderboardEvent(event.id);
      onClose();
      navigate('/leaderboard');
    } catch (err: unknown) {
      onClose();
      setError(errorMessage(err, 'Не удалось удалить ивент'));
    } finally {
      setDeleting(false);
    }
  };

  const results = event?.results || [];
  const top = event?.stats?.top || [];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={event?.title || 'Ивент'}
        description={
          event
            ? `${event.settledAt ? 'Итоги зафиксированы' : EVENT_STATUS_LABEL[event.status]} · ${formatEventWhen(event.startsAt)} — ${formatEventWhen(event.endsAt)}`
            : 'Статистика и награды'
        }
        secondaryActionButton={{
          label: 'К лидерборду',
          onClick: () => navigate('/leaderboard'),
          variant: 'flat',
        }}
      />

      {error ? (
        <Card className="border border-red-500">
          <CardBody>
            <div className="text-sm text-red-500">{error}</div>
          </CardBody>
        </Card>
      ) : null}
      {success ? (
        <Card className="border border-emerald-500">
          <CardBody>
            <div className="text-sm text-emerald-500">{success}</div>
          </CardBody>
        </Card>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      ) : event ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card>
              <CardBody>
                <div className="text-xs text-zinc-400">Участники</div>
                <div className="text-2xl font-semibold">{event.stats?.participants ?? 0}</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="text-xs text-zinc-400">Сумма баллов</div>
                <div className="text-2xl font-semibold">
                  <Points value={event.stats?.totalPoints ?? 0} />
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="text-xs text-zinc-400">Учитываются</div>
                <div className="text-sm">
                  {event.allActions
                    ? 'Все действия лидерборда'
                    : event.actionTypes.map((type) => EVENT_ACTION_LABELS[type] || type).join(', ')}
                </div>
              </CardBody>
            </Card>
          </div>

          <DataTable
            title="По действиям"
            columns={[
              { key: 'action', label: 'Действие' },
              { key: 'points', label: 'Баллы' },
              { key: 'eventCount', label: 'Начислений' },
            ]}
            data={(event.stats?.byAction || []).map((row) => ({ ...row, id: row.actionType }))}
            emptyMessage="За этот промежуток баллов нет"
            renderCell={(item, columnKey) => {
              if (columnKey === 'action') return EVENT_ACTION_LABELS[item.actionType] || item.actionType;
              if (columnKey === 'points') return <Points value={item.points} />;
              if (columnKey === 'eventCount') return item.eventCount;
              return '-';
            }}
          />

          {event.settledAt ? (
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">
                Места записаны {formatEventWhen(event.settledAt)}. Призы выдаются вручную. Кейсы, энергия и гемы уже начислены.
              </p>
              <DataTable
                title="Зафиксированные итоги"
                columns={[
                  { key: 'rank', label: 'Место' },
                  { key: 'player', label: 'Игрок' },
                  { key: 'userId', label: 'ID' },
                  { key: 'points', label: 'Баллы' },
                  { key: 'prizes', label: 'Призы (вручную)' },
                  { key: 'cases', label: 'Кейсы (начислены)' },
                  { key: 'currency', label: 'Энергия и гемы' },
                ]}
                data={results.map((row) => ({ ...row, id: row.user.id }))}
                emptyMessage="В призовые места никто не попал"
                renderCell={(item, columnKey) => {
                  const row = item as LeaderboardEventResult;
                  if (columnKey === 'rank') return row.rank;
                  if (columnKey === 'player') return playerName(row);
                  if (columnKey === 'userId') return row.user.id;
                  if (columnKey === 'points') return <Points value={row.points} />;
                  if (columnKey === 'prizes') return row.prizes.map((prize) => prize.name).join(', ') || '—';
                  if (columnKey === 'cases') {
                    return (
                      row.cases
                        .map((caseRow) => (caseRow.quantity > 1 ? `${caseRow.name} ×${caseRow.quantity}` : caseRow.name))
                        .join(', ') || '—'
                    );
                  }
                  if (columnKey === 'currency') {
                    const parts = [];
                    if ((row.energy || 0) > 0) parts.push(`${row.energy} энергии`);
                    if ((row.gems || 0) > 0) parts.push(`${row.gems} гемов`);
                    return parts.join(', ') || '—';
                  }
                  return '-';
                }}
              />
            </div>
          ) : (
            <DataTable
              title="Текущая таблица"
              columns={[
                { key: 'rank', label: 'Место' },
                { key: 'player', label: 'Игрок' },
                { key: 'userId', label: 'ID' },
                { key: 'points', label: 'Баллы' },
              ]}
              data={top.map((row) => ({ ...row, id: row.user.id }))}
              emptyMessage="Пока никто не набрал баллы"
              renderCell={(item, columnKey) => {
                const row = item as LeaderboardEventTopEntry;
                if (columnKey === 'rank') return row.rank;
                if (columnKey === 'player') return playerName(row);
                if (columnKey === 'userId') return row.user.id;
                if (columnKey === 'points') return <Points value={row.points} />;
                return '-';
              }}
            />
          )}

          <Card>
            <CardBody className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Условия и награды</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    {event.settledAt
                      ? 'После фиксации сроки, действия и награды уже не меняются.'
                      : 'Когда наступит конец ивента, места и награды зафиксируются сами, а бот напишет победителям.'}
                  </p>
                </div>
                {!event.settledAt ? (
                  <Button color="danger" variant="flat" startContent={<Trash2 size={16} />} onPress={onOpen}>
                    Удалить ивент
                  </Button>
                ) : null}
              </div>
              {!event.settledAt ? (
                <LeaderboardEventEditor initial={event} submitLabel="Сохранить" onSubmit={handleSave} />
              ) : null}
            </CardBody>
          </Card>
        </>
      ) : null}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Удалить ивент?</ModalHeader>
          <ModalBody>
            Ивент «{event?.title}» пропадёт у игроков вместе с условиями и наградами. Баллы лидерборда не изменятся.
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={deleting}>
              Отмена
            </Button>
            <Button color="danger" onPress={handleDelete} isLoading={deleting}>
              Удалить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default LeaderboardEventPage;
