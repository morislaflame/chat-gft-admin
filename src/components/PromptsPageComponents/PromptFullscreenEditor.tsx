import { useEffect, useMemo, useState } from "react";
import { Button, Chip, Input, Spinner } from "@heroui/react";
import {
  ArrowLeft,
  Columns2,
  Diff,
  FileText,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Plus,
  Save,
  WrapText,
} from "lucide-react";
import type { PromptTemplate, PromptVersion } from "@/http/adminAPI";
import { PromptCodeEditor } from "./PromptCodeEditor";
import { PromptDiffView } from "./PromptDiffView";

type EditorViewMode = "edit" | "diff" | "split";

const STATUS_COLOR: Record<string, "success" | "warning" | "default"> = {
  active: "success",
  draft: "warning",
  archived: "default",
};

const STATUS_LABEL: Record<string, string> = {
  active: "сейчас в игре",
  draft: "черновик",
  archived: "старая",
};

const CACHE_NOTE =
  "После включения нового текста игра подхватит его примерно за минуту.";

function statusLabel(status: string): string {
  return STATUS_LABEL[status] || status;
}

interface PlaceholderStatus {
  required: string[];
  missing: string[];
  ok: boolean;
}

interface PromptFullscreenEditorProps {
  open: boolean;
  loading: boolean;
  error: string | null;
  template: PromptTemplate | null;
  editorBody: string;
  changelog: string;
  editingVersion: PromptVersion | null;
  isDirty: boolean;
  saving: boolean;
  placeholderStatus: PlaceholderStatus | null;
  activeVersion: PromptVersion | null;
  onBodyChange: (value: string) => void;
  onChangelogChange: (value: string) => void;
  onClose: () => void;
  onSaveDraft: () => void;
  onSaveAndActivate: () => void;
  onActivateExisting: (version: PromptVersion) => void;
  onLoadVersion: (version: PromptVersion) => void;
  onStartNewFromCurrent: () => void;
}

function versionLabel(v: PromptVersion | null, fallback: string): string {
  if (!v) return fallback;
  return `вариант №${v.version} (${statusLabel(v.status)})`;
}

export function PromptFullscreenEditor({
  open,
  loading,
  error,
  template,
  editorBody,
  changelog,
  editingVersion,
  isDirty,
  saving,
  placeholderStatus,
  activeVersion,
  onBodyChange,
  onChangelogChange,
  onClose,
  onSaveDraft,
  onSaveAndActivate,
  onActivateExisting,
  onLoadVersion,
  onStartNewFromCurrent,
}: PromptFullscreenEditorProps) {
  const [viewMode, setViewMode] = useState<EditorViewMode>("edit");
  const [wrap, setWrap] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [compareVersionId, setCompareVersionId] = useState<number | "active" | null>("active");

  useEffect(() => {
    if (!open) return;
    setViewMode("edit");
    setCompareVersionId("active");
  }, [open, template?.id]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!saving && editorBody.trim()) onSaveDraft();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, saving, editorBody, onSaveDraft, onClose]);

  const compareBase = useMemo(() => {
    if (!template) return null;
    if (compareVersionId === "active") return activeVersion;
    if (typeof compareVersionId === "number") {
      return template.versions?.find((v) => v.id === compareVersionId) || null;
    }
    return activeVersion;
  }, [template, compareVersionId, activeVersion]);

  const compareText = compareBase?.body ?? "";
  const compareLabel = versionLabel(
    compareBase,
    compareVersionId === "active" ? "тот, что сейчас в игре (нет)" : "вариант"
  );
  const editorLabel = editingVersion
    ? `ваш черновик №${editingVersion.version}`
    : isDirty
      ? "то, что вы сейчас правите (ещё не сохранено)"
      : "то, что вы сейчас правите";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-zinc-800 bg-zinc-900/95 px-4 py-3 backdrop-blur">
        <Button
          size="sm"
          variant="flat"
          startContent={<ArrowLeft size={14} />}
          onPress={onClose}
        >
          Назад к списку
        </Button>

        <div className="min-w-0 flex-1">
          {template ? (
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-base font-semibold">{template.name}</h2>
                {isDirty ? (
                  <Chip size="sm" color="warning" variant="flat">
                    есть несохранённые правки
                  </Chip>
                ) : null}
                {editingVersion ? (
                  <Chip size="sm" color="warning" variant="flat">
                    правите черновик №{editingVersion.version}
                  </Chip>
                ) : activeVersion ? (
                  <Chip size="sm" color="success" variant="flat">
                    сейчас в игре №{activeVersion.version}
                  </Chip>
                ) : null}
              </div>
              <code className="block truncate text-xs text-emerald-300">{template.key}</code>
            </div>
          ) : (
            <span className="text-sm text-zinc-400">Текст для ИИ</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
          <Button
            size="sm"
            variant={viewMode === "edit" ? "solid" : "light"}
            color={viewMode === "edit" ? "primary" : "default"}
            startContent={<FileText size={14} />}
            onPress={() => setViewMode("edit")}
          >
            Править текст
          </Button>
          <Button
            size="sm"
            variant={viewMode === "diff" ? "solid" : "light"}
            color={viewMode === "diff" ? "primary" : "default"}
            startContent={<Diff size={14} />}
            onPress={() => setViewMode("diff")}
          >
            Что изменилось
          </Button>
          <Button
            size="sm"
            variant={viewMode === "split" ? "solid" : "light"}
            color={viewMode === "split" ? "primary" : "default"}
            startContent={<Columns2 size={14} />}
            onPress={() => setViewMode("split")}
          >
            Рядом со старым
          </Button>
        </div>

        <Button
          size="sm"
          variant="flat"
          startContent={<WrapText size={14} />}
          onPress={() => setWrap((v) => !v)}
        >
          {wrap ? "Перенос строк: вкл" : "Перенос строк: выкл"}
        </Button>
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          aria-label={sidebarOpen ? "Скрыть историю вариантов" : "Показать историю вариантов"}
          onPress={() => setSidebarOpen((v) => !v)}
        >
          {sidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </Button>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-3">
          {loading || !template ? (
            <div className="flex flex-1 items-center justify-center">
              {error ? <p className="text-sm text-red-400">{error}</p> : <Spinner />}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-3">
                <Input
                  label="Кратко: что вы поменяли"
                  size="sm"
                  className="max-w-xl"
                  value={changelog}
                  onValueChange={onChangelogChange}
                  placeholder="Например: уточнил правила артефактов"
                />
                {(viewMode === "diff" || viewMode === "split") && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-zinc-500">С чем сравнить ваш текст</label>
                    <select
                      className="h-8 rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-sm text-zinc-200"
                      value={
                        compareVersionId === "active"
                          ? "active"
                          : String(compareVersionId ?? "active")
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setCompareVersionId(val === "active" ? "active" : Number(val));
                      }}
                    >
                      <option value="active">
                        Тот, что сейчас в игре
                        {activeVersion ? ` (№${activeVersion.version})` : " (пока нет)"}
                      </option>
                      {(template.versions || []).map((v) => (
                        <option key={v.id} value={v.id}>
                          Вариант №{v.version} — {statusLabel(v.status)}
                          {template.activeVersionId === v.id ? " · сейчас в игре" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {placeholderStatus ? (
                  <p
                    className={`pb-1 text-xs ${
                      placeholderStatus.ok ? "text-zinc-400" : "text-amber-400"
                    }`}
                  >
                    Обязательные вставки в тексте:{" "}
                    {placeholderStatus.required.map((p) => `{{${p}}}`).join(", ")}
                    {!placeholderStatus.ok
                      ? ` — не хватает: ${placeholderStatus.missing
                          .map((p) => `{{${p}}}`)
                          .join(", ")}`
                      : " — всё на месте"}
                  </p>
                ) : null}
              </div>

              <div className="min-h-0 flex-1">
                {viewMode === "edit" ? (
                  <PromptCodeEditor
                    value={editorBody}
                    onChange={onBodyChange}
                    wrap={wrap}
                    ariaLabel="Редактор промпта"
                  />
                ) : null}

                {viewMode === "diff" ? (
                  <PromptDiffView
                    oldText={compareText}
                    newText={editorBody}
                    oldLabel={compareLabel}
                    newLabel={editorLabel}
                    wrap={wrap}
                  />
                ) : null}

                {viewMode === "split" ? (
                  <div className="grid h-full min-h-0 grid-cols-1 gap-3 lg:grid-cols-2">
                    <div className="flex min-h-0 flex-col gap-1">
                      <div className="text-xs text-zinc-500">
                        Было: {compareLabel}
                      </div>
                      <PromptCodeEditor
                        value={compareText}
                        onChange={() => undefined}
                        wrap={wrap}
                        readOnly
                        ariaLabel="Старый текст для сравнения"
                      />
                    </div>
                    <div className="flex min-h-0 flex-col gap-1">
                      <div className="text-xs text-zinc-500">Стало: {editorLabel}</div>
                      <PromptCodeEditor
                        value={editorBody}
                        onChange={onBodyChange}
                        wrap={wrap}
                        ariaLabel="Текст, который вы правите"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>

        {/* Versions sidebar */}
        {sidebarOpen && template ? (
          <aside className="flex w-full max-w-xs shrink-0 flex-col border-l border-zinc-800 bg-zinc-900/60 sm:w-80">
            <div className="border-b border-zinc-800 px-3 py-2 text-sm font-medium">
              История вариантов
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {(template.versions || []).map((v) => {
                const isCanonicalActive = template.activeVersionId === v.id;
                const isEditing = editingVersion?.id === v.id;
                return (
                  <div
                    key={v.id}
                    className={`rounded-lg border p-3 ${
                      isEditing
                        ? "border-amber-500/50 bg-amber-500/5"
                        : "border-zinc-800 bg-zinc-950/60"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-sm">Вариант №{v.version}</span>
                      <Chip size="sm" color={STATUS_COLOR[v.status]} variant="flat">
                        {statusLabel(v.status)}
                      </Chip>
                    </div>
                    {v.changelog ? (
                      <p className="mb-1 line-clamp-2 text-xs text-zinc-500">{v.changelog}</p>
                    ) : null}
                    <p className="mb-2 text-[10px] text-zinc-600">
                      {v.updatedAt ? new Date(v.updatedAt).toLocaleString() : null}
                      {" · "}
                      {v.body.length.toLocaleString()} симв.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {!isCanonicalActive ? (
                        <Button
                          size="sm"
                          color="success"
                          variant="flat"
                          startContent={<Play size={12} />}
                          isDisabled={saving}
                          onPress={() => onActivateExisting(v)}
                        >
                          Включить в игре
                        </Button>
                      ) : (
                        <Chip size="sm" color="success" variant="flat">
                          уже в игре
                        </Chip>
                      )}
                      <Button
                        size="sm"
                        variant={v.status === "draft" ? "flat" : "light"}
                        onPress={() => onLoadVersion(v)}
                      >
                        {v.status === "draft" ? "Продолжить правку" : "Открыть этот текст"}
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => {
                          setCompareVersionId(v.id);
                          setViewMode("diff");
                        }}
                      >
                        Сравнить с ним
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="border-t border-zinc-800 px-3 py-2 text-[11px] text-zinc-500">
              {CACHE_NOTE}
            </p>
          </aside>
        ) : null}
      </div>

      {/* Footer actions */}
      <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-zinc-800 bg-zinc-900/95 px-4 py-3">
        <span className="mr-auto hidden text-xs text-zinc-500 sm:inline">
          ⌘/Ctrl+S — сохранить черновик · Esc — закрыть
        </span>
        <Button variant="light" onPress={onClose}>
          Закрыть
        </Button>
        <Button
          variant="flat"
          startContent={<Plus size={14} />}
          onPress={onStartNewFromCurrent}
          isDisabled={!template || saving}
        >
          Взять этот текст как основу
        </Button>
        <Button
          variant="flat"
          startContent={<Save size={14} />}
          isLoading={saving}
          onPress={onSaveDraft}
          isDisabled={!template || !editorBody.trim()}
        >
          Сохранить черновик
        </Button>
        <Button
          color="primary"
          startContent={<Play size={14} />}
          isLoading={saving}
          onPress={onSaveAndActivate}
          isDisabled={
            !template ||
            !editorBody.trim() ||
            Boolean(placeholderStatus && !placeholderStatus.ok)
          }
        >
          Сохранить и включить в игре
        </Button>
      </footer>
    </div>
  );
}
