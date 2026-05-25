import { useEffect, useState } from "react";
import { Button, Input, Switch, Textarea } from "@heroui/react";
import { Save, Trash2 } from "lucide-react";
import { MediaUploadField } from "@/components/AgentsPageComponents/MediaUploadField";
import {
  deleteAgentCompanion,
  deleteAgentCompanionMedia,
  getAgentCompanion,
  uploadAgentCompanionMedia,
  upsertAgentCompanion,
  type CompanionPayload,
} from "@/http/companionAPI";

type AgentCompanionSectionProps = {
  agentId: number;
  historyName: string;
};

export function AgentCompanionSection({ agentId, historyName }: AgentCompanionSectionProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companion, setCompanion] = useState<CompanionPayload | null>(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    nameEn: "",
    description: "",
    descriptionEn: "",
    isActive: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAgentCompanion(agentId);
      setCompanion(data);
      if (data) {
        setForm({
          code: data.code,
          name: data.name,
          nameEn: data.nameEn || "",
          description: data.description || "",
          descriptionEn: data.descriptionEn || "",
          isActive: data.isActive !== false,
        });
      } else {
        setForm({
          code: `${historyName}_companion`,
          name: "",
          nameEn: "",
          description: "",
          descriptionEn: "",
          isActive: true,
        });
      }
    } catch (e) {
      console.error("Failed to load companion:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [agentId]);

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) return;
    setSaving(true);
    try {
      const saved = await upsertAgentCompanion(agentId, {
        code: form.code.trim(),
        name: form.name.trim(),
        nameEn: form.nameEn.trim() || null,
        description: form.description.trim() || null,
        descriptionEn: form.descriptionEn.trim() || null,
        isActive: form.isActive,
      });
      setCompanion(saved);
    } catch (e) {
      console.error("Failed to save companion:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!companion) return;
    if (!window.confirm("Удалить компаньона для этой истории?")) return;
    setSaving(true);
    try {
      await deleteAgentCompanion(agentId);
      setCompanion(null);
      setForm({
        code: `${historyName}_companion`,
        name: "",
        nameEn: "",
        description: "",
        descriptionEn: "",
        isActive: true,
      });
    } catch (e) {
      console.error("Failed to delete companion:", e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <p className="text-sm text-zinc-400">Загрузка компаньона…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-extrabold uppercase tracking-[0.12em] text-white">Компаньон истории</p>
          <p className="text-xs text-zinc-400 mt-1">
            Выдаётся после первой миссии. Не артефакт, не продаётся на маркете.
          </p>
        </div>
        <div className="flex gap-2">
          {companion ? (
            <Button color="danger" variant="flat" startContent={<Trash2 className="w-4 h-4" />} onPress={() => void handleDelete()} isLoading={saving}>
              Удалить
            </Button>
          ) : null}
          <Button color="primary" startContent={<Save className="w-4 h-4" />} onPress={() => void handleSave()} isLoading={saving}>
            Сохранить
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Код" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <div className="rounded-xl border border-slate-200 dark:border-zinc-700 p-4 flex items-center">
          <Switch isSelected={form.isActive} onValueChange={(value) => setForm({ ...form, isActive: value })}>
            Активен
          </Switch>
        </div>
        <Input label="Имя (RU)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Имя (EN)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
      </div>

      <Textarea label="Описание (RU)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} minRows={2} />
      <Textarea label="Описание (EN)" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} minRows={2} />

      {companion ? (
        <MediaUploadField
          label="Изображение компаньона"
          accept="image/*"
          mediaType="image"
          currentMedia={
            companion.media
              ? {
                  id: companion.media.id,
                  url: companion.media.url,
                  mimeType: companion.media.mimeType,
                  fileName: "",
                  originalName: "",
                  size: 0,
                  bucket: "",
                  entityType: "companion",
                  entityId: companion.id,
                  createdAt: new Date().toISOString(),
                }
              : null
          }
          onUpload={async (file) => {
            const updated = await uploadAgentCompanionMedia(agentId, file);
            setCompanion(updated);
          }}
          onDelete={async () => {
            const updated = await deleteAgentCompanionMedia(agentId);
            setCompanion(updated);
          }}
        />
      ) : (
        <p className="text-xs text-amber-500">Сначала сохраните компаньона, затем можно загрузить изображение.</p>
      )}
    </div>
  );
}
