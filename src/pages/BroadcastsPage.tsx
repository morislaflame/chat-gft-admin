import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Switch,
  Textarea,
} from "@heroui/react";
import { PageHeader } from "@/components/ui";
import {
  cancelBroadcast,
  createBroadcast,
  deleteBroadcast,
  getBroadcasts,
  launchBroadcast,
  previewBroadcast,
  removeBroadcastImage,
  updateBroadcast,
  uploadBroadcastImage,
  type BroadcastAudience,
  type BroadcastLanguage,
  type PushBroadcast,
} from "@/http/adminAPI";

const AUDIENCES: { key: BroadcastAudience; label: string }[] = [
  { key: "all", label: "Все пользователи" },
  { key: "with_balance", label: "С балансом > 0" },
  { key: "zero_balance", label: "С нулевым балансом" },
  { key: "payers", label: "Платившие" },
  { key: "non_payers", label: "Ни разу не платившие" },
  { key: "active_7d", label: "Заходили за 7 дней" },
  { key: "inactive_30d", label: "Заходили раньше, но не за последние 30 дней" },
  { key: "referrers", label: "Пригласившие хотя бы одного" },
  { key: "telegram_ids", label: "Список Telegram ID" },
];

const LANGUAGES: { key: BroadcastLanguage; label: string }[] = [
  { key: "all", label: "Все языки" },
  { key: "ru", label: "Только RU" },
  { key: "en", label: "Только EN" },
];

const STATUS_LABEL: Record<PushBroadcast["status"], string> = {
  draft: "Черновик",
  sending: "Отправляется",
  done: "Отправлена",
  cancelled: "Остановлена",
};

const emptyForm = () => ({
  title: "",
  textRu: "",
  textEn: "",
  buttonTextRu: "",
  buttonTextEn: "",
  buttonUrl: "",
  linkTextRu: "",
  linkTextEn: "",
  openApp: true,
  audience: "all" as BroadcastAudience,
  language: "all" as BroadcastLanguage,
  telegramIds: "",
});

const BroadcastsPage = observer(() => {
  const [items, setItems] = useState<PushBroadcast[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [hasImage, setHasImage] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selected = items.find((item) => item.id === selectedId) ?? null;
  const editable = !selected || selected.status === "draft";

  const load = async () => {
    const data = await getBroadcasts();
    setItems(data);
    return data;
  };

  useEffect(() => {
    load().catch((cause: Error) => setError(cause.message));
  }, []);

  const live = items.some((item) => item.status === "sending");
  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => {
      load().catch(() => undefined);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [live]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      previewBroadcast(form.audience, form.language, form.telegramIds)
        .then((result) => setPreviewCount(result.count))
        .catch(() => setPreviewCount(null));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [form.audience, form.language, form.telegramIds]);

  const fill = (item: PushBroadcast) => {
    setSelectedId(item.id);
    setHasImage(item.hasImage);
    setFile(null);
    setForm({
      title: item.title,
      textRu: item.textRu,
      textEn: item.textEn,
      buttonTextRu: item.buttonTextRu,
      buttonTextEn: item.buttonTextEn,
      buttonUrl: item.buttonUrl,
      linkTextRu: item.linkTextRu || "",
      linkTextEn: item.linkTextEn || "",
      openApp: item.openApp,
      audience: item.audience,
      language: item.language || "all",
      telegramIds: item.telegramIds,
    });
    setError(null);
    setNotice(null);
  };

  const run = async (work: () => Promise<string | void>) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const message = await work();
      if (message) setNotice(message);
    } catch (cause) {
      const response = (cause as { response?: { data?: { message?: string } } }).response;
      setError(response?.data?.message || (cause as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const persist = async (): Promise<PushBroadcast> => {
    const body = { ...form };
    const saved = selected
      ? await updateBroadcast(selected.id, body)
      : await createBroadcast(body);
    let current = saved;
    if (file) {
      current = await uploadBroadcastImage(saved.id, file);
      setFile(null);
    }
    setHasImage(current.hasImage);
    setSelectedId(current.id);
    await load();
    return current;
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <PageHeader
        title="Рассылки"
        description="Сообщение уходит в Telegram всем выбранным игрокам. Медиа — JPEG, PNG, WebP, GIF или MP4 до 20 МБ. С медиа текст не длиннее 1024 символов. HTML: <b>, <i>, <a>."
        actionButton={{
          label: "Новая",
          onClick: () => {
            setSelectedId(null);
            setHasImage(false);
            setFile(null);
            setForm(emptyForm());
            setError(null);
            setNotice(null);
          },
        }}
      />

      {error && <p className="text-sm text-red-400">{error}</p>}
      {notice && <p className="text-sm text-emerald-400">{notice}</p>}

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4">
        <Card className="bg-zinc-900">
          <CardBody className="flex flex-col gap-2">
            {items.length === 0 && <p className="text-sm text-zinc-500">Пока нет рассылок</p>}
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => fill(item)}
                className={`text-left rounded-lg px-3 py-2 border ${
                  item.id === selectedId ? "border-primary bg-zinc-800" : "border-zinc-800"
                }`}
              >
                <div className="text-sm text-white">{item.title}</div>
                <div className="text-xs text-zinc-400">
                  {STATUS_LABEL[item.status]}
                  {item.status !== "draft" &&
                    ` · ${item.sentCount}/${item.totalCount} отправлено, ${item.failedCount} ошибок, ${item.blockedCount} блок`}
                </div>
              </button>
            ))}
          </CardBody>
        </Card>

        <Card className="bg-zinc-900">
          <CardBody className="flex flex-col gap-3">
            <Input
              label="Название (только для админки)"
              value={form.title}
              isDisabled={!editable}
              onValueChange={(title) => setForm({ ...form, title })}
            />
            <Textarea
              label="Текст RU"
              minRows={4}
              value={form.textRu}
              isDisabled={!editable}
              onValueChange={(textRu) => setForm({ ...form, textRu })}
            />
            <Textarea
              label="Текст EN (если пусто, английским уйдёт русский)"
              minRows={4}
              value={form.textEn}
              isDisabled={!editable}
              onValueChange={(textEn) => setForm({ ...form, textEn })}
            />
            <label className="flex flex-col gap-1 text-sm text-zinc-300">
              Медиа
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime"
                disabled={!editable || busy}
                className="text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-white"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <span className="text-xs text-zinc-500">
                JPEG, PNG, WebP, GIF или MP4, до 20 МБ. GIF уходит анимацией.
              </span>
              {hasImage && <span className="text-xs text-zinc-400">Файл уже загружен</span>}
              {file && <span className="text-xs text-zinc-300">{file.name}</span>}
              {editable && hasImage && selected && (
                <Button
                  size="sm"
                  variant="flat"
                  className="w-fit"
                  isDisabled={busy}
                  onPress={() =>
                    run(async () => {
                      const updated = await removeBroadcastImage(selected.id);
                      setHasImage(updated.hasImage);
                      await load();
                      return "Файл убран";
                    })
                  }
                >
                  Убрать файл
                </Button>
              )}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Кому"
                selectedKeys={[form.audience]}
                isDisabled={!editable}
                onSelectionChange={(keys) => {
                  const audience = String(Array.from(keys)[0] || "all") as BroadcastAudience;
                  setForm({ ...form, audience });
                }}
              >
                {AUDIENCES.map((item) => (
                  <SelectItem key={item.key}>{item.label}</SelectItem>
                ))}
              </Select>
              <Select
                label="Язык"
                selectedKeys={[form.language]}
                isDisabled={!editable}
                onSelectionChange={(keys) => {
                  const language = String(Array.from(keys)[0] || "all") as BroadcastLanguage;
                  setForm({ ...form, language });
                }}
              >
                {LANGUAGES.map((item) => (
                  <SelectItem key={item.key}>{item.label}</SelectItem>
                ))}
              </Select>
            </div>
            {form.audience === "telegram_ids" && (
              <Textarea
                label="Telegram ID, по одному на строку"
                minRows={4}
                value={form.telegramIds}
                isDisabled={!editable}
                onValueChange={(telegramIds) => setForm({ ...form, telegramIds })}
              />
            )}
            <p className="text-xs text-zinc-400">
              Получателей сейчас: {previewCount == null ? "…" : previewCount}. Отписавшиеся от пушей не входят.
            </p>
            <Switch
              isSelected={form.openApp}
              isDisabled={!editable}
              onValueChange={(openApp) => setForm({ ...form, openApp })}
            >
              Кнопка входа в игру
            </Switch>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Текст кнопки входа RU"
                description="Пусто — «Открыть приложение»"
                value={form.buttonTextRu}
                isDisabled={!editable || !form.openApp}
                onValueChange={(buttonTextRu) => setForm({ ...form, buttonTextRu })}
              />
              <Input
                label="Текст кнопки входа EN"
                description="Пусто — «Open the app»"
                value={form.buttonTextEn}
                isDisabled={!editable || !form.openApp}
                onValueChange={(buttonTextEn) => setForm({ ...form, buttonTextEn })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="Доп. кнопка: текст RU"
                description="Вторая кнопка, не заменяет вход в игру"
                value={form.linkTextRu}
                isDisabled={!editable}
                onValueChange={(linkTextRu) => setForm({ ...form, linkTextRu })}
              />
              <Input
                label="Доп. кнопка: текст EN"
                value={form.linkTextEn}
                isDisabled={!editable}
                onValueChange={(linkTextEn) => setForm({ ...form, linkTextEn })}
              />
              <Input
                label="Доп. кнопка: ссылка https://"
                value={form.buttonUrl}
                isDisabled={!editable}
                onValueChange={(buttonUrl) => setForm({ ...form, buttonUrl })}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {editable && (
                <Button color="primary" isDisabled={busy} onPress={() => run(async () => {
                  await persist();
                  return "Сохранено";
                })}>
                  Сохранить
                </Button>
              )}
              {editable && (
                <Button
                  color="success"
                  isDisabled={busy}
                  onPress={() => {
                    if (!window.confirm(`Отправить «${form.title.trim()}»? Получателей: ${previewCount ?? "?"}.`)) return;
                    void run(async () => {
                      const saved = await persist();
                      const launched = await launchBroadcast(saved.id);
                      await load();
                      return launched.totalCount === 0
                        ? "Подходящих получателей нет"
                        : `Запущено, в очереди ${launched.totalCount}`;
                    });
                  }}
                >
                  Запустить
                </Button>
              )}
              {selected?.status === "sending" && (
                <Button
                  color="warning"
                  isDisabled={busy}
                  onPress={() =>
                    run(async () => {
                      await cancelBroadcast(selected.id);
                      await load();
                      return "Остановлена. Уже отправленные сообщения останутся";
                    })
                  }
                >
                  Остановить
                </Button>
              )}
              {selected?.status === "draft" && (
                <Button
                  color="danger"
                  variant="flat"
                  isDisabled={busy}
                  onPress={() =>
                    run(async () => {
                      await deleteBroadcast(selected.id);
                      setSelectedId(null);
                      setForm(emptyForm());
                      setHasImage(false);
                      await load();
                      return "Удалена";
                    })
                  }
                >
                  Удалить
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
});

export default BroadcastsPage;
