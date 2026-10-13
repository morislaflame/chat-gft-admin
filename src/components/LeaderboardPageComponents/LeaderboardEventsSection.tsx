import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { CalendarClock, ChevronRight, Plus } from 'lucide-react';
import {
  createLeaderboardEvent,
  getLeaderboardEvents,
  type LeaderboardEvent,
  type LeaderboardEventWrite,
} from '@/http/adminAPI';
import { EVENT_STATUS_LABEL, formatEventWhen } from '@/utils/leaderboardEvents';
import LeaderboardEventEditor from './LeaderboardEventEditor';

const STATUS_TONE: Record<LeaderboardEvent['status'], string> = {
  active: 'text-emerald-400',
  upcoming: 'text-sky-400',
  ended: 'text-zinc-400',
};

const LeaderboardEventsSection = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [events, setEvents] = useState<LeaderboardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEvents(await getLeaderboardEvents());
    } catch {
      setError('Не удалось загрузить ивенты');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (payload: LeaderboardEventWrite) => {
    const created = await createLeaderboardEvent(payload);
    onClose();
    navigate(`/leaderboard/events/${created.id}`);
  };

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Ивенты</h3>
            <p className="mt-1 max-w-2xl text-sm text-zinc-400">
              Отдельный зачёт баллов лидерборда за промежуток времени. Когда ивент заканчивается, места фиксируются,
              кейсы начисляются, бот пишет победителям. Призы выдаются вручную.
            </p>
          </div>
          <Button color="primary" startContent={<Plus size={16} />} onPress={onOpen}>
            Создать ивент
          </Button>
        </div>
        {error ? <div className="text-sm text-red-500">{error}</div> : null}
        {loading ? (
          <p className="text-sm text-zinc-500">Загрузка…</p>
        ) : events.length === 0 ? (
          <button
            type="button"
            onClick={onOpen}
            className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 px-4 py-8 text-center"
          >
            <CalendarClock className="mb-2 h-6 w-6 text-amber-400" />
            <span className="text-sm font-medium">Ивентов ещё нет</span>
            <span className="mt-1 text-xs text-zinc-500">Задайте сроки, какие баллы считать и награды по местам</span>
          </button>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/leaderboard/events/${event.id}`}
                className="flex items-center gap-3 rounded-xl border border-zinc-800 p-3 hover:border-zinc-600"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{event.title}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {formatEventWhen(event.startsAt)} — {formatEventWhen(event.endsAt)} · {event.prizePlaceCount} мест
                  </div>
                </div>
                <span className={`shrink-0 text-xs ${event.settledAt ? 'text-amber-400' : STATUS_TONE[event.status]}`}>
                  {event.settledAt ? 'Итоги зафиксированы' : EVENT_STATUS_LABEL[event.status]}
                </span>
                <ChevronRight size={16} className="shrink-0 text-zinc-500" />
              </Link>
            ))}
          </div>
        )}
      </CardBody>
      <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>Новый ивент</ModalHeader>
          <ModalBody className="pb-6">
            {isOpen ? <LeaderboardEventEditor submitLabel="Создать ивент" onSubmit={handleCreate} /> : null}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default LeaderboardEventsSection;
