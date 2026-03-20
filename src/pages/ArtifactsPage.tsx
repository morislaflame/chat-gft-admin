import { useEffect, useMemo, useRef, useState, useContext } from "react";
import { observer } from "mobx-react-lite";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea, useDisclosure } from "@heroui/react";
import { Plus, Wand2, Trash2, Edit, Upload } from "lucide-react";
import Lottie from "lottie-react";
import { Context, type IStoreContext } from "@/store/StoreProvider";
import { PageHeader } from "@/components/ui";
import { MediaUploadField } from "@/components/AgentsPageComponents/MediaUploadField";
import type { Artifact, ArtifactBoostType } from "@/http/artifactAPI";

const BOOST_TYPES: ArtifactBoostType[] = ["COMPANION", "KEY", "WEAPON", "ARMOR", "TRINKET"];

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
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewAnimation, setPreviewAnimation] = useState<Record<string, unknown> | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    artifact.fetchAllArtifacts();
  }, [artifact]);

  useEffect(() => {
    agent.fetchAllAgents();
  }, [agent]);

  const sorted = useMemo(() => {
    return [...artifact.artifacts].sort((a, b) => b.id - a.id);
  }, [artifact.artifacts]);

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
    } catch (e: unknown) {
      alert((e as { message?: string })?.message || "Failed to save artifact");
    }
  };

  const onDelete = async (a: Artifact) => {
    if (!window.confirm(`Delete artifact ${a.code}?`)) return;
    await artifact.deleteArtifact(a.id);
  };

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sorted.map((a) => (
          <div key={a.id} className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-gray-500" />
                  <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {a.name} <span className="text-xs text-gray-500">({a.code})</span>
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Type: {a.boostType} · Level: {a.level}
                  {a.agent ? ` · Story: ${a.agent.displayName || a.agent.historyName}` : ""}
                </p>
                {a.description ? <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{a.description}</p> : null}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="light" startContent={<Edit className="w-3 h-3" />} onPress={() => openEdit(a)}>
                  Edit
                </Button>
                <Button size="sm" color="danger" variant="light" startContent={<Trash2 className="w-3 h-3" />} onPress={() => onDelete(a)}>
                  Delete
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-zinc-700 pt-3">
              <MediaUploadField
                label="Artifact Media"
                accept="image/*"
                mediaType="image"
                currentMedia={a.media || null}
                onUpload={async (file) => {
                  await artifact.uploadMedia(a.id, file);
                }}
                onDelete={
                  a.media
                    ? async () => {
                        await artifact.deleteMedia(a.id);
                      }
                    : undefined
                }
              />
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

