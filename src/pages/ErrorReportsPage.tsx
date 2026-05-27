import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Spinner } from "@heroui/react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Link } from "react-router-dom";
import { getErrorReports, type ClientErrorReportItem } from "@/http/errorReportAPI";
import { LLM_DEBUG_ROUTE } from "@/utils/consts";

const buildLlmDebugLink = (r: ClientErrorReportItem) => {
  const q = new URLSearchParams();
  q.set("userId", String(r.userId));
  q.set("historyName", r.historyName || "starwars");
  if (r.missionId != null) q.set("missionId", String(r.missionId));
  return `${LLM_DEBUG_ROUTE}?${q.toString()}`;
};

const ErrorReportsPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ClientErrorReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getErrorReports({ limit, offset });
      setItems(data.reports || []);
      setTotal(data.pagination?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Репорты об ошибках (чат)"
        description="Сообщения пользователей после сбоя отправки. Для поиска трассы LLM откройте LLM Debug с тем же userId и историей; номер трассы в таблице совпадает с id в LLM Debug."
        actionButton={{ label: "Обновить", onClick: () => { setOffset(0); void load(); } }}
      />

      <div className="text-sm text-white/60 max-w-3xl">
        В колонке «LLM trace» указан id из таблицы <code className="text-amber-200/90">llm_traces</code>, если пользователь передал его в репорте.
        Иначе введите в LLM Debug фильтр ID пользователя и найдите нужную строку по тексту сообщения и времени.
      </div>

      <div className="flex gap-2 items-center text-sm text-white/60">
        Всего: {total}
      </div>

      <div className="border border-white/10 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-zinc-900 text-xs text-white/70">
          <div className="col-span-2">Время</div>
          <div className="col-span-1">User</div>
          <div className="col-span-1">История</div>
          <div className="col-span-1">Миссия</div>
          <div className="col-span-1">HTTP</div>
          <div className="col-span-2">Сервер</div>
          <div className="col-span-2">Сообщение</div>
          <div className="col-span-1">Trace</div>
          <div className="col-span-1" />
        </div>
        {loading ? (
          <div className="p-6 flex items-center gap-2 text-white/70">
            <Spinner size="sm" /> Загрузка…
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-white/60">Репортов нет.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {items.map((r) => (
              <div key={r.id} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-white/90">
                <div className="col-span-2">{new Date(r.createdAt).toLocaleString()}</div>
                <div className="col-span-1">{r.userId}</div>
                <div className="col-span-1 truncate" title={r.historyName}>{r.historyName}</div>
                <div className="col-span-1">{r.missionId ?? "—"}</div>
                <div className="col-span-1">{r.httpStatus ?? "—"}</div>
                <div className="col-span-2 truncate text-red-300/80" title={r.serverMessage || ""}>
                  {r.serverMessage || "—"}
                </div>
                <div className="col-span-2 truncate" title={r.clientMessage || ""}>
                  {r.clientMessage || "—"}
                </div>
                <div className="col-span-1 font-mono text-amber-200/90">
                  {r.llmTraceId ?? "—"}
                </div>
                <div className="col-span-1 text-right">
                  <Link
                    to={buildLlmDebugLink(r)}
                    className="text-sky-300 hover:underline text-xs"
                  >
                    LLM Debug
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="flat"
          isDisabled={offset <= 0 || loading}
          onClick={() => setOffset((o) => Math.max(0, o - limit))}
        >
          Назад
        </Button>
        <Button
          size="sm"
          variant="flat"
          isDisabled={loading || offset + limit >= total}
          onClick={() => setOffset((o) => o + limit)}
        >
          Вперёд
        </Button>
      </div>
    </div>
  );
});

export default ErrorReportsPage;
