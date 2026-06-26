import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from "@heroui/react";
import {
  Plus,
  Trash2,
  Edit,
  Play,
  Pause,
  RefreshCw,
  Users,
  CheckCircle2,
  BarChart3,
  AlertCircle,
  Eye,
} from "lucide-react";
import { PageHeader } from "@/components/ui";
import {
  getPushScenarios,
  createPushScenario,
  updatePushScenario,
  deletePushScenario,
  getPushDryRun,
  getPushStats,
  type PushScenario,
  type PushStats,
} from "@/http/adminAPI";

const TRIGGERS = [
  { key: "inactive_24h", label: "Не заходил 24ч (inactive_24h)" },
  { key: "inactive_3d", label: "Не заходил 3 дня (inactive_3d)" },
  { key: "inactive_7d", label: "Не заходил 7 дней (inactive_7d)" },
  { key: "energy_refilled", label: "Энергия полная (energy_refilled)" },
  { key: "referral_joined", label: "Реферал присоединился (referral_joined)" },
  { key: "daily_ready", label: "Доступна дейли награда (daily_ready)" },
  { key: "unfinished_mission", label: "Не закончил миссию (unfinished_mission)" },
  { key: "unopened_case", label: "Не открыл кейс (unopened_case)" },
];

const SEGMENTS = [
  { key: "ALL", label: "Все игроки (ALL)" },
  { key: "NEW", label: "Новые < 48ч (NEW)" },
  { key: "ACTIVE", label: "Активные < 48ч (ACTIVE)" },
  { key: "COOLING", label: "Остывающие 2-7 дней (COOLING)" },
  { key: "DORMANT", label: "Спящие 7+ дней (DORMANT)" },
  { key: "PAYER", label: "Платящие (PAYER)" },
  { key: "NEAR_PAYER", label: "Почти платящие (NEAR_PAYER)" },
  { key: "HAS_VALUE", label: "С балансом (HAS_VALUE)" },
  { key: "HAS_UNFINISHED", label: "С незаконченной миссией (HAS_UNFINISHED)" },
  { key: "HAS_UNOPENED_CASE", label: "С неоткрытым кейсом (HAS_UNOPENED_CASE)" },
  { key: "DAILY_READY", label: "Доступна дейли награда (DAILY_READY)" },
  { key: "IS_REFERRER", label: "Пригласил кого-то (IS_REFERRER)" },
  { key: "WHALE", label: "Киты >= 500 звезд (WHALE)" },
];

const STATUS_COLORS = {
  draft: "bg-zinc-700 text-zinc-300",
  approved: "bg-blue-900/40 text-blue-300 border border-blue-800",
  active: "bg-emerald-950/40 text-emerald-400 border border-emerald-900",
};

const PushPage = observer(() => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [scenarios, setScenarios] = useState<PushScenario[]>([]);
  const [stats, setStats] = useState<PushStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [dryRunLoading, setDryRunLoading] = useState<Record<number, boolean>>({});
  const [dryRunCounts, setDryRunCounts] = useState<Record<number, number>>({});

  // Form state
  const [editingScenario, setEditingScenario] = useState<PushScenario | null>(null);
  const [formData, setFormData] = useState({
    triggerType: "inactive_24h",
    segmentType: "ALL",
    textRu: "",
    textEn: "",
    holdoutPercentage: 20,
    cooldownHours: 24,
    priority: 10,
    status: "draft" as "draft" | "approved" | "active",
  });
  const [modalDryRunCount, setModalDryRunCount] = useState<number | null>(null);
  const [modalDryRunLoading, setModalDryRunLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getPushScenarios();
      setScenarios(data);
      await loadStats();
    } catch (error) {
      console.error("Error loading push scenarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const data = await getPushStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading push stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Run dry-run for modal form
  useEffect(() => {
    if (isOpen) {
      const runModalDryRun = async () => {
        setModalDryRunLoading(true);
        try {
          const res = await getPushDryRun(formData.triggerType, formData.segmentType);
          setModalDryRunCount(res.count);
        } catch (error) {
          console.error("Error running modal dry-run:", error);
          setModalDryRunCount(null);
        } finally {
          setModalDryRunLoading(false);
        }
      };

      const timer = setTimeout(runModalDryRun, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.triggerType, formData.segmentType, isOpen]);

  const handleOpenCreate = () => {
    setEditingScenario(null);
    setFormData({
      triggerType: "inactive_24h",
      segmentType: "ALL",
      textRu: "",
      textEn: "",
      holdoutPercentage: 20,
      cooldownHours: 24,
      priority: 10,
      status: "draft",
    });
    setModalDryRunCount(null);
    onOpen();
  };

  const handleOpenEdit = (s: PushScenario) => {
    setEditingScenario(s);
    setFormData({
      triggerType: s.triggerType,
      segmentType: s.segmentType,
      textRu: s.textRu,
      textEn: s.textEn,
      holdoutPercentage: s.holdoutPercentage,
      cooldownHours: s.cooldownHours,
      priority: s.priority,
      status: s.status,
    });
    setModalDryRunCount(null);
    onOpen();
  };

  const handleSave = async () => {
    try {
      if (editingScenario) {
        await updatePushScenario(editingScenario.id, formData);
      } else {
        await createPushScenario(formData);
      }
      onClose();
      loadData();
    } catch (error) {
      console.error("Error saving scenario:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить этот сценарий?")) {
      try {
        await deletePushScenario(id);
        loadData();
      } catch (error) {
        console.error("Error deleting scenario:", error);
      }
    }
  };

  const handleToggleStatus = async (s: PushScenario) => {
    const nextStatus = s.status === "active" ? "draft" : "active";
    try {
      await updatePushScenario(s.id, { status: nextStatus });
      loadData();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleRunDryRun = async (s: PushScenario) => {
    setDryRunLoading((prev) => ({ ...prev, [s.id]: true }));
    try {
      const res = await getPushDryRun(s.triggerType, s.segmentType);
      setDryRunCounts((prev) => ({ ...prev, [s.id]: res.count }));
    } catch (error) {
      console.error("Error running dry-run:", error);
    } finally {
      setDryRunLoading((prev) => ({ ...prev, [s.id]: false }));
    }
  };

  // Calculate CTR and Return Rate
  const ctr = stats?.overall.sent ? ((stats.overall.clicks / stats.overall.sent) * 100).toFixed(1) : "0.0";
  const returnRate = stats?.overall.clicks ? ((stats.overall.returns / stats.overall.clicks) * 100).toFixed(1) : "0.0";

  const ERROR_TYPE_LABELS: Record<string, string> = {
    chat_not_found: "Нет чата с ботом",
    bot_blocked: "Бот заблокирован",
    rate_limited: "Rate limit Telegram",
    user_deactivated: "Аккаунт удалён",
    bot_kicked: "Бот выгнан из чата",
    rate_limiter_internal: "Внутренний rate limiter",
    unknown: "Неизвестно",
    other: "Прочие",
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" label="Загрузка системы пушей..." color="primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Умные пуш-уведомления"
        description="Сценарии, сегменты и статистика Telegram-пушей"
        secondaryActionButton={{
          label: statsLoading ? "Обновление..." : "Обновить",
          icon: RefreshCw,
          onClick: () => void loadData(),
          variant: "flat",
        }}
        actionButton={{
          label: "Создать сценарий",
          icon: Plus,
          onClick: handleOpenCreate,
        }}
      />

      {/* Stats Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-800 border border-zinc-700">
              <CardBody className="p-4 flex flex-row items-center gap-4">
                <div className="p-3 bg-emerald-950 text-emerald-400 rounded-xl">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Отправлено</p>
                  <p className="text-2xl font-bold text-emerald-400">{stats.overall.sent}</p>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-zinc-800 border border-zinc-700">
              <CardBody className="p-4 flex flex-row items-center gap-4">
                <div className="p-3 bg-zinc-900 text-zinc-400 rounded-xl">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Holdout (Контроль)</p>
                  <p className="text-2xl font-bold text-zinc-300">{stats.overall.holdout}</p>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-zinc-800 border border-zinc-700">
              <CardBody className="p-4 flex flex-row items-center gap-4">
                <div className="p-3 bg-blue-950 text-blue-400 rounded-xl">
                  <Eye size={24} />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Клики (CTR)</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {stats.overall.clicks} <span className="text-sm font-medium text-zinc-400">({ctr}%)</span>
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-zinc-800 border border-zinc-700">
              <CardBody className="p-4 flex flex-row items-center gap-4">
                <div className="p-3 bg-purple-950 text-purple-400 rounded-xl">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Возвраты в игру</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {stats.overall.returns} <span className="text-sm font-medium text-zinc-400">({returnRate}%)</span>
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Errors breakdown */}
          {stats.overall.failed > 0 && (
            <Card className="bg-zinc-800 border border-zinc-700">
              <CardHeader className="px-6 py-3 border-b border-zinc-700 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400" />
                <h3 className="text-sm font-semibold text-red-400">
                  Ошибки отправки: {stats.overall.failed}
                </h3>
              </CardHeader>
              <CardBody className="px-6 py-4">
                <div className="flex flex-wrap gap-3">
                  {stats.overall.failedBreakdown.map((item) => (
                    <div
                      key={item.error_type}
                      className="flex items-center gap-2 px-3 py-2 bg-zinc-900 rounded-lg border border-zinc-700"
                    >
                      <span className="text-sm text-zinc-300 font-medium">
                        {ERROR_TYPE_LABELS[item.error_type] ?? item.error_type}
                      </span>
                      <span className="text-sm font-bold text-red-400">{item.count}</span>
                      <span className="text-xs text-zinc-500">
                        ({((item.count / stats.overall.failed) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}

      {/* Scenarios Table */}
      <Card className="bg-zinc-800 border border-zinc-700">
        <CardHeader className="px-6 py-4 border-b border-zinc-700 flex justify-between items-center">
          <h2 className="text-lg font-bold">Активные и запланированные сценарии</h2>
        </CardHeader>
        <CardBody className="p-0">
          <Table aria-label="Push scenarios table" className="w-full" removeWrapper>
            <TableHeader>
              <TableColumn className="bg-zinc-800/50 text-zinc-300 font-semibold px-6 py-3">ПРИОРИТЕТ & ID</TableColumn>
              <TableColumn className="bg-zinc-800/50 text-zinc-300 font-semibold px-6 py-3">ТРИГГЕР & СЕГМЕНТ</TableColumn>
              <TableColumn className="bg-zinc-800/50 text-zinc-300 font-semibold px-6 py-3">ТЕКСТ (RU / EN)</TableColumn>
              <TableColumn className="bg-zinc-800/50 text-zinc-300 font-semibold px-6 py-3">ПАРАМЕТРЫ</TableColumn>
              <TableColumn className="bg-zinc-800/50 text-zinc-300 font-semibold px-6 py-3">СТАТУС</TableColumn>
              <TableColumn className="bg-zinc-800/50 text-zinc-300 font-semibold px-6 py-3">ОХВАТ (DRY-RUN)</TableColumn>
              <TableColumn className="bg-zinc-800/50 text-zinc-300 font-semibold px-6 py-3">СТАТИСТИКА (SENT/CLICK/RET)</TableColumn>
              <TableColumn className="bg-zinc-800/50 text-zinc-300 font-semibold px-6 py-3 text-right">ДЕЙСТВИЯ</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Нет созданных сценариев пушей.">
              {scenarios.map((s) => {
                const sStats = stats?.scenarios.find((x) => x.id === s.id);
                const sCtr = sStats?.sent ? ((sStats.clicks / sStats.sent) * 100).toFixed(1) : "0.0";
                const sRet = sStats?.clicks ? ((sStats.returns / sStats.clicks) * 100).toFixed(1) : "0.0";

                return (
                  <TableRow key={s.id} className="border-b border-zinc-700/50 hover:bg-zinc-800/30">
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-300">#{s.id}</span>
                        <span className="text-xs text-zinc-500">Приоритет: {s.priority}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-0.5 bg-zinc-900 text-zinc-300 rounded text-xs font-mono w-fit">
                          ⚡ {s.triggerType}
                        </span>
                        <span className="px-2 py-0.5 bg-zinc-900 text-zinc-400 rounded text-xs font-mono w-fit">
                          👥 {s.segmentType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 max-w-xs">
                      <div className="flex flex-col gap-1 text-sm">
                        <p className="text-zinc-300 line-clamp-1" title={s.textRu}>
                          <span className="text-zinc-500 font-semibold text-xs mr-1">RU:</span> {s.textRu}
                        </p>
                        <p className="text-zinc-400 line-clamp-1" title={s.textEn}>
                          <span className="text-zinc-500 font-semibold text-xs mr-1">EN:</span> {s.textEn}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs text-zinc-400">
                      <div className="flex flex-col">
                        <span>Контроль: {s.holdoutPercentage}%</span>
                        <span>Кулдаун: {s.cooldownHours}ч</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${STATUS_COLORS[s.status]}`}>
                        {s.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {dryRunCounts[s.id] !== undefined ? (
                          <span className="font-bold text-zinc-300">{dryRunCounts[s.id]} игроков</span>
                        ) : (
                          <span className="text-xs text-zinc-500">—</span>
                        )}
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-zinc-400 hover:text-white"
                          onClick={() => handleRunDryRun(s)}
                          isLoading={dryRunLoading[s.id]}
                        >
                          <RefreshCw size={14} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs">
                      {sStats ? (
                        <div className="flex flex-col gap-0.5 text-zinc-400">
                          <span>Отправлено: <strong className="text-zinc-300">{sStats.sent}</strong> <span className="text-zinc-500">(H: {sStats.holdout})</span></span>
                          <span>Клики: <strong className="text-blue-400">{sStats.clicks}</strong> <span className="text-zinc-500">({sCtr}%)</span></span>
                          <span>Возвраты: <strong className="text-purple-400">{sStats.returns}</strong> <span className="text-zinc-500">({sRet}%)</span></span>
                          {sStats.failed > 0 && (
                            <span className="text-red-400 mt-1">
                              Ошибки: <strong>{sStats.failed}</strong>
                              {sStats.failedChatNotFound > 0 && (
                                <span className="text-zinc-500"> (нет чата: {sStats.failedChatNotFound}</span>
                              )}
                              {sStats.failedBotBlocked > 0 && (
                                <span className="text-zinc-500">{sStats.failedChatNotFound > 0 ? ", " : " ("}блок: {sStats.failedBotBlocked}</span>
                              )}
                              {(sStats.failedChatNotFound > 0 || sStats.failedBotBlocked > 0) && (
                                <span className="text-zinc-500">)</span>
                              )}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500">Нет данных</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className={s.status === "active" ? "text-amber-500" : "text-emerald-500"}
                          onClick={() => handleToggleStatus(s)}
                          title={s.status === "active" ? "Деактивировать" : "Активировать"}
                        >
                          {s.status === "active" ? <Pause size={16} /> : <Play size={16} />}
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-blue-400 hover:text-white"
                          onClick={() => handleOpenEdit(s)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => handleDelete(s.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Create / Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {editingScenario ? `Редактировать сценарий #${editingScenario.id}` : "Создать сценарий пуша"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Событие-триггер"
                  selectedKeys={[formData.triggerType]}
                  onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                >
                  {TRIGGERS.map((t) => (
                    <SelectItem key={t.key} textValue={t.label}>
                      {t.label}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Сегмент игроков"
                  selectedKeys={[formData.segmentType]}
                  onChange={(e) => setFormData({ ...formData, segmentType: e.target.value })}
                >
                  {SEGMENTS.map((s) => (
                    <SelectItem key={s.key} textValue={s.label}>
                      {s.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border border-default-200 dark:border-default-100/20 bg-default-50 dark:bg-default-100/10 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Users size={16} />
                  <span>Оценочный охват (Dry-Run)</span>
                </div>
                <div className="text-sm font-semibold">
                  {modalDryRunLoading ? (
                    <Spinner size="sm" />
                  ) : modalDryRunCount !== null ? (
                    <span>{modalDryRunCount} игроков</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </div>

              <Textarea
                label="Текст уведомления (RU)"
                placeholder="Привет, {username}! Твоя энергия полностью восстановилась... 🚀"
                value={formData.textRu}
                onChange={(e) => setFormData({ ...formData, textRu: e.target.value })}
                minRows={3}
                description="Перед отправкой {username} и {first_name} заменятся на имя игрока: сначала firstName из Telegram, иначе @username, иначе «Player»."
              />

              <Textarea
                label="Текст уведомления (EN)"
                placeholder="Hello, {username}! Your energy is fully restored... 🚀"
                value={formData.textEn}
                onChange={(e) => setFormData({ ...formData, textEn: e.target.value })}
                minRows={3}
                description="Same placeholders as RU: {username} and {first_name} resolve to the player's display name."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="number"
                  label="Holdout группа (%)"
                  placeholder="20"
                  value={formData.holdoutPercentage.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, holdoutPercentage: parseInt(e.target.value, 10) || 0 })
                  }
                  description="Доля пользователей в контрольной группе без отправки пуша"
                />

                <Input
                  type="number"
                  label="Кулдаун (часов)"
                  placeholder="24"
                  value={formData.cooldownHours.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, cooldownHours: parseInt(e.target.value, 10) || 0 })
                  }
                  description="Минимальный интервал между пушами по этому сценарию"
                />

                <Input
                  type="number"
                  label="Приоритет"
                  placeholder="10"
                  value={formData.priority.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: parseInt(e.target.value, 10) || 0 })
                  }
                  description="Чем выше число, тем раньше сценарий обрабатывается в цикле"
                />
              </div>

              <Select
                label="Статус"
                selectedKeys={[formData.status]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "draft" | "approved" | "active",
                  })
                }
              >
                <SelectItem key="draft" textValue="DRAFT (Черновик)">
                  DRAFT (Черновик)
                </SelectItem>
                <SelectItem key="approved" textValue="APPROVED (Одобрен)">
                  APPROVED (Одобрен)
                </SelectItem>
                <SelectItem key="active" textValue="ACTIVE (Запущен)">
                  ACTIVE (Запущен)
                </SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Отмена
            </Button>
            <Button color="primary" onPress={() => void handleSave()}>
              Сохранить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

export default PushPage;
