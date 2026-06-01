import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';
import { formatDate } from '@/utils/formatters';
import type { UserChatHistoryTurn } from '@/http/adminAPI';

type MissionGroup = {
  key: string;
  missionId: number | null;
  label: string;
  range: string;
  turns: UserChatHistoryTurn[];
};

function groupByMission(history: UserChatHistoryTurn[]): MissionGroup[] {
  const order: string[] = [];
  const buckets = new Map<string, { missionId: number | null; turns: UserChatHistoryTurn[] }>();

  for (const turn of history) {
    const missionId = turn.missionId ?? null;
    const key = missionId === null ? 'none' : String(missionId);
    if (!buckets.has(key)) {
      buckets.set(key, { missionId, turns: [] });
      order.push(key);
    }
    buckets.get(key)!.turns.push(turn);
  }

  return order.map((key) => {
    const { missionId, turns } = buckets.get(key)!;
    const firstAt = turns[0]?.createdAt;
    const lastAt = turns[turns.length - 1]?.createdAt;
    const range =
      firstAt && lastAt && firstAt !== lastAt
        ? `${formatDate(firstAt)} — ${formatDate(lastAt)}`
        : firstAt
          ? formatDate(firstAt)
          : '';

    return {
      key,
      missionId,
      label: missionId === null ? 'Без миссии' : `Миссия ${missionId}`,
      turns,
      range,
    };
  });
}

type ChatHistoryMissionGroupsProps = {
  history: UserChatHistoryTurn[];
};

export default function ChatHistoryMissionGroups({ history }: ChatHistoryMissionGroupsProps) {
  const groups = useMemo(() => groupByMission(history), [history]);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (groups.length === 0) {
      setExpandedKeys(new Set());
      return;
    }
    setExpandedKeys(new Set([groups[groups.length - 1].key]));
  }, [history]);

  const toggle = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (groups.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        История чата для выбранной истории не найдена.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {groups.map((group) => {
        const expanded = expandedKeys.has(group.key);
        const congratCount = group.turns.filter((t) => t.isCongratulation).length;

        return (
          <div
            key={group.key}
            className="border border-zinc-700 rounded-lg overflow-hidden"
          >
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-800/80 hover:bg-zinc-800 text-left transition-colors"
              onClick={() => toggle(group.key)}
              aria-expanded={expanded}
            >
              <ChevronDown
                size={18}
                className={`shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-100">{group.label}</div>
                <div className="text-xs text-gray-400 truncate">
                  {group.turns.length} ходов
                  {congratCount > 0 ? ` · ${congratCount} поздравл.` : ''}
                  {group.range ? ` · ${group.range}` : ''}
                </div>
              </div>
            </button>

            {expanded ? (
              <Table aria-label={`История: ${group.label}`} removeWrapper className="p-2">
                <TableHeader>
                  <TableColumn>ДАТА</TableColumn>
                  <TableColumn>МЕТА</TableColumn>
                  <TableColumn>СООБЩЕНИЕ</TableColumn>
                  <TableColumn>ОТВЕТ</TableColumn>
                </TableHeader>
                <TableBody items={group.turns}>
                  {(item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="text-xs text-gray-500">{formatDate(item.createdAt)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-400 space-y-1 max-w-[10rem]">
                          {item.mainStep != null ? <div>шаг {item.mainStep}</div> : null}
                          {item.suggestionKind ? <div>kind: {item.suggestionKind}</div> : null}
                          {item.payable ? <div className="text-amber-300">payable</div> : null}
                          {item.artifactApplied ? (
                            <div className="text-emerald-300">
                              {item.artifactActionType} {item.artifactCode}
                            </div>
                          ) : null}
                          {item.isCongratulation ? (
                            <div className="text-violet-300">поздравление</div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          {item.legacyOnlyLength ? (
                            <div className="text-xs text-gray-400 italic">
                              до обновления ({item.messageLength ?? '?'} симв.)
                            </div>
                          ) : (
                            <div className="text-sm bg-blue-500/20 rounded-lg p-2 whitespace-pre-wrap">
                              {item.userMessage || '—'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          {item.legacyOnlyLength ? (
                            <span className="text-xs text-gray-400 italic">—</span>
                          ) : item.assistantMessage ? (
                            <div className="text-sm bg-gray-500/20 rounded-lg p-2 whitespace-pre-wrap">
                              {item.assistantMessage}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Нет ответа</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
