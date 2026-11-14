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
  type PushBroadcast,
} from "@/http/adminAPI";

const AUDIENCES: { key: BroadcastAudience; label: string }[] = [
  { key: "all", label: "Все, кто не отписался" },
  { key: "ru", label: "Только RU" },
  { key: "en", label: "Все, кроме RU" },
  { key: "telegram_ids", label: "Список Telegram ID" },
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
  openApp: true,
  audience: "all" as BroadcastAudience,
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
      previewBroadcast(form.audience, form.telegramIds)
        .then((result) => setPreviewCount(result.count))
        .catch(() => setPreviewCount(null));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [form.audience, form.telegramIds]);

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
      openApp: item.openApp,
      audience: item.audience,
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
        description="Сообщение уходит в Telegram всем выбранным игрокам. Картинка — JPEG, PNG или WebP до 5 МБ. HTML: <b>, <i>, <a>."
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
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={!editable || busy}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              {hasImage && <span className="text-xs text-zinc-400">Картинка уже загружена</span>}
              {file && <span className="text-xs text-zinc-300">{file.name}</span>}
              {editable && hasImage && selected && (
                <Button
                  size="sm"
                  variant="flat"
                  isDisabled={busy}
                  onPress={() =>
                    run(async () => {
                      const updated = await removeBroadcastImage(selected.id);
                      setHasImage(updated.hasImage);
                      await load();
                      return "Картинка убрана";
                    })
                  }
                >
                  Убрать картинку
                </Button>
              )}
            </div>
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
              Кнопка «Открыть приложение»
            </Switch>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="Текст кнопки-ссылки RU"
                value={form.buttonTextRu}
                isDisabled={!editable}
                onValueChange={(buttonTextRu) => setForm({ ...form, buttonTextRu })}
              />
              <Input
                label="Текст кнопки-ссылки EN"
                value={form.buttonTextEn}
                isDisabled={!editable}
                onValueChange={(buttonTextEn) => setForm({ ...form, buttonTextEn })}
              />
              <Input
                label="Ссылка https://"
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
