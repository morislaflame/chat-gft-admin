import { useEffect, useMemo, useRef, useState, useContext } from "react";
import { observer } from "mobx-react-lite";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea, useDisclosure } from "@heroui/react";
import { Plus, Trash2, Edit, Upload, ShoppingCart, TrendingUp } from "lucide-react";
import Lottie from "lottie-react";
import { Context, type IStoreContext } from "@/store/StoreProvider";
import { PageHeader } from "@/components/ui";
import type { Artifact, ArtifactBoostType } from "@/http/artifactAPI";
import { getArtifactMarketStats, type ArtifactMarketStatsResponse } from "@/http/artifactMarketAPI";
import { MediaUploadField } from "@/components/AgentsPageComponents/MediaUploadField";

const BOOST_TYPES: ArtifactBoostType[] = ["HELPER", "KEY", "WEAPON", "ARMOR", "TRINKET"];

const ArtifactsPage = observer(() => {
  const { artifact, agent } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState<Artifact | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    nameEn: "",
    description: "",
    descriptionEn: "",
    level: "1",
    boostType: "TRINKET" as ArtifactBoostType,
    agentId: "" as string | number,
    buyPrice: "",
    sellPrice: "",
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewAnimation, setPreviewAnimation] = useState<Record<string, unknown> | null>(null);
  const [marketStats, setMarketStats] = useState<ArtifactMarketStatsResponse | null>(null);
  const [marketStatsLoading, setMarketStatsLoading] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    artifact.fetchAllArtifacts();
  }, [artifact]);

  const loadMarketStats = async () => {
    setMarketStatsLoading(true);
    try {
      const data = await getArtifactMarketStats();
      setMarketStats(data);
    } catch (e) {
      console.error("Failed to load artifact market stats:", e);
    } finally {
      setMarketStatsLoading(false);
    }
  };

  useEffect(() => {
    void loadMarketStats();
  }, []);

  useEffect(() => {
    agent.fetchAllAgents();
  }, [agent]);

  const sorted = useMemo(() => {
    return [...artifact.artifacts].sort((a, b) => b.id - a.id);
  }, [artifact.artifacts]);

  const groupedByStory = useMemo(() => {
    const groups = new Map<string, { title: string; artifacts: Artifact[] }>();

    for (const item of sorted) {
      const storyKey = item.agentId ? String(item.agentId) : "__no_story__";
      const storyTitle = item.agent
        ? (item.agent.displayName || item.agent.historyName)
        : "Без истории";

      if (!groups.has(storyKey)) {
        groups.set(storyKey, { title: storyTitle, artifacts: [] });
      }

      groups.get(storyKey)?.artifacts.push(item);
    }

    return Array.from(groups.values()).sort((a, b) => {
      if (a.title === "Без истории") return 1;
      if (b.title === "Без истории") return -1;
      return a.title.localeCompare(b.title, "ru");
    });
  }, [sorted]);

  const openCreate = () => {
    setSelected(null);
    setIsEditing(false);
    setMediaFile(null);
    setPreviewAnimation(null);
    if (mediaInputRef.current) {
      mediaInputRef.current.value = "";
    }
    setForm({
      code: "",
      name: "",
      nameEn: "",
      description: "",
      descriptionEn: "",
      level: "1",
      boostType: "TRINKET",
      agentId: "",
      buyPrice: "",
      sellPrice: "",
    });
    onOpen();
  };

  useEffect(() => {
    if (mediaFile?.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as Record<string, unknown>;
          setPreviewAnimation(data);
        } catch {
          setPreviewAnimation(null);
        }
      };
      reader.readAsText(mediaFile);
    } else {
      setPreviewAnimation(null);
    }
  }, [mediaFile]);

  const openEdit = (a: Artifact) => {
    setSelected(a);
    setIsEditing(true);
    setMediaFile(null);
    setPreviewAnimation(null);
    setForm({
      code: a.code,
      name: a.name,
      nameEn: a.nameEn || "",
      description: a.description || "",
      descriptionEn: a.descriptionEn || "",
      level: String(a.level ?? 1),
      boostType: a.boostType,
      agentId: a.agentId ?? "",
      buyPrice: a.buyPrice != null ? String(a.buyPrice) : "",
      sellPrice: a.sellPrice != null ? String(a.sellPrice) : "",
    });
    onOpen();
  };

  const onSave = async () => {
    if (!form.code.trim() || !form.name.trim()) return;
    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      nameEn: form.nameEn.trim() || null,
      description: form.description.trim() || null,
      descriptionEn: form.descriptionEn.trim() || null,
      level: parseInt(form.level || "1"),
      boostType: form.boostType,
      agentId: form.agentId ? Number(form.agentId) : null,
      buyPrice: form.buyPrice.trim() ? Number(form.buyPrice) : null,
      sellPrice: form.sellPrice.trim() ? Number(form.sellPrice) : null,
    };
    try {
      if (isEditing && selected) {
        await artifact.updateArtifact(selected.id, payload);
        if (mediaFile) {
          await artifact.uploadMedia(selected.id, mediaFile);
        }
      } else {
        const created = await artifact.createArtifact(payload);
        if (mediaFile && created?.id) {
          await artifact.uploadMedia(created.id, mediaFile);
        }
      }
      setMediaFile(null);
      onClose();
      void loadMarketStats();
    } catch (e: unknown) {
      alert((e as { message?: string })?.message || "Failed to save artifact");
    }
  };

  const onDelete = async (a: Artifact) => {
    if (!window.confirm(`Delete artifact ${a.code}?`)) return;
    await artifact.deleteArtifact(a.id);
  };

  const onUploadCardMedia = async (artifactId: number, file: File) => {
    await artifact.uploadMedia(artifactId, file);
    await artifact.fetchAllArtifacts();
  };

  const onDeleteCardMedia = async (artifactId: number) => {
    await artifact.deleteMedia(artifactId);
    await artifact.fetchAllArtifacts();
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Artifacts"
        description="Create artifacts and manage their descriptions & media."
        actionButton={{
          label: "Create Artifact",
          icon: Plus,
          onClick: openCreate,
          color: "primary",
        }}
      />

      {artifact.error ? (
        <div className="text-sm text-red-500">{artifact.error}</div>
      ) : null}

      <div className="border border-zinc-700/70 bg-zinc-900/60 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-700 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">Статистика маркета артефактов</h3>
          </div>
          <Button size="sm" variant="flat" onPress={() => void loadMarketStats()} isLoading={marketStatsLoading}>
            Обновить
          </Button>
        </div>

        {marketStats ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl border border-zinc-700/70 bg-zinc-900/80 p-3">
                <p className="text-xs text-zinc-400">Покупок</p>
                <p className="text-2xl font-bold text-white">{marketStats.totals.buyCount}</p>
              </div>
              <div className="rounded-xl border border-zinc-700/70 bg-zinc-900/80 p-3">
                <p className="text-xs text-zinc-400">Продаж</p>
                <p className="text-2xl font-bold text-white">{marketStats.totals.sellCount}</p>
              </div>
              <div className="rounded-xl border border-zinc-700/70 bg-zinc-900/80 p-3">
                <p className="text-xs text-zinc-400">Потрачено gems (покупки)</p>
                <p className="text-2xl font-bold text-amber-300">{marketStats.totals.buyTotalPrice}</p>
              </div>
              <div className="rounded-xl border border-zinc-700/70 bg-zinc-900/80 p-3">
                <p className="text-xs text-zinc-400">Получено gems (продажи)</p>
                <p className="text-2xl font-bold text-emerald-300">{marketStats.totals.sellTotalPrice}</p>
              </div>
            </div>

            {marketStats.stats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-400 border-b border-zinc-700">
                      <th className="py-2 pr-4">Артефакт</th>
                      <th className="py-2 pr-4">История</th>
                      <th className="py-2 pr-4">Покупок</th>
                      <th className="py-2 pr-4">Продаж</th>
                      <th className="py-2 pr-4">Gems (покупки)</th>
                      <th className="py-2 pr-4">Gems (продажи)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketStats.stats.map((row) => (
                      <tr key={row.artifactId} className="border-b border-zinc-800/80 text-zinc-200">
                        <td className="py-2 pr-4">
                          {row.artifact?.name || `#${row.artifactId}`}
                          <span className="text-zinc-500 ml-1">({row.artifact?.code})</span>
                        </td>
                        <td className="py-2 pr-4">{row.artifact?.agent?.displayName || row.artifact?.agent?.historyName || "—"}</td>
                        <td className="py-2 pr-4">{row.buyCount}</td>
                        <td className="py-2 pr-4">{row.sellCount}</td>
                        <td className="py-2 pr-4">{row.buyTotalPrice}</td>
                        <td className="py-2 pr-4">{row.sellTotalPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Операций пока нет.</p>
            )}
          </>
        ) : marketStatsLoading ? (
          <p className="text-sm text-zinc-500">Загрузка статистики…</p>
        ) : null}
      </div>

      <div className="space-y-6">
        {groupedByStory.map((group) => (
          <div key={group.title} className="border border-zinc-700/70 bg-zinc-900/60 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-700 pb-3">
              <h3 className="text-2xl font-bold text-white">{group.title}</h3>
              <span className="text-xs text-zinc-400">Артефактов: {group.artifacts.length}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {group.artifacts.map((a) => (
                <div key={a.id} className="border border-zinc-700/70 bg-zinc-900/70 rounded-xl p-3 space-y-3">
            <MediaUploadField
              label="Медиа артефакта"
              accept="image/*,.json"
              mediaType="mixed"
              currentMedia={a.media || null}
              onUpload={async (file) => {
                await onUploadCardMedia(a.id, file);
              }}
              onDelete={
                a.media
                  ? async () => {
                      await onDeleteCardMedia(a.id);
                    }
                  : undefined
              }
              previewClassName="h-40"
            />

            <div className="flex items-start justify-between gap-2">
              <div className="w-full">
                <div className="w-full flex items-center justify-between gap-2">
                  <p className="font-semibold text-white truncate text-xl">{a.name}</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {a.boostType} · Уровень {a.level}
                  </p>
                  
                </div>
                <span className="text-xs text-zinc-400">({a.code})</span>
              </div>
            </div>

            {a.description ? <p className="text-xs text-zinc-400 line-clamp-2">{a.description}</p> : null}

            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <span className="inline-flex items-center gap-1">
                <ShoppingCart className="w-3 h-3 text-amber-400" />
                Buy: {a.buyPrice != null ? a.buyPrice : "—"}
              </span>
              <span className="inline-flex items-center gap-1">
                Sell: {a.sellPrice != null ? a.sellPrice : "—"}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" color="primary" variant="flat" startContent={<Edit className="w-3 h-3" />} onPress={() => openEdit(a)}>
                Изменить
              </Button>
              <Button size="sm" color="danger" variant="flat" startContent={<Trash2 className="w-3 h-3" />} onPress={() => onDelete(a)}>
                Удалить
              </Button>
            </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalContent>
          <ModalHeader>{isEditing ? "Edit Artifact" : "Create Artifact"}</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} isRequired />
              <Input label="Level" type="number" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
              <Input
                label="Buy price (gems)"
                type="number"
                min={0}
                value={form.buyPrice}
                onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
                description="Пусто = нельзя купить"
              />
              <Input
                label="Sell price (gems)"
                type="number"
                min={0}
                value={form.sellPrice}
                onChange={(e) => setForm({ ...form, sellPrice: e.target.value })}
                description="Пусто = нельзя продать. Продажа только дубликатов (2+ шт.)."
              />
              <div className="md:col-span-2">
                <Select
                  label="Story (Agent)"
                  placeholder="Select story for this artifact"
                  selectedKeys={form.agentId ? new Set([String(form.agentId)]) : new Set(["__all__"])}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0] as string | undefined;
                    setForm({ ...form, agentId: v && v !== "__all__" ? v : "" });
                  }}
                >
                  <>
                    <SelectItem key="__all__" textValue="All stories">
                      All stories (no filter)
                    </SelectItem>
                    {agent.agents.map((ag) => (
                      <SelectItem key={String(ag.id)} textValue={`${ag.displayName || ag.historyName} (${ag.historyName})`}>
                        {ag.displayName || ag.historyName} ({ag.historyName})
                      </SelectItem>
                    ))}
                  </>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Artifact will appear only in prompts for the selected story.</p>
              </div>
              <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} isRequired />
              <Input label="Name (EN)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Boost Type</label>
                <select
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                  value={form.boostType}
                  onChange={(e) => setForm({ ...form, boostType: e.target.value as ArtifactBoostType })}
                >
                  {BOOST_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} minRows={2} />
              <Textarea label="Description (EN)" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} minRows={2} />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Media (image or JSON animation)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg p-4">
                  <input
                    ref={mediaInputRef}
                    type="file"
                    accept="image/*,.json"
                    onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="artifact-media-upload"
                  />
                  <label htmlFor="artifact-media-upload" className="flex flex-col items-center justify-center cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {mediaFile ? mediaFile.name : "Click to upload image or JSON (Lottie)"}
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, or Lottie .json</p>
                  </label>
                </div>
                {previewAnimation && (
                  <div className="mt-4 p-4 border border-gray-200 dark:border-zinc-700 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                    <div className="flex justify-center">
                      <Lottie animationData={previewAnimation} loop={false} autoplay style={{ width: 120, height: 120 }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={onSave} isLoading={artifact.loading} disabled={!form.code.trim() || !form.name.trim()}>
              {isEditing ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

export default ArtifactsPage;

