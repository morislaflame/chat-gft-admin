import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { FileText, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { PromptFullscreenEditor } from "@/components/PromptsPageComponents";
import {
  activatePromptVersion,
  createPromptVersion,
  getPromptTemplate,
  getPromptTemplates,
  seedPromptTemplates,
  type PromptCategory,
  type PromptTemplate,
  type PromptVersion,
} from "@/http/adminAPI";

const CATEGORY_LABELS: Record<PromptCategory | "all", string> = {
  all: "Все разделы",
  engine: "Правила игры",
  compose: "Сборка ответа",
  runtime: "Контекст хода",
};

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
const CACHE_NOTE =
  "После включения нового текста игра подхватит его примерно за минуту.";

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message === "string"
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function extractPlaceholders(body: string): string[] {
  const found = new Set<string>();
  for (const match of body.matchAll(PLACEHOLDER_RE)) {
    found.add(match[1]);
  }
  return [...found];
}

function resolveActiveVersion(template: PromptTemplate): PromptVersion | null {
  if (template.activeVersionId && template.versions?.length) {
    const byId = template.versions.find((v) => v.id === template.activeVersionId);
    if (byId) return byId;
  }
  if (template.activeVersion && "body" in template.activeVersion && template.activeVersion.body) {
    return template.activeVersion as PromptVersion;
  }
  return template.versions?.find((v) => v.status === "active") || null;
}

function resolveDraftVersion(template: PromptTemplate): PromptVersion | null {
  return template.versions?.find((v) => v.status === "draft") || null;
}

const PromptsPage = observer(() => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [category, setCategory] = useState<PromptCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PromptTemplate | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [editorBody, setEditorBody] = useState("");
  const [changelog, setChangelog] = useState("");
  const [baselineBody, setBaselineBody] = useState("");
  const [baselineChangelog, setBaselineChangelog] = useState("");
  const [editingVersion, setEditingVersion] = useState<PromptVersion | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(
    null
  );
  const listAbortRef = useRef<AbortController | null>(null);
  const detailAbortRef = useRef<AbortController | null>(null);
  const detailRequestId = useRef(0);

  const isDirty = editorBody !== baselineBody || changelog !== baselineChangelog;

  const showToast = useCallback((message: string, type: "error" | "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 5000);
  }, []);

  const confirmIfDirty = useCallback(
    (message = "Есть несохранённые правки. Закрыть и потерять их?") => {
      if (!isDirty) return true;
      return window.confirm(message);
    },
    [isDirty]
  );

  const setEditorSnapshot = useCallback(
    (body: string, log: string, version: PromptVersion | null) => {
      setEditorBody(body);
      setChangelog(log);
      setBaselineBody(body);
      setBaselineChangelog(log);
      setEditingVersion(version);
    },
    []
  );

  const loadList = useCallback(async () => {
    listAbortRef.current?.abort();
    const controller = new AbortController();
    listAbortRef.current = controller;
    setLoading(true);
    setListError(null);
    try {
      const data = await getPromptTemplates(
        category === "all" ? undefined : category,
        controller.signal
      );
      if (!controller.signal.aborted) {
        setTemplates(data);
      }
    } catch (e) {
      if ((e as { code?: string; name?: string })?.code === "ERR_CANCELED") return;
      if ((e as { name?: string })?.name === "CanceledError") return;
      console.error(e);
      if (!controller.signal.aborted) {
        setListError(getErrorMessage(e, "Не удалось загрузить список промптов"));
        setTemplates([]);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void loadList();
    return () => listAbortRef.current?.abort();
  }, [loadList]);

  useEffect(() => {
    if (!editorOpen || !isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [editorOpen, isDirty]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) =>
        t.key.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q)
    );
  }, [templates, search]);

  const placeholderStatus = useMemo(() => {
    if (!selected) return null;
    const required = selected.placeholders || [];
    if (!required.length) return null;
    const found = new Set(extractPlaceholders(editorBody));
    const missing = required.filter((p) => !found.has(p));
    return { required, missing, ok: missing.length === 0 };
  }, [selected, editorBody]);

  const activeVersion = selected ? resolveActiveVersion(selected) : null;

  const applyTemplateToEditor = useCallback(
    (full: PromptTemplate) => {
      const active = resolveActiveVersion(full);
      const draft = resolveDraftVersion(full);
      if (draft) {
        setEditorSnapshot(draft.body, draft.changelog || "", draft);
      } else if (active?.body) {
        setEditorSnapshot(active.body, "", null);
      } else {
        setEditorSnapshot("", "", null);
      }
    },
    [setEditorSnapshot]
  );

  const openTemplate = async (id: number) => {
    detailAbortRef.current?.abort();
    const controller = new AbortController();
    detailAbortRef.current = controller;
    const requestId = ++detailRequestId.current;
    setDetailLoading(true);
    setDetailError(null);
    setEditorOpen(true);
    try {
      const full = await getPromptTemplate(id, controller.signal);
      if (requestId !== detailRequestId.current) return;
      setSelected(full);
      applyTemplateToEditor(full);
    } catch (e) {
      if ((e as { code?: string })?.code === "ERR_CANCELED") return;
      console.error(e);
      if (requestId !== detailRequestId.current) return;
      setDetailError(getErrorMessage(e, "Не удалось открыть шаблон"));
      setSelected(null);
      setEditorOpen(false);
      showToast(getErrorMessage(e, "Не удалось открыть шаблон"), "error");
    } finally {
      if (requestId === detailRequestId.current) setDetailLoading(false);
    }
  };

  const handleCloseEditor = useCallback(() => {
    if (!confirmIfDirty()) return;
    detailAbortRef.current?.abort();
    setEditorOpen(false);
    setSelected(null);
    setDetailError(null);
    setEditorSnapshot("", "", null);
  }, [confirmIfDirty, setEditorSnapshot]);

  const handleSeed = async () => {
    if (
      !window.confirm(
        "Загрузить стартовые тексты?\n\nДобавятся только те, которых ещё нет. Уже включённые в игре тексты не перезапишутся."
      )
    ) {
      return;
    }
    setSeeding(true);
    try {
      const result = await seedPromptTemplates(false);
      showToast(
        `Готово: добавлено ${result.created.length}, уже были ${result.skipped.length}`,
        "success"
      );
      await loadList();
    } catch (e) {
      console.error(e);
      showToast(getErrorMessage(e, "Не удалось загрузить стартовые тексты"), "error");
    } finally {
      setSeeding(false);
    }
  };

  const handleSaveDraft = useCallback(async () => {
    if (!selected) return;
    if (placeholderStatus && !placeholderStatus.ok) {
      showToast(
        `Не хватает обязательных вставок: ${placeholderStatus.missing
          .map((p) => `{{${p}}}`)
          .join(", ")}`,
        "error"
      );
      return;
    }
    setSaving(true);
    try {
      const updated = await createPromptVersion(selected.id, {
        body: editorBody,
        changelog: changelog.trim() ? changelog : null,
        activate: false,
      });
      setSelected(updated);
      const draft = resolveDraftVersion(updated);
      if (draft) {
        setEditorSnapshot(draft.body, draft.changelog || "", draft);
      } else {
        setBaselineBody(editorBody);
        setBaselineChangelog(changelog);
      }
      await loadList();
      showToast("Черновик сохранён", "success");
    } catch (e) {
      console.error(e);
      showToast(getErrorMessage(e, "Не удалось сохранить"), "error");
    } finally {
      setSaving(false);
    }
  }, [
    selected,
    placeholderStatus,
    editorBody,
    changelog,
    setEditorSnapshot,
    loadList,
    showToast,
  ]);

  const handleSaveAndActivate = useCallback(async () => {
    if (!selected) return;
    if (placeholderStatus && !placeholderStatus.ok) {
      showToast(
        `Не хватает обязательных вставок: ${placeholderStatus.missing
          .map((p) => `{{${p}}}`)
          .join(", ")}`,
        "error"
      );
      return;
    }
    const targetLabel = editingVersion
      ? `черновик №${editingVersion.version}`
      : "этот текст";
    if (
      !window.confirm(
        `Включить ${targetLabel} для «${selected.name}» в игре?\n\nИгроки сразу начнут получать ответы по новому тексту.\n${CACHE_NOTE}`
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      let full: PromptTemplate;
      if (editingVersion && editingVersion.status === "draft") {
        full = await activatePromptVersion(editingVersion.id, {
          body: editorBody,
          changelog: changelog.trim() ? changelog : null,
        });
      } else {
        full = await createPromptVersion(selected.id, {
          body: editorBody,
          changelog: changelog.trim() ? changelog : "Включили новый текст в игре",
          activate: true,
        });
      }
      setSelected(full);
      const active = resolveActiveVersion(full);
      setEditorSnapshot(active?.body || editorBody, "", null);
      await loadList();
      showToast(`Текст включён в игре. ${CACHE_NOTE}`, "success");
    } catch (e) {
      console.error(e);
      showToast(getErrorMessage(e, "Не удалось включить текст в игре"), "error");
    } finally {
      setSaving(false);
    }
  }, [
    selected,
    placeholderStatus,
    editingVersion,
    editorBody,
    changelog,
    setEditorSnapshot,
    loadList,
    showToast,
  ]);

  const handleActivateExisting = useCallback(
    async (version: PromptVersion) => {
      if (!selected) return;

      const activatingCurrentDraft =
        editingVersion?.id === version.id && version.status === "draft";

      if (isDirty && activatingCurrentDraft) {
        if (
          !window.confirm(
            `Сохранить правки в черновике №${version.version} и включить его в игре?\n\n${CACHE_NOTE}`
          )
        ) {
          return;
        }
      } else if (isDirty) {
        if (
          !window.confirm(
            `Есть несохранённые правки.\nВключить вариант №${version.version} без этих правок? То, что вы набрали сейчас, пропадёт.\n\n${CACHE_NOTE}`
          )
        ) {
          return;
        }
      } else if (
        !window.confirm(
          `Включить вариант №${version.version} для «${selected.name}» в игре?\n\n${CACHE_NOTE}`
        )
      ) {
        return;
      }

      setSaving(true);
      try {
        const payload =
          activatingCurrentDraft && isDirty
            ? {
                body: editorBody,
                changelog: changelog.trim() ? changelog : null,
              }
            : undefined;
        const full = await activatePromptVersion(version.id, payload);
        setSelected(full);
        const active = resolveActiveVersion(full);
        setEditorSnapshot(active?.body || "", "", null);
        await loadList();
        showToast(`Вариант №${version.version} включён в игре. ${CACHE_NOTE}`, "success");
      } catch (e) {
        console.error(e);
        showToast(getErrorMessage(e, "Не удалось включить этот вариант"), "error");
      } finally {
        setSaving(false);
      }
    },
    [
      selected,
      editingVersion,
      isDirty,
      editorBody,
      changelog,
      setEditorSnapshot,
      loadList,
      showToast,
    ]
  );

  const startNewFromCurrent = useCallback(() => {
    if (!selected) return;
    const draft = resolveDraftVersion(selected);
    if (draft) {
      if (
        !window.confirm(
          `Уже есть черновик №${draft.version}. Продолжить править его?\n(Второй черновик не создаётся — при сохранении обновится этот.)`
        )
      ) {
        return;
      }
      if (!confirmIfDirty()) return;
      setEditorSnapshot(editorBody || draft.body, changelog || draft.changelog || "", draft);
      showToast(`Теперь правите черновик №${draft.version}`, "success");
      return;
    }
    setEditingVersion(null);
    setBaselineBody(editorBody);
    setBaselineChangelog(changelog);
    setChangelog(changelog || `Копия от ${new Date().toLocaleString()}`);
    showToast("При сохранении этот текст станет черновиком", "success");
  }, [selected, confirmIfDirty, editorBody, changelog, setEditorSnapshot, showToast]);

  const loadVersionIntoEditor = useCallback(
    (version: PromptVersion) => {
      if (!confirmIfDirty()) return;
      if (version.status === "draft") {
        setEditorSnapshot(version.body, version.changelog || "", version);
      } else {
        setEditorSnapshot(version.body, "", null);
      }
    },
    [confirmIfDirty, setEditorSnapshot]
  );

  return (
    <div className="p-6 space-y-6">
      {toast ? (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div
            role="status"
            className={`rounded-lg px-4 py-3 text-sm shadow-lg border ${
              toast.type === "error"
                ? "bg-red-500/90 border-red-400 text-white"
                : "bg-green-500/90 border-green-400 text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}

      <PageHeader
        title="Тексты для ИИ"
        description="Здесь правятся общие правила ответов бота. Стиль истории и текст миссий по-прежнему настраиваются в разделе Agents."
      />

      <div className="flex flex-wrap gap-3 items-end">
        <Select
          label="Раздел"
          className="max-w-xs"
          selectedKeys={[category]}
          onChange={(e) => setCategory((e.target.value as PromptCategory | "all") || "all")}
        >
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <SelectItem key={key}>{label}</SelectItem>
          ))}
        </Select>
        <Input
          label="Поиск"
          className="max-w-sm"
          value={search}
          onValueChange={setSearch}
          placeholder="название или код"
        />
        <Button
          color="primary"
          variant="bordered"
          startContent={<RefreshCw size={16} />}
          isLoading={seeding}
          onPress={() => void handleSeed()}
        >
          Загрузить стартовые тексты
        </Button>
        <Button variant="flat" startContent={<RefreshCw size={16} />} onPress={() => void loadList()}>
          Обновить список
        </Button>
      </div>

      <Card className="bg-zinc-900 border border-zinc-800">
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : listError ? (
            <div className="text-red-400 text-sm py-8 text-center space-y-3">
              <p>{listError}</p>
              <Button size="sm" variant="flat" onPress={() => void loadList()}>
                Повторить
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-zinc-400 text-sm py-8 text-center space-y-3">
              <p>Пока пусто. Нажмите «Загрузить стартовые тексты», чтобы добавить готовые правила.</p>
            </div>
          ) : (
            <Table aria-label="Тексты для ИИ">
              <TableHeader>
                <TableColumn>КОД</TableColumn>
                <TableColumn>НАЗВАНИЕ</TableColumn>
                <TableColumn>РАЗДЕЛ</TableColumn>
                <TableColumn>В ИГРЕ</TableColumn>
                <TableColumn>ВСТАВКИ</TableColumn>
                <TableColumn> </TableColumn>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <code className="text-xs text-emerald-300">{t.key}</code>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{t.name}</div>
                      {t.description ? (
                        <div className="text-xs text-zinc-500 line-clamp-1">{t.description}</div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {CATEGORY_LABELS[t.category]}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {t.activeVersion ? (
                        <Chip size="sm" color="success" variant="flat">
                          вариант №{t.activeVersion.version}
                        </Chip>
                      ) : (
                        <Chip size="sm" variant="flat">
                          не включён
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-zinc-500">
                        {(t.placeholders || []).map((p) => `{{${p}}}`).join(", ") || "нет"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<FileText size={14} />}
                        onPress={() => void openTemplate(t.id)}
                      >
                        Править
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <PromptFullscreenEditor
        open={editorOpen}
        loading={detailLoading}
        error={detailError}
        template={selected}
        editorBody={editorBody}
        changelog={changelog}
        editingVersion={editingVersion}
        isDirty={isDirty}
        saving={saving}
        placeholderStatus={placeholderStatus}
        activeVersion={activeVersion}
        onBodyChange={setEditorBody}
        onChangelogChange={setChangelog}
        onClose={handleCloseEditor}
        onSaveDraft={() => void handleSaveDraft()}
        onSaveAndActivate={() => void handleSaveAndActivate()}
        onActivateExisting={(v) => void handleActivateExisting(v)}
        onLoadVersion={loadVersionIntoEditor}
        onStartNewFromCurrent={startNewFromCurrent}
      />
    </div>
  );
});

export default PromptsPage;
