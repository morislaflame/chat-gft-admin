import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import Lottie from 'lottie-react';
import {
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from '@heroui/react';
import { Gift, Plus, Trash2, Upload, X } from 'lucide-react';
import {
  createLeaderboardPrize,
  deleteLeaderboardPrize,
  getLeaderboardPrizes,
  setLeaderboardTierCases,
  setLeaderboardTierPrizes,
  uploadLeaderboardPrizePreview,
  type LeaderboardPrize,
  type LeaderboardPrizeTier,
  type LeaderboardTierCase,
} from '@/http/adminAPI';
import { getAllCasesAdmin, type Case } from '@/http/caseAPI';

const TIER_LABELS: Record<string, string> = {
  '1': '1 место',
  '2': '2 место',
  '3': '3 место',
  '4': '4 место',
  '5': '5 место',
  '6': '6 место',
  '7': '7 место',
  '8': '8 место',
  '9': '9 место',
  '10': '10 место',
  '11-20': '11–20 места',
  '21-30': '21–30 места',
  '31-40': '31–40 места',
  '41-50': '41–50 места',
};

const GROUPS: Array<{ title: string; hint: string; ids: string[] }> = [
  {
    title: '1–3 место',
    hint: 'У каждого места свой приз. Его получает игрок на этом месте.',
    ids: ['1', '2', '3'],
  },
  {
    title: '4–10 место',
    hint: 'Тоже по одному призу на место.',
    ids: ['4', '5', '6', '7', '8', '9', '10'],
  },
  {
    title: '11–50 места',
    hint: 'Диапазон может содержать несколько призов. Их получают все игроки этих мест, в том порядке, в каком вы их добавили.',
    ids: ['11-20', '21-30', '31-40', '41-50'],
  },
];

function prizeCountLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} приз`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} приза`;
  return `${count} призов`;
}

function errorMessage(err: unknown, fallback: string) {
  const errorObj = err as { response?: { data?: { message?: string } } };
  return errorObj.response?.data?.message || fallback;
}

function PrizeThumb({ prize, className }: { prize?: LeaderboardPrize | null; className?: string }) {
  if (prize?.preview?.url) {
    return <img src={prize.preview.url} alt="" className={className || 'h-14 w-14 object-contain'} />;
  }
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-zinc-900 text-[10px] text-zinc-500 ${className || 'h-14 w-14'}`}
    >
      нет
    </div>
  );
}

function UploadSlot({
  id,
  label,
  hint,
  accept,
  file,
  onFile,
  children,
}: {
  id: string;
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  onFile: (file: File | null) => void;
  children?: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium">{label}</div>
      <label
        htmlFor={id}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-600 px-3 py-4 text-center hover:border-zinc-400"
      >
        <Upload className="mb-2 h-5 w-5 text-zinc-400" />
        <span className="text-sm text-zinc-200">{file ? file.name : 'Выбрать файл'}</span>
        <span className="mt-1 text-xs text-zinc-500">{hint}</span>
        <input
          id={id}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => onFile(event.target.files?.[0] ?? null)}
        />
      </label>
      {children}
    </div>
  );
}

function CaseThumb({ media }: { media?: { url: string; mimeType: string } | null }) {
  const [animation, setAnimation] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!media?.url || media.mimeType !== 'application/json') {
      setAnimation(null);
      return;
    }
    let cancelled = false;
    fetch(media.url)
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setAnimation(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [media?.url, media?.mimeType]);

  if (media?.mimeType === 'application/json' && animation) {
    return <Lottie animationData={animation} loop style={{ width: 32, height: 32 }} />;
  }
  if (media?.url && media.mimeType.startsWith('image/')) {
    return <img src={media.url} alt="" className="h-8 w-8 shrink-0 object-contain" />;
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-zinc-900 text-[10px] text-zinc-500">
      нет
    </div>
  );
}

function caseMedia(
  row: LeaderboardTierCase,
  catalog: Case[],
): { url: string; mimeType: string } | null {
  if (row.mediaFile?.url) return row.mediaFile;
  const fromCatalog = catalog.find((item) => item.id === row.caseId)?.mediaFile;
  if (fromCatalog?.url && fromCatalog.mimeType) {
    return { url: fromCatalog.url, mimeType: fromCatalog.mimeType };
  }
  if (row.imageUrl) return { url: row.imageUrl, mimeType: 'image/png' };
  return null;
}

function CaseRewardEditor({
  tier,
  catalog,
  busy,
  onSave,
}: {
  tier: LeaderboardPrizeTier;
  catalog: Case[];
  busy: boolean;
  onSave: (next: Array<{ caseId: number; quantity: number }>) => void;
}) {
  const assigned = tier.cases || [];
  const [qtyDraft, setQtyDraft] = useState<Record<number, string>>({});
  const remaining = catalog.filter((item) => !assigned.some((row) => row.caseId === item.id));

  const commitQuantity = (row: LeaderboardTierCase) => {
    const raw = qtyDraft[row.caseId];
    if (raw == null) return;
    const quantity = parseInt(raw, 10);
    setQtyDraft((prev) => {
      const next = { ...prev };
      delete next[row.caseId];
      return next;
    });
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99 || quantity === row.quantity) return;
    onSave(assigned.map((item) => (item.caseId === row.caseId ? { caseId: item.caseId, quantity } : { caseId: item.caseId, quantity: item.quantity })));
  };

  return (
    <div className="mt-3 space-y-2 border-t border-zinc-800 pt-3">
      <div className="text-xs text-zinc-400">Кейсы в инвентарь</div>
      {assigned.length === 0 ? (
        <p className="text-xs text-zinc-500">Кейс не выбран</p>
      ) : (
        <div className="space-y-2">
          {assigned.map((row) => (
            <div key={row.caseId} className="flex items-center gap-2">
              <CaseThumb media={caseMedia(row, catalog)} />
              <span className="min-w-0 flex-1 truncate text-xs">{row.name}</span>
              <Input
                size="sm"
                type="number"
                min={1}
                max={99}
                label="Шт."
                className="w-20"
                value={qtyDraft[row.caseId] ?? String(row.quantity)}
                isDisabled={busy}
                onChange={(event) =>
                  setQtyDraft((prev) => ({ ...prev, [row.caseId]: event.target.value }))
                }
                onBlur={() => commitQuantity(row)}
              />
              <Button
                isIconOnly
                size="sm"
                variant="light"
                aria-label={`Убрать кейс ${row.name}`}
                isDisabled={busy}
                onPress={() =>
                  onSave(
                    assigned
                      .filter((item) => item.caseId !== row.caseId)
                      .map((item) => ({ caseId: item.caseId, quantity: item.quantity }))
                  )
                }
              >
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
      {remaining.length === 0 ? (
        <p className="text-xs text-zinc-500">
          {catalog.length === 0 ? 'Кейсов в магазине нет' : 'Все кейсы уже добавлены'}
        </p>
      ) : (
        <Select
          size="sm"
          label="Добавить кейс"
          placeholder="Выберите кейс"
          selectedKeys={new Set<string>()}
          isDisabled={busy}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0] as string | undefined;
            const caseId = Number(selectedKey);
            if (!Number.isInteger(caseId) || caseId < 1) return;
            onSave([
              ...assigned.map((item) => ({ caseId: item.caseId, quantity: item.quantity })),
              { caseId, quantity: 1 },
            ]);
          }}
        >
          {remaining.map((item) => (
            <SelectItem key={String(item.id)} textValue={item.name}>
              {item.isActive ? item.name : `${item.name} (скрыт)`}
            </SelectItem>
          ))}
        </Select>
      )}
    </div>
  );
}

const LeaderboardPrizesSection = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [prizes, setPrizes] = useState<LeaderboardPrize[]>([]);
  const [tiers, setTiers] = useState<LeaderboardPrizeTier[]>([]);
  const [caseCatalog, setCaseCatalog] = useState<Case[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [savingTierId, setSavingTierId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [name, setName] = useState('');
  const [animationFile, setAnimationFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [animationData, setAnimationData] = useState<Record<string, unknown> | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const applyCatalog = (catalog: { prizes: LeaderboardPrize[]; tiers: LeaderboardPrizeTier[] }) => {
    setPrizes(catalog.prizes);
    setTiers(catalog.tiers);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catalog, cases] = await Promise.all([
        getLeaderboardPrizes(),
        getAllCasesAdmin(),
      ]);
      applyCatalog(catalog);
      setCaseCatalog(Array.isArray(cases) ? cases : []);
    } catch (err: unknown) {
      setError(errorMessage(err, 'Не удалось загрузить призы'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!animationFile) {
      setAnimationData(null);
      return;
    }
    let cancelled = false;
    animationFile
      .text()
      .then((raw) => {
        if (cancelled) return;
        try {
          setAnimationData(JSON.parse(raw) as Record<string, unknown>);
        } catch {
          setAnimationData(null);
        }
      })
      .catch(() => {
        if (!cancelled) setAnimationData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [animationFile]);

  useEffect(() => {
    if (!previewFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(previewFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [previewFile]);

  const prizeById = useMemo(() => new Map(prizes.map((prize) => [prize.id, prize])), [prizes]);
  const tierById = useMemo(() => new Map(tiers.map((tier) => [tier.id, tier])), [tiers]);

  const placesOf = (prizeId: number) =>
    tiers
      .filter((tier) => tier.prizeIds.includes(prizeId))
      .map((tier) => TIER_LABELS[tier.id] || tier.id);

  const filledCount = tiers.filter((tier) => tier.prizeIds.length > 0 || (tier.cases || []).length > 0).length;

  const resetForm = () => {
    setName('');
    setAnimationFile(null);
    setPreviewFile(null);
    setAnimationData(null);
    setFormKey((key) => key + 1);
  };

  const closeModal = () => {
    if (creating) return;
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed || !animationFile || !previewFile) return;
    setCreating(true);
    setError(null);
    setNotice(null);
    try {
      const created = await createLeaderboardPrize(trimmed, animationFile);
      await uploadLeaderboardPrizePreview(created.id, previewFile);
      applyCatalog(await getLeaderboardPrizes());
      resetForm();
      onClose();
      setNotice(`«${trimmed}» добавлен. Теперь назначьте его на место ниже — выбор сохранится сразу.`);
    } catch (err: unknown) {
      setError(errorMessage(err, 'Не удалось загрузить приз'));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (prize: LeaderboardPrize) => {
    const places = placesOf(prize.id);
    const where = places.length ? ` Он сейчас стоит на: ${places.join(', ')}.` : '';
    if (!window.confirm(`Удалить приз «${prize.name}»?${where}`)) return;
    setError(null);
    setNotice(null);
    try {
      await deleteLeaderboardPrize(prize.id);
      applyCatalog(await getLeaderboardPrizes());
    } catch (err: unknown) {
      setError(errorMessage(err, 'Не удалось удалить приз'));
    }
  };

  const saveTier = async (tier: LeaderboardPrizeTier, prizeIds: number[]) => {
    setSavingTierId(tier.id);
    setError(null);
    setNotice(null);
    try {
      applyCatalog(
        await setLeaderboardTierPrizes({
          rankFrom: tier.from,
          rankTo: tier.to,
          prizeIds,
        })
      );
    } catch (err: unknown) {
      setError(errorMessage(err, 'Не удалось сохранить место'));
    } finally {
      setSavingTierId(null);
    }
  };

  const saveCases = async (tier: LeaderboardPrizeTier, cases: Array<{ caseId: number; quantity: number }>) => {
    setSavingTierId(tier.id);
    setError(null);
    setNotice(null);
    try {
      applyCatalog(
        await setLeaderboardTierCases({
          rankFrom: tier.from,
          rankTo: tier.to,
          cases,
        })
      );
    } catch (err: unknown) {
      setError(errorMessage(err, 'Не удалось сохранить кейсы'));
    } finally {
      setSavingTierId(null);
    }
  };

  const canCreate = Boolean(name.trim() && animationFile && previewFile);

  return (
    <Card>
      <CardBody className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Призы сезона</h3>
            <p className="mt-1 max-w-2xl text-sm text-zinc-400">
              Сначала загрузите приз: JSON-анимация и картинка, которую увидят игроки. На место можно также назначить кейсы и их количество.
              Назначение сохраняется сразу. Кейсы попадут в инвентарь, когда сезон завершится.
            </p>
          </div>
          <Button color="primary" startContent={<Plus size={16} />} onPress={onOpen}>
            Добавить приз
          </Button>
        </div>

        {error ? <div className="text-sm text-red-500">{error}</div> : null}
        {notice ? <div className="text-sm text-emerald-500">{notice}</div> : null}

        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h4 className="font-medium">1. Библиотека</h4>
            <span className="text-xs text-zinc-500">{prizeCountLabel(prizes.length)}</span>
          </div>
          {loading ? (
            <p className="text-sm text-zinc-500">Загрузка…</p>
          ) : prizes.length === 0 ? (
            <button
              type="button"
              onClick={onOpen}
              className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 px-4 py-8 text-center"
            >
              <Gift className="mb-2 h-6 w-6 text-amber-400" />
              <span className="text-sm font-medium">Призов ещё нет</span>
              <span className="mt-1 text-xs text-zinc-500">Загрузите первый приз, чтобы назначить его на места</span>
            </button>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {prizes.map((prize) => {
                const places = placesOf(prize.id);
                return (
                  <div key={prize.id} className="flex gap-3 rounded-xl border border-zinc-800 p-3">
                    <PrizeThumb prize={prize} className="h-16 w-16 shrink-0 object-contain" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{prize.name}</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {places.length ? places.join(' · ') : 'Ещё не назначен'}
                      </div>
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      aria-label={`Удалить ${prize.name}`}
                      onPress={() => handleDelete(prize)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h4 className="font-medium">2. Места</h4>
            <span className="text-xs text-zinc-500">
              Заполнено {filledCount} из {tiers.length || 14}
            </span>
          </div>

          {GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <div>
                <div className="text-sm font-medium">{group.title}</div>
                <p className="text-xs text-zinc-500">{group.hint}</p>
              </div>
              <div className={group.ids.length > 4 ? 'grid grid-cols-1 gap-2 md:grid-cols-2' : 'space-y-2'}>
                {group.ids.map((id) => {
                  const tier = tierById.get(id);
                  if (!tier) return null;
                  const selected = tier.prizeIds
                    .map((prizeId) => prizeById.get(prizeId))
                    .filter((prize): prize is LeaderboardPrize => Boolean(prize));
                  const busy = savingTierId === tier.id;
                  const isPool = tier.kind === 'pool';

                  return (
                    <div key={id} className="rounded-xl border border-zinc-800 p-3">
                      <div className="mb-2 text-sm font-medium">{TIER_LABELS[id] || id}</div>
                      {isPool ? (
                        <div className="space-y-2">
                          {selected.length === 0 ? (
                            <p className="text-xs text-zinc-500">Призы не выбраны</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {selected.map((prize) => (
                                <div
                                  key={prize.id}
                                  className="flex items-center gap-2 rounded-lg border border-zinc-700 py-1 pl-1 pr-1"
                                >
                                  <PrizeThumb prize={prize} className="h-8 w-8 object-contain" />
                                  <span className="max-w-[8rem] truncate text-xs">{prize.name}</span>
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    aria-label={`Убрать ${prize.name}`}
                                    isDisabled={busy}
                                    onPress={() =>
                                      saveTier(
                                        tier,
                                        tier.prizeIds.filter((prizeId) => prizeId !== prize.id)
                                      )
                                    }
                                  >
                                    <X size={14} />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          {prizes.filter((prize) => !tier.prizeIds.includes(prize.id)).length === 0 ? (
                            <p className="text-xs text-zinc-500">Все призы из библиотеки уже в этом диапазоне</p>
                          ) : (
                          <Select
                            size="sm"
                            label="Добавить приз"
                            placeholder="Выберите приз"
                            selectedKeys={new Set<string>()}
                            isDisabled={busy}
                            onSelectionChange={(keys) => {
                              const selectedKey = Array.from(keys)[0] as string | undefined;
                              const prizeId = Number(selectedKey);
                              if (!Number.isInteger(prizeId) || prizeId < 1 || tier.prizeIds.includes(prizeId)) return;
                              void saveTier(tier, [...tier.prizeIds, prizeId]);
                            }}
                          >
                            {prizes
                              .filter((prize) => !tier.prizeIds.includes(prize.id))
                              .map((prize) => (
                                <SelectItem key={String(prize.id)} textValue={prize.name}>
                                  {prize.name}
                                </SelectItem>
                              ))}
                          </Select>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <PrizeThumb
                            prize={selected[0]}
                            className="h-12 w-12 shrink-0 object-contain"
                          />
                          <Select
                            size="sm"
                            label="Приз"
                            placeholder="Не назначен"
                            selectedKeys={new Set([selected[0] ? String(selected[0].id) : '__none__'])}
                            isDisabled={busy || (prizes.length === 0 && !selected[0])}
                            onSelectionChange={(keys) => {
                              const selectedKey = Array.from(keys)[0] as string | undefined;
                              if (!selectedKey) return;
                              if (selectedKey === '__none__') {
                                void saveTier(tier, []);
                                return;
                              }
                              const prizeId = Number(selectedKey);
                              if (!Number.isInteger(prizeId) || prizeId < 1) return;
                              void saveTier(tier, [prizeId]);
                            }}
                          >
                            {[
                              <SelectItem key="__none__" textValue="Не назначен">
                                Не назначен
                              </SelectItem>,
                              ...prizes.map((prize) => (
                                <SelectItem key={String(prize.id)} textValue={prize.name}>
                                  {prize.name}
                                </SelectItem>
                              )),
                            ]}
                          </Select>
                        </div>
                      )}
                      <CaseRewardEditor
                        tier={tier}
                        catalog={caseCatalog}
                        busy={busy}
                        onSave={(next) => saveCases(tier, next)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </CardBody>

      <Modal isOpen={isOpen} onClose={closeModal} size="2xl">
        <ModalContent>
          <ModalHeader>Новый приз</ModalHeader>
          <ModalBody className="space-y-4">
            <p className="text-sm text-zinc-400">
              Картинка показывается в списке наград. JSON остаётся анимацией и в общий список не попадает.
            </p>
            <Input
              label="Название"
              placeholder="Как приз называется для игрока"
              value={name}
              onChange={(event) => setName(event.target.value)}
              isRequired
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UploadSlot
                key={`json-${formKey}`}
                id="leaderboard-prize-json"
                label="Анимация"
                hint="JSON, Lottie"
                accept="application/json,.json"
                file={animationFile}
                onFile={setAnimationFile}
              >
                {animationData ? (
                  <div className="mt-3 flex justify-center rounded-lg border border-zinc-800 p-2">
                    <Lottie animationData={animationData} loop={false} style={{ width: 96, height: 96 }} />
                  </div>
                ) : null}
              </UploadSlot>
              <UploadSlot
                key={`preview-${formKey}`}
                id="leaderboard-prize-preview"
                label="Превью"
                hint="PNG, JPG, WEBP или GIF"
                accept="image/jpeg,image/png,image/gif,image/webp"
                file={previewFile}
                onFile={setPreviewFile}
              >
                {previewUrl ? (
                  <div className="mt-3 flex justify-center rounded-lg border border-zinc-800 p-2">
                    <img src={previewUrl} alt="" className="h-24 w-24 object-contain" />
                  </div>
                ) : null}
              </UploadSlot>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={closeModal} isDisabled={creating}>
              Отмена
            </Button>
            <Button color="primary" onPress={handleCreate} isLoading={creating} isDisabled={!canCreate}>
              Добавить приз
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default LeaderboardPrizesSection;
