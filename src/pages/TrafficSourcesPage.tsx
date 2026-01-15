import { useEffect, useMemo, useState, useContext } from "react";
import { observer } from "mobx-react-lite";
import { useDisclosure } from "@heroui/react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Context, type IStoreContext } from "@/store/StoreProvider";
import type { TrafficSource } from "@/http/trafficSourceAPI";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BOT_STARTAPP_PREFIX = "https://t.me/gftrobot?startapp=";

type MetricsBlock = {
  days: string[];
  activeDays?: number;
  activeStartDate?: string;
  sources: Array<
    TrafficSource & {
      activeUsersCount?: number;
      metrics: {
        messagesTotal: number;
        rewardPurchasesTotal: number;
        energyOrdersTotal: number;
        energyStarsTotal: number;
        casePurchasesTotal: number;
      };
      series: {
        messages: number[];
        rewardPurchases: number[];
        energyOrders: number[];
        energyStars: number[];
        casePurchases: number[];
      };
    }
  >;
};

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

const CHART_AXIS = "#9ca3af";
const CHART_GRID = "#2a2a2a";
const TOOLTIP_BG = "#0b1220";
const TOOLTIP_BORDER = "#243041";
const TOOLTIP_TEXT = "#e5e7eb";

const COLORS = [
  "#60a5fa",
  "#f97316",
  "#34d399",
  "#a78bfa",
  "#facc15",
  "#fb7185",
  "#22d3ee",
  "#c084fc",
  "#f87171",
  "#4ade80",
];

const TrafficSourcesPage = observer(() => {
  const { trafficSource } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [formData, setFormData] = useState<{ name: string; sourceUrl: string }>({
    name: "",
    sourceUrl: "",
  });

  const [selectedSourceId, setSelectedSourceId] = useState<number | "all">("all");
  const [activeDays, setActiveDays] = useState(7);

  useEffect(() => {
    trafficSource.fetchSources();
  }, [trafficSource]);

  useEffect(() => {
    trafficSource.fetchMetrics(30, activeDays);
  }, [trafficSource, activeDays]);

  const sorted = useMemo(() => {
    const arr = [...trafficSource.sources];
    arr.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return arr;
  }, [trafficSource.sources]);

  const metrics = trafficSource.metrics as MetricsBlock | null;

  const selection = useMemo(() => {
    if (!metrics) return null;
    if (selectedSourceId === "all") {
      const init = (n: number) => new Array(n).fill(0);
      const n = metrics.days.length;
      const agg = {
        id: 0,
        name: "Все источники",
        code: "",
        sourceUrl: null,
        isActive: true,
        createdAt: "",
        updatedAt: "",
        usersCount: sum(metrics.sources.map((s) => s.usersCount ?? 0)),
        activeUsersCount: sum(metrics.sources.map((s) => s.activeUsersCount ?? 0)),
        metrics: {
          messagesTotal: sum(metrics.sources.map((s) => s.metrics.messagesTotal)),
          rewardPurchasesTotal: sum(metrics.sources.map((s) => s.metrics.rewardPurchasesTotal)),
          energyOrdersTotal: sum(metrics.sources.map((s) => s.metrics.energyOrdersTotal)),
          energyStarsTotal: sum(metrics.sources.map((s) => s.metrics.energyStarsTotal)),
          casePurchasesTotal: sum(metrics.sources.map((s) => s.metrics.casePurchasesTotal)),
        },
        series: {
          messages: init(n),
          rewardPurchases: init(n),
          energyOrders: init(n),
          energyStars: init(n),
          casePurchases: init(n),
        },
      };

      for (const s of metrics.sources) {
        for (let i = 0; i < n; i++) {
          agg.series.messages[i] += s.series.messages[i] || 0;
          agg.series.rewardPurchases[i] += s.series.rewardPurchases[i] || 0;
          agg.series.energyOrders[i] += s.series.energyOrders[i] || 0;
          agg.series.energyStars[i] += s.series.energyStars[i] || 0;
          agg.series.casePurchases[i] += s.series.casePurchases[i] || 0;
        }
      }
      return agg;
    }

    return metrics.sources.find((s) => s.id === selectedSourceId) || null;
  }, [metrics, selectedSourceId]);

  const lineData = useMemo(() => {
    if (!metrics || !selection) return [];
    return metrics.days.map((day, idx) => ({
      day: day.slice(5), // MM-DD to keep it short
      fullDay: day,
      messages: selection.series.messages[idx] || 0,
      rewardPurchases: selection.series.rewardPurchases[idx] || 0,
      energyOrders: selection.series.energyOrders[idx] || 0,
      casePurchases: selection.series.casePurchases[idx] || 0,
    }));
  }, [metrics, selection]);

  const pieUsersData = useMemo(() => {
    if (!metrics) return [];
    const rows = metrics.sources
      .map((s) => ({ name: s.name, value: s.usersCount ?? 0 }))
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value);
    if (rows.length <= 10) return rows;
    const top = rows.slice(0, 9);
    const other = rows.slice(9).reduce((acc, r) => acc + r.value, 0);
    if (other > 0) top.push({ name: "Другое", value: other });
    return top;
  }, [metrics]);

  const activeUsersBarData = useMemo(() => {
    if (!metrics) return [];
    return [...metrics.sources]
      .map((s) => ({
        name: s.name.length > 18 ? `${s.name.slice(0, 18)}…` : s.name,
        fullName: s.name,
        activeUsers: s.activeUsersCount ?? 0,
        totalUsers: s.usersCount ?? 0,
      }))
      .sort((a, b) => b.activeUsers - a.activeUsers)
      .slice(0, 12);
  }, [metrics]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error("Failed to copy:", e);
      window.prompt("Скопируйте ссылку:", text);
    }
  };

  const handleCreate = async () => {
    try {
      const name = formData.name.trim();
      if (!name) return;
      await trafficSource.createSource({
        name,
        sourceUrl: formData.sourceUrl.trim() || null,
      });
      setFormData({ name: "", sourceUrl: "" });
      onClose();
    } catch (e) {
      console.error("Failed to create traffic source:", e);
    }
  };

  const handleToggleActive = async (item: TrafficSource, next: boolean) => {
    await trafficSource.updateSource(item.id, { isActive: next });
  };

  const handleDelete = async (item: TrafficSource) => {
    if (!window.confirm(`Удалить источник трафика "${item.name}"?`)) return;
    await trafficSource.deleteSource(item.id);
  };

  const columns = [
    { key: "name", label: "НАЗВАНИЕ" },
    { key: "code", label: "КОД" },
    { key: "link", label: "ССЫЛКА" },
    { key: "users", label: "ПОЛЬЗОВАТЕЛЕЙ" },
    { key: "active", label: "АКТИВЕН" },
    { key: "actions", label: "ДЕЙСТВИЯ" },
  ];

  const renderCell = (item: TrafficSource, columnKey: string) => {
    const link = `${BOT_STARTAPP_PREFIX}${item.code}`;
    switch (columnKey) {
      case "name":
        return (
          <div className="flex flex-col">
            <div className="font-medium">{item.name}</div>
            {item.sourceUrl ? (
              <div className="text-xs text-gray-500 break-all">{item.sourceUrl}</div>
            ) : null}
          </div>
        );
      case "code":
        return <code className="px-2 py-1 rounded text-sm">{item.code}</code>;
      case "link":
        return (
          <div className="flex items-center gap-2">
            <code className="px-2 py-1 rounded text-xs break-all">{link}</code>
            <Button
              size="sm"
              variant="flat"
              isIconOnly
              onClick={() => handleCopy(link)}
              aria-label="Copy link"
            >
              <Copy size={16} />
            </Button>
          </div>
        );
      case "users":
        return <span className="font-mono">{item.usersCount ?? 0}</span>;
      case "active":
        return (
          <Switch
            isSelected={!!item.isActive}
            onValueChange={(v) => handleToggleActive(item, v)}
          />
        );
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="flat"
              isIconOnly
              onClick={() => handleCopy(item.code)}
              aria-label="Copy code"
            >
              <Copy size={16} />
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              isIconOnly
              onClick={() => handleDelete(item)}
              aria-label="Delete"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Источники трафика"
        description="Генерация startapp-кодов и отслеживание пользователей, пришедших по рекламным ссылкам"
        actionButton={{
          label: "Создать источник",
          icon: Plus,
          onClick: () => {
            setFormData({ name: "", sourceUrl: "" });
            onOpen();
          },
        }}
      />

      {trafficSource.error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
          {trafficSource.error}
        </div>
      ) : null}

      <Card>
        <CardBody>
          <Table aria-label="Traffic sources table">
            <TableHeader columns={columns}>
              {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
            </TableHeader>
            <TableBody
              items={sorted}
              isLoading={trafficSource.loading}
              emptyContent={"Пока нет источников. Создайте первый."}
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => <TableCell>{renderCell(item, String(columnKey))}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Analytics / Charts */}
      <div className="space-y-4">
        <PageHeader
          title="Аналитика по трафику"
          description="Сообщения, покупки наград и покупки пакетов энергии для пользователей, пришедших по startapp-кодам"
        />

        <Card>
          <CardBody className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <div className="text-sm text-gray-300">Источник:</div>
              <select
                className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm w-full md:w-auto"
                value={selectedSourceId}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedSourceId(v === "all" ? "all" : Number(v));
                }}
              >
                <option value="all">Все источники</option>
                {metrics?.sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="text-sm text-gray-300">Активность:</div>
              <select
                className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm w-full md:w-auto"
                value={activeDays}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setActiveDays(v);
                }}
              >
                <option value={1}>1 день</option>
                <option value={3}>3 дня</option>
                <option value={7}>7 дней</option>
                <option value={14}>14 дней</option>
                <option value={30}>30 дней</option>
              </select>
              <Button
                variant="flat"
                size="sm"
                onClick={() => trafficSource.fetchMetrics(30, activeDays)}
              >
                Обновить
              </Button>
            </div>

            {!selection ? (
              <div className="text-gray-500 text-sm">Нет данных для отображения</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardBody>
                      <div className="text-xs text-gray-400">Пользователей</div>
                      <div className="text-2xl font-semibold">{selection.usersCount ?? 0}</div>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <div className="text-xs text-gray-400">Активных пользователей</div>
                      <div className="text-2xl font-semibold">{selection.activeUsersCount ?? 0}</div>
                      <div className="text-xs text-gray-500">за последние {activeDays} дн.</div>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <div className="text-xs text-gray-400">Сообщений (user)</div>
                      <div className="text-2xl font-semibold">{selection.metrics.messagesTotal}</div>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <div className="text-xs text-gray-400">Покупок наград</div>
                      <div className="text-2xl font-semibold">{selection.metrics.rewardPurchasesTotal}</div>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <div className="text-xs text-gray-400">Покупок энергии</div>
                      <div className="text-2xl font-semibold">{selection.metrics.energyOrdersTotal}</div>
                      <div className="text-xs text-gray-500">
                        Stars: {selection.metrics.energyStarsTotal}
                      </div>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <div className="text-xs text-gray-400">Покупок кейсов</div>
                      <div className="text-2xl font-semibold">{selection.metrics.casePurchasesTotal}</div>
                    </CardBody>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Сообщения (последние 30 дней)</h3>
                    </CardHeader>
                    <CardBody>
                      <div style={{ width: "100%", height: 220 }}>
                        <ResponsiveContainer>
                          <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                            <XAxis dataKey="day" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS }} />
                            <YAxis stroke={CHART_AXIS} tick={{ fill: CHART_AXIS }} />
                            <Tooltip
                              contentStyle={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}`, color: TOOLTIP_TEXT }}
                              labelStyle={{ color: TOOLTIP_TEXT }}
                              itemStyle={{ color: TOOLTIP_TEXT }}
                            />
                            <Line type="monotone" dataKey="messages" stroke={COLORS[0]} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Покупки наград (30 дней)</h3>
                    </CardHeader>
                    <CardBody>
                      <div style={{ width: "100%", height: 220 }}>
                        <ResponsiveContainer>
                          <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                            <XAxis dataKey="day" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS }} />
                            <YAxis stroke={CHART_AXIS} tick={{ fill: CHART_AXIS }} />
                            <Tooltip
                              contentStyle={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}`, color: TOOLTIP_TEXT }}
                              labelStyle={{ color: TOOLTIP_TEXT }}
                              itemStyle={{ color: TOOLTIP_TEXT }}
                            />
                            <Line type="monotone" dataKey="rewardPurchases" stroke={COLORS[1]} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Покупки энергии (30 дней)</h3>
                    </CardHeader>
                    <CardBody>
                      <div style={{ width: "100%", height: 220 }}>
                        <ResponsiveContainer>
                          <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                            <XAxis dataKey="day" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS }} />
                            <YAxis stroke={CHART_AXIS} tick={{ fill: CHART_AXIS }} />
                            <Tooltip
                              contentStyle={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}`, color: TOOLTIP_TEXT }}
                              labelStyle={{ color: TOOLTIP_TEXT }}
                              itemStyle={{ color: TOOLTIP_TEXT }}
                            />
                            <Line type="monotone" dataKey="energyOrders" stroke={COLORS[2]} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Покупки кейсов (30 дней)</h3>
                    </CardHeader>
                    <CardBody>
                      <div style={{ width: "100%", height: 220 }}>
                        <ResponsiveContainer>
                          <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                            <XAxis dataKey="day" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS }} />
                            <YAxis stroke={CHART_AXIS} tick={{ fill: CHART_AXIS }} />
                            <Tooltip
                              contentStyle={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}`, color: TOOLTIP_TEXT }}
                              labelStyle={{ color: TOOLTIP_TEXT }}
                              itemStyle={{ color: TOOLTIP_TEXT }}
                            />
                            <Line type="monotone" dataKey="casePurchases" stroke={COLORS[4]} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Доли пользователей по источникам</h3>
            </CardHeader>
            <CardBody>
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Tooltip
                      contentStyle={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}`, color: TOOLTIP_TEXT }}
                      labelStyle={{ color: TOOLTIP_TEXT }}
                      itemStyle={{ color: TOOLTIP_TEXT }}
                    />
                    <Legend wrapperStyle={{ color: TOOLTIP_TEXT }} />
                    <Pie
                      data={pieUsersData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={110}
                      label={({ name, percent }) => {
                        const p = typeof percent === "number" ? percent : 0;
                        return `${name}: ${(p * 100).toFixed(0)}%`;
                      }}
                    >
                      {pieUsersData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Активные пользователи по источникам</h3>
              <div className="text-xs text-gray-500">за последние {activeDays} дней (топ 12)</div>
            </CardHeader>
            <CardBody>
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={activeUsersBarData} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                    <XAxis type="number" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS }} />
                    <YAxis type="category" dataKey="name" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS }} width={90} />
                    <Tooltip
                      contentStyle={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}`, color: TOOLTIP_TEXT }}
                      labelStyle={{ color: TOOLTIP_TEXT }}
                      itemStyle={{ color: TOOLTIP_TEXT }}
                    />
                    <Legend wrapperStyle={{ color: TOOLTIP_TEXT }} />
                    <Bar dataKey="activeUsers" name="Активные" fill={COLORS[0]} />
                    <Bar dataKey="totalUsers" name="Всего" fill={COLORS[3]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Create modal (simple Card-based to avoid extra deps) */}
      {isOpen ? (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Новый источник</div>
              <Button size="sm" variant="flat" onClick={onClose}>
                Закрыть
              </Button>
            </div>

            <div className="space-y-3">
              <Input
                label="Название"
                placeholder="Например: VK Ads / блогер Иван / TikTok #1"
                value={formData.name}
                onValueChange={(v) => setFormData((s) => ({ ...s, name: v }))}
              />
              <Input
                label="Ссылка на источник (опционально)"
                placeholder="Например: https://vk.com/..."
                value={formData.sourceUrl}
                onValueChange={(v) => setFormData((s) => ({ ...s, sourceUrl: v }))}
              />
              <div className="text-xs text-gray-400">
                После создания будет сгенерирован код и ссылка вида:{" "}
                <code>{BOT_STARTAPP_PREFIX}CODE</code>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="flat" onClick={onClose}>
                Отмена
              </Button>
              <Button color="primary" onClick={handleCreate} isDisabled={!formData.name.trim()}>
                Создать
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
});

export default TrafficSourcesPage;


