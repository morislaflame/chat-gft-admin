import React, { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Input, Modal, ModalBody, ModalContent, ModalHeader, Spinner } from "@heroui/react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLLMTraceById, getLLMTraces, type LLMTraceDetails, type LLMTraceListItem } from "@/http/llmTraceAPI";

const JsonBlock = ({ value }: { value: unknown }) => (
  <pre className="text-xs whitespace-pre-wrap break-words bg-zinc-900/60 border border-white/10 rounded-lg p-3 text-white/90 max-h-[420px] overflow-auto">
    {JSON.stringify(value, null, 2)}
  </pre>
);

/** Renders prompt/system_prompt text with line breaks and basic markdown-style highlighting */
const PromptBlock = ({ value, className = "" }: { value: string | null | undefined; className?: string }) => {
  if (value == null || typeof value !== "string") {
    return (
      <pre className={`text-xs whitespace-pre-wrap break-words bg-zinc-900/60 border border-white/10 rounded-lg p-3 text-white/50 max-h-[420px] overflow-auto ${className}`}>
        (empty)
      </pre>
    );
  }
  // Normalize: handle escaped \n (e.g. from double-encoded JSON) and different line endings
  const normalized = value.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  let inCodeBlock = false;
  return (
    <pre className={`text-xs whitespace-pre-wrap break-words bg-zinc-900/60 border border-white/10 rounded-lg p-3 text-white/90 max-h-[420px] overflow-auto font-mono leading-relaxed ${className}`}>
      {lines.map((line, i) => {
        const trimmed = line.trimStart();
        if (trimmed.startsWith("```")) {
          inCodeBlock = !inCodeBlock;
          return (
            <span key={i} className={inCodeBlock ? "block bg-zinc-800/80 -mx-3 px-3 py-1 my-0.5" : ""}>
              {line}
              {"\n"}
            </span>
          );
        }
        if (inCodeBlock) {
          return (
            <span key={i} className="block bg-zinc-800/80 -mx-3 px-3 py-0.5 text-amber-200/90">
              {line}
              {"\n"}
            </span>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <span key={i} className="block text-amber-300 font-semibold mt-2 first:mt-0">
              {line}
              {"\n"}
            </span>
          );
        }
        if (trimmed.startsWith("- **") || trimmed.startsWith("- ")) {
          return (
            <span key={i} className="block text-emerald-200/90 pl-1">
              {line}
              {"\n"}
            </span>
          );
        }
        return (
          <span key={i}>
            {line}
            {"\n"}
          </span>
        );
      })}
    </pre>
  );
};

const LLMDebugPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<LLMTraceListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const [userId, setUserId] = useState("");
  const [historyName, setHistoryName] = useState("starwars");
  const [missionId, setMissionId] = useState("");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState<LLMTraceDetails | null>(null);

  const params = useMemo(() => {
    const p: { limit: number; offset: number; userId?: number; historyName?: string; missionId?: number } = { limit, offset };
    if (userId.trim()) p.userId = Number(userId.trim());
    if (historyName.trim()) p.historyName = historyName.trim();
    if (missionId.trim()) p.missionId = Number(missionId.trim());
    return p;
  }, [userId, historyName, missionId, limit, offset]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getLLMTraces(params);
      setItems(data.traces || []);
      setTotal(data.pagination?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  const openDetails = async (id: number) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const data = await getLLMTraceById(id);
      setDetails(data);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="LLM Debug Logs"
        description="Persisted traces of request/response payloads across the full message pipeline."
        actionButton={{ label: "Refresh", onClick: () => { setOffset(0); void load(); } }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input label="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g. 13" />
        <Input label="History" value={historyName} onChange={(e) => setHistoryName(e.target.value)} placeholder="starwars" />
        <Input label="Mission ID" value={missionId} onChange={(e) => setMissionId(e.target.value)} placeholder="(optional)" />
      </div>

      <div className="flex gap-2">
        <Button onClick={() => { setOffset(0); void load(); }} disabled={loading}>
          Apply filters
        </Button>
        <div className="text-sm text-white/60 self-center">
          Total: {total}
        </div>
      </div>

      <div className="border border-white/10 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-zinc-900 text-xs text-white/70">
          <div className="col-span-2">Time</div>
          <div className="col-span-1">User</div>
          <div className="col-span-2">History</div>
          <div className="col-span-1">Mission</div>
          <div className="col-span-1">ms</div>
          <div className="col-span-2">Step</div>
          <div className="col-span-2">Message</div>
          <div className="col-span-1">Error</div>
          <div className="col-span-1" />
        </div>
        {loading ? (
          <div className="p-6 flex items-center gap-2 text-white/70">
            <Spinner size="sm" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-white/60">No traces found.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {items.map((t) => (
              <div key={t.id} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-white/90">
                <div className="col-span-2">{new Date(t.createdAt).toLocaleString()}</div>
                <div className="col-span-1">{t.userId}</div>
                <div className="col-span-2">{t.historyName}</div>
                <div className="col-span-1">{t.missionId ?? "-"}</div>
                <div className="col-span-1">{t.durationMs ?? "-"}</div>
                <div className="col-span-2 text-white/70">
                  {t.backendComputed?.stepDecision?.mainStepBefore != null
                    ? `${t.backendComputed.stepDecision.mainStepBefore}→${t.backendComputed.stepDecision.mainStepAfter ?? "?"}`
                    : "-"}
                  {t.backendComputed?.stepDecision?.allowIncrement === true ? " ✓" : ""}
                </div>
                <div className="col-span-2 truncate">{t.clientRequest?.message || ""}</div>
                <div className={`col-span-1 truncate ${t.error ? "text-red-300/80" : "text-white/50"}`}>
                  {t.error || "-"}
                </div>
                <div className="col-span-1 text-right">
                  <Button size="sm" variant="light" onClick={() => void openDetails(t.id)}>
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="light"
          disabled={offset <= 0 || loading}
          onClick={() => setOffset(Math.max(0, offset - limit))}
        >
          Prev
        </Button>
        <Button
          variant="light"
          disabled={offset + limit >= total || loading}
          onClick={() => setOffset(offset + limit)}
        >
          Next
        </Button>
        <div className="text-xs text-white/60 self-center">
          Offset: {offset}
        </div>
      </div>

      <Modal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} size="5xl" scrollBehavior="inside" className='dark'>
        <ModalContent>
          <ModalHeader>Детали трассировки</ModalHeader>
          <ModalBody>
            {detailsLoading ? (
              <div className="p-6 flex items-center gap-2 text-white/70">
                <Spinner size="sm" /> Loading…
              </div>
            ) : !details ? (
              <div className="p-6 text-white/60">No details.</div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-white/70">
                  #{details.id} • {details.historyName} • user={details.userId} • missionId={details.missionId ?? "-"} • {details.durationMs ?? "-"}ms
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-white/70 mb-1">Решение по шагу (бек)</div>
                    <JsonBlock value={details.backendComputed?.stepDecision ?? null} />
                  </div>
                  <div>
                    <div className="text-sm text-white/70 mb-1">Решение по шагу (LLM-сервис, debug_trace)</div>
                    <JsonBlock value={details.llmDebugTrace?.computed ?? null} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-white/70 mb-1">Запрос клиента → бек</div>
                    <JsonBlock value={details.clientRequest} />
                  </div>
                  <div>
                    <div className="text-sm text-white/70 mb-1">Ответ бека → клиент</div>
                    <JsonBlock value={details.backendResponse} />
                  </div>
                  <div>
                    <div className="text-sm text-white/70 mb-1">Бек → LLM-сервис (вход сервиса)</div>
                    <JsonBlock value={details.llmRequest} />
                  </div>
                  <div>
                    <div className="text-sm text-white/70 mb-1">LLM-сервис → бек (сырой ответ сервиса)</div>
                    <JsonBlock value={details.llmResponse} />
                  </div>
                </div>
                {(() => {
                  const trace = details.llmDebugTrace ?? (details.llmResponse as Record<string, unknown>)?.debug_trace;
                  const traceObj = trace && typeof trace === "object" ? (trace as Record<string, unknown>) : null;
                  const systemPrompt = typeof traceObj?.system_prompt === "string" ? traceObj.system_prompt : null;
                  const prompt = typeof traceObj?.prompt === "string" ? traceObj.prompt : null;
                  return (
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-white/70 mb-1">LLM-сервис → LLM (system_prompt)</div>
                        <PromptBlock value={systemPrompt} />
                      </div>
                      <div>
                        <div className="text-sm text-white/70 mb-1">LLM-сервис → LLM (prompt)</div>
                        <PromptBlock value={prompt} className="max-h-[560px]" />
                      </div>
                    </div>
                  );
                })()}
                <div>
                  <div className="text-sm text-white/70 mb-1">LLM debug_trace (весь объект)</div>
                  <JsonBlock value={details.llmDebugTrace} />
                </div>
                {details.error ? (
                  <div>
                    <div className="text-sm text-white/70 mb-1">Ошибка</div>
                    <div className="text-xs text-red-300 whitespace-pre-wrap">{details.error}</div>
                  </div>
                ) : null}
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
});

export default LLMDebugPage;

