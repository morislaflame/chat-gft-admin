import { useEffect, useState, useCallback, useContext, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { PageHeader } from '@/components/ui';
import { 
  getUserDetails,
  getUserChatHistory,
  resetUserHistory,
  setUserBalance,
  setUserEnergy,
  getUserPurchasedRewards,
  deleteUserPurchasedReward,
  deleteUser,
  getUserArtifactsGrantCatalog,
  type UserDetailsResponse,
  type UserChatHistoryResponse,
  type PurchasedRewardAdmin,
  type WithdrawalStatus,
  type AdminArtifactsGrantCatalogResponse,
} from '@/http/adminAPI';
import { getUserArtifactTransactions, type ArtifactTransactionRow, type UserArtifactTransactionsResponse } from '@/http/artifactMarketAPI';
import { getAllAgents, type Agent } from '@/http/agentAPI';
import { USERS_ROUTE } from '@/utils/consts';
import { formatDate } from '@/utils/formatters';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import {
  Card,
  CardBody,
  Image,
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Divider
} from '@heroui/react';
import { 
  ArrowLeft, 
  Trash2, 
  RotateCcw, 
  MessageSquare,
  Zap,
  Coins,
  Gift,
  Gem
} from 'lucide-react';
import GrantUserArtifactsModal from '@/components/UsersPageComponents/GrantUserArtifactsModal';
import UserArtifactsInventorySection from '@/components/UsersPageComponents/UserArtifactsInventorySection';
import UserCompanionsInventorySection from '@/components/UsersPageComponents/UserCompanionsInventorySection';
import { getUserCompanionsInventory, type UserCompanionInventoryItem } from '@/http/companionAPI';
import Lottie from 'lottie-react';

const UserDetailsPage = observer(() => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { caseStore } = useContext(Context) as IStoreContext;
  const [userDetails, setUserDetails] = useState<UserDetailsResponse | null>(null);
  const [chatHistory, setChatHistory] = useState<UserChatHistoryResponse | null>(null);
  const [histories, setHistories] = useState<Agent[]>([]);
  const [selectedHistoryName, setSelectedHistoryName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchasedRewards, setPurchasedRewards] = useState<PurchasedRewardAdmin[]>([]);
  const [purchasedRewardsLoading, setPurchasedRewardsLoading] = useState(false);
  const [purchasedRewardsError, setPurchasedRewardsError] = useState<string | null>(null);
  const [rewardAnimations, setRewardAnimations] = useState<{ [url: string]: Record<string, unknown> }>({});
  const loadedRewardAnimationUrls = useRef<Set<string>>(new Set());
  const [deletingRewardId, setDeletingRewardId] = useState<number | null>(null);
  const [artifactTransactions, setArtifactTransactions] = useState<ArtifactTransactionRow[]>([]);
  const [artifactTxTotals, setArtifactTxTotals] = useState<UserArtifactTransactionsResponse['totals'] | null>(null);
  const [artifactTxLoading, setArtifactTxLoading] = useState(false);
  const [artifactTxError, setArtifactTxError] = useState<string | null>(null);
  const [artifactsCatalog, setArtifactsCatalog] = useState<AdminArtifactsGrantCatalogResponse | null>(null);
  const [artifactsCatalogLoading, setArtifactsCatalogLoading] = useState(false);
  const [artifactsCatalogError, setArtifactsCatalogError] = useState<string | null>(null);
  const [companionsInventory, setCompanionsInventory] = useState<UserCompanionInventoryItem[]>([]);
  const [companionsInventoryLoading, setCompanionsInventoryLoading] = useState(false);
  const [companionsInventoryError, setCompanionsInventoryError] = useState<string | null>(null);
  
  // Модалки для действий
  const { isOpen: isBalanceModalOpen, onOpen: onBalanceModalOpen, onClose: onBalanceModalClose } = useDisclosure();
  const { isOpen: isEnergyModalOpen, onOpen: onEnergyModalOpen, onClose: onEnergyModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isGrantArtifactsOpen, onOpen: onGrantArtifactsOpen, onClose: onGrantArtifactsClose } = useDisclosure();
  
  const [balanceAmount, setBalanceAmount] = useState<string>('');
  const [energyAmount, setEnergyAmount] = useState<string>('');

  const loadArtifactsCatalog = useCallback(async () => {
    if (!userId) return;
    setArtifactsCatalogLoading(true);
    setArtifactsCatalogError(null);
    try {
      const data = await getUserArtifactsGrantCatalog(userId);
      setArtifactsCatalog(data);
    } catch (err: unknown) {
      console.error('Не удалось загрузить инвентарь артефактов:', err);
      const errorObj = err as { response?: { data?: { message?: string } } };
      setArtifactsCatalogError(errorObj.response?.data?.message || 'Не удалось загрузить инвентарь артефактов');
      setArtifactsCatalog(null);
    } finally {
      setArtifactsCatalogLoading(false);
    }
  }, [userId]);

  const loadCompanionsInventory = useCallback(async () => {
    if (!userId) return;
    setCompanionsInventoryLoading(true);
    setCompanionsInventoryError(null);
    try {
      const data = await getUserCompanionsInventory(userId);
      setCompanionsInventory(data);
    } catch (err: unknown) {
      console.error('Не удалось загрузить компаньонов:', err);
      const errorObj = err as { response?: { data?: { message?: string } } };
      setCompanionsInventoryError(errorObj.response?.data?.message || 'Не удалось загрузить компаньонов');
      setCompanionsInventory([]);
    } finally {
      setCompanionsInventoryLoading(false);
    }
  }, [userId]);

  const loadUserDetails = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const details = await getUserDetails(userId);
      setUserDetails(details);
      if (details.user.selectedHistoryName) {
        setSelectedHistoryName(details.user.selectedHistoryName);
      }
    } catch (err: unknown) {
      console.error('Не удалось загрузить данные пользователя:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Не удалось загрузить данные пользователя');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadUserDetails();
      loadHistories();
      // Admin-only: case open history for this user
      if (caseStore.userOpenedCasesHistoryForUserId !== userId) {
        caseStore.fetchUserOpenedCasesHistory(userId, { limit: 500, offset: 0 });
      }

      // Purchased rewards list for this user
      setPurchasedRewardsLoading(true);
      setPurchasedRewardsError(null);
      getUserPurchasedRewards(userId)
        .then((data) => setPurchasedRewards(data.purchases || []))
        .catch((err: unknown) => {
          console.error('Не удалось загрузить купленные награды:', err);
          const errorObj = err as { response?: { data?: { message?: string } } };
          setPurchasedRewardsError(errorObj.response?.data?.message || 'Не удалось загрузить купленные награды');
          setPurchasedRewards([]);
        })
        .finally(() => setPurchasedRewardsLoading(false));

      setArtifactTxLoading(true);
      setArtifactTxError(null);
      getUserArtifactTransactions(userId)
        .then((data) => {
          setArtifactTransactions(data.transactions || []);
          setArtifactTxTotals(data.totals || null);
        })
        .catch((err: unknown) => {
          console.error('Не удалось загрузить операции с артефактами:', err);
          const errorObj = err as { response?: { data?: { message?: string } } };
          setArtifactTxError(errorObj.response?.data?.message || 'Не удалось загрузить операции с артефактами');
          setArtifactTransactions([]);
          setArtifactTxTotals(null);
        })
        .finally(() => setArtifactTxLoading(false));

      void loadArtifactsCatalog();
      void loadCompanionsInventory();
    }
  }, [userId, loadUserDetails, loadArtifactsCatalog, loadCompanionsInventory, caseStore]);

  // Load Lottie JSON animations for purchased rewards
  useEffect(() => {
    const run = async () => {
      const newAnimations: { [url: string]: Record<string, unknown> } = {};
      for (const pr of purchasedRewards) {
        const mediaFile = pr.reward?.mediaFile;
        if (!mediaFile) continue;
        if (mediaFile.mimeType !== 'application/json') continue;
        if (loadedRewardAnimationUrls.current.has(mediaFile.url)) continue;
        try {
          const resp = await fetch(mediaFile.url);
          const json = await resp.json();
          newAnimations[mediaFile.url] = json;
          loadedRewardAnimationUrls.current.add(mediaFile.url);
        } catch (e) {
          console.error(`Error loading animation for ${mediaFile.url}:`, e);
        }
      }
      if (Object.keys(newAnimations).length > 0) {
        setRewardAnimations((prev) => ({ ...prev, ...newAnimations }));
      }
    };
    run();
  }, [purchasedRewards]);

  const getWithdrawalStatus = (reward: PurchasedRewardAdmin): WithdrawalStatus | null => {
    const list = reward.withdrawalRequests || [];
    if (!list.length) return null;
    // Backend returns sorted desc, but keep it safe
    const latest = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    return latest?.status ?? null;
  };

  const caseOpenHistory = caseStore.userOpenedCasesHistory;
  const caseOpenHistoryByCaseLabel = useMemo(() => {
    if (!caseOpenHistory?.byCase?.length) return null;
    return caseOpenHistory.byCase
      .slice(0, 10)
      .map((c) => `${c.caseName}: ${c.count}`)
      .join(' • ');
  }, [caseOpenHistory]);

  const loadHistories = async () => {
    try {
      const agents = await getAllAgents();
      setHistories(agents);
    } catch (err) {
      console.error('Не удалось загрузить истории:', err);
    }
  };

  const handleLoadChatHistory = async () => {
    if (!userId || !selectedHistoryName) {
      setError('Пожалуйста, выберите историю');
      return;
    }

    setLoadingHistory(true);
    setError(null);
    try {
      const history = await getUserChatHistory(parseInt(userId), selectedHistoryName);
      setChatHistory(history);
    } catch (err: unknown) {
      console.error('Не удалось загрузить историю чата:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Не удалось загрузить историю чата');
      setChatHistory(null);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleResetHistory = async () => {
    if (!userId || !selectedHistoryName) {
      setError('Пожалуйста, выберите историю');
      return;
    }

    if (!window.confirm(`Вы уверены, что хотите сбросить историю чата для "${selectedHistoryName}"? Это действие нельзя отменить.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await resetUserHistory(parseInt(userId), selectedHistoryName);
      alert('История успешно сброшена!');
      if (chatHistory) {
        await handleLoadChatHistory();
      }
      await loadUserDetails();
    } catch (err: unknown) {
      console.error('Не удалось сбросить историю:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Не удалось сбросить историю');
    } finally {
      setLoading(false);
    }
  };

  const handleSetBalance = async () => {
    if (!userId) return;
    const nextBalance = parseInt(balanceAmount);
    if (isNaN(nextBalance) || nextBalance < 0) {
      setError('Введите корректное число (>= 0)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await setUserBalance(parseInt(userId), nextBalance);
      alert(`Баланс успешно установлен!`);
      onBalanceModalClose();
      setBalanceAmount('');
      await loadUserDetails();
    } catch (err: unknown) {
      console.error('Не удалось обновить баланс:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Не удалось обновить баланс');
    } finally {
      setLoading(false);
    }
  };

  const handleSetEnergy = async () => {
    if (!userId) return;
    const nextEnergy = parseInt(energyAmount);
    if (isNaN(nextEnergy) || nextEnergy < 0) {
      setError('Введите корректное число (>= 0)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await setUserEnergy(parseInt(userId), nextEnergy);
      alert(`Энергия успешно установлена!`);
      onEnergyModalClose();
      setEnergyAmount('');
      await loadUserDetails();
    } catch (err: unknown) {
      console.error('Не удалось обновить энергию:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Не удалось обновить энергию');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReward = async (userRewardId: number, rewardName: string) => {
    if (!userId) return;

    if (!window.confirm(`Вы уверены, что хотите удалить награду "${rewardName}" из покупок этого пользователя? Это действие нельзя отменить.`)) {
      return;
    }

    setDeletingRewardId(userRewardId);
    setPurchasedRewardsError(null);
    try {
      await deleteUserPurchasedReward(userId, userRewardId);
      // Reload purchased rewards list
      const data = await getUserPurchasedRewards(userId);
      setPurchasedRewards(data.purchases || []);
    } catch (err: unknown) {
      console.error('Не удалось удалить награду:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setPurchasedRewardsError(error.response?.data?.message || 'Не удалось удалить награду');
    } finally {
      setDeletingRewardId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userId) return;

    if (!window.confirm(`Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить, все его данные будут удалены.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteUser(parseInt(userId));
      alert('Пользователь успешно удален!');
      navigate(USERS_ROUTE);
    } catch (err: unknown) {
      console.error('Не удалось удалить пользователя:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Не удалось удалить пользователя');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userDetails) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-red-500">
          Пользователь не найден
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="light"
            startContent={<ArrowLeft size={16} />}
            onPress={() => navigate(USERS_ROUTE)}
          >
            Назад
          </Button>
          <PageHeader
            title={`Профиль пользователя: ${userDetails.user.firstName} ${userDetails.user.lastName}`}
            description={`ID: ${userDetails.user.id} | Telegram ID: ${userDetails.user.telegramId || 'Н/Д'}`}
          />
        </div>
        <Button
          color="danger"
          variant="flat"
          startContent={<Trash2 size={16} />}
          onPress={onDeleteModalOpen}
        >
          Удалить пользователя
        </Button>
      </div>

      {error && (
        <Card className="border border-red-500">
          <CardBody>
            <div className="text-red-500 text-sm">{error}</div>
          </CardBody>
        </Card>
      )}

      {/* User Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardBody>
            <h3 className="font-semibold mb-4 text-3xl">Информация о пользователе</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-200">Username:</span>
                <span className="font-medium">@{userDetails.user.username || 'без username'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-200">Язык:</span>
                <Chip size="sm">{userDetails.user.language?.toUpperCase() || 'EN'}</Chip>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-200">Зарегистрирован:</span>
                <span>{formatDate(userDetails.user.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-200">Выбранная история:</span>
                <span>{userDetails.user.selectedHistoryName || 'starwars'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-200">ID выбранной миссии в чате:</span>
                <span>
                  {userDetails.user.selectedChatMissionId != null
                    ? String(userDetails.user.selectedChatMissionId)
                    : '—'}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-semibold mb-4 text-3xl">Статистика</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-200">Баланс:</span>
                <Chip color="success" variant="flat">{userDetails.user.balance}</Chip>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-200">Энергия:</span>
                <Chip color="warning" variant="flat">{userDetails.user.energy}</Chip>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-200">Сообщений отправлено:</span>
                <span>{userDetails.messageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-200">Первое сообщение:</span>
                <span>{userDetails.firstMessageAt ? formatDate(userDetails.firstMessageAt) : 'Никогда'}</span>
              </div>
              <Divider />
              <div className="flex justify-between">
                <span className="text-gray-200">Рефералы:</span>
                <Chip color="primary" variant="flat">{userDetails.referralCount}</Chip>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-200">Купленные награды:</span>
                <Chip color="secondary" variant="flat">{userDetails.purchasedRewardsCount}</Chip>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardBody>
          <h3 className="font-semibold mb-4">Действия</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              color="warning"
              variant="flat"
              startContent={<Gem size={16} />}
              onPress={onGrantArtifactsOpen}
            >
              Начислить артефакты
            </Button>
            <Button
              color="success"
              variant="flat"
              startContent={<Coins size={16} />}
              onPress={onBalanceModalOpen}
            >
              Установить баланс
            </Button>
            <Button
              color="warning"
              variant="flat"
              startContent={<Zap size={16} />}
              onPress={onEnergyModalOpen}
            >
              Установить энергию
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Case Open History */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">История открытия кейсов</h3>
          </div>

          {caseStore.userOpenedCasesHistoryError ? (
            <div className="text-sm text-red-500">{caseStore.userOpenedCasesHistoryError}</div>
          ) : null}

          {caseStore.userOpenedCasesHistoryLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : null}

          {!caseStore.userOpenedCasesHistoryLoading && caseOpenHistory ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-zinc-800 rounded">
                  <div className="text-sm text-gray-200">Всего открыто</div>
                  <div className="text-xl font-bold">{caseOpenHistory.totalOpened}</div>
                </div>
                <div className="text-center p-3 bg-zinc-800 rounded">
                  <div className="text-sm text-gray-200">Награды</div>
                  <div className="text-xl font-bold">{caseOpenHistory.byDropType.reward}</div>
                </div>
                <div className="text-center p-3 bg-zinc-800 rounded">
                  <div className="text-sm text-gray-200">Гемы / Энергия</div>
                  <div className="text-xl font-bold">
                    {caseOpenHistory.byDropType.gems} / {caseOpenHistory.byDropType.energy}
                  </div>
                </div>
              </div>

              {caseOpenHistoryByCaseLabel ? (
                <div className="text-xs text-gray-400">{caseOpenHistoryByCaseLabel}</div>
              ) : null}

              {caseOpenHistory.opens?.length ? (
                <Table aria-label="Таблица истории открытия кейсов">
                  <TableHeader>
                    <TableColumn>ОТКРЫТО</TableColumn>
                    <TableColumn>КЕЙС</TableColumn>
                    <TableColumn>ДРОП</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {caseOpenHistory.opens.map((row) => {
                      const type = row.result?.type;
                      const drop =
                        type === 'reward'
                          ? row.result?.reward?.name || (row.result?.reward?.id ? `Награда #${row.result.reward.id}` : 'Награда')
                          : type === 'gems'
                            ? `+${row.result?.amount ?? '?'} гемов`
                            : type === 'energy'
                              ? `+${row.result?.amount ?? '?'} энергии`
                              : 'Неизвестно';

                      return (
                        <TableRow key={row.userCaseId}>
                          <TableCell>
                            <div className="text-xs text-gray-500">{formatDate(row.openedAt)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{row.case?.name || 'Неизвестный кейс'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{drop}</div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-400">Открытия кейсов не найдены.</div>
              )}
            </>
          ) : null}
        </CardBody>
      </Card>

      <UserCompanionsInventorySection
        userId={userId ?? ''}
        items={companionsInventory}
        loading={companionsInventoryLoading}
        error={companionsInventoryError}
        onChanged={() => void loadCompanionsInventory()}
      />

      <UserArtifactsInventorySection
        catalog={artifactsCatalog}
        loading={artifactsCatalogLoading}
        error={artifactsCatalogError}
      />

      {/* Artifact market transactions */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Gem className="w-4 h-4 text-amber-400" />
              Операции с артефактами
            </h3>
            <Chip size="sm" variant="flat" color="warning">
              {artifactTransactions.length}
            </Chip>
          </div>

          {artifactTxTotals ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border border-zinc-700/60 p-3">
                <p className="text-xs text-gray-500">Покупок</p>
                <p className="text-lg font-semibold">{artifactTxTotals.buyCount}</p>
              </div>
              <div className="rounded-lg border border-zinc-700/60 p-3">
                <p className="text-xs text-gray-500">Продаж</p>
                <p className="text-lg font-semibold">{artifactTxTotals.sellCount}</p>
              </div>
              <div className="rounded-lg border border-zinc-700/60 p-3">
                <p className="text-xs text-gray-500">Потрачено gems</p>
                <p className="text-lg font-semibold text-amber-500">{artifactTxTotals.buyTotalPrice}</p>
              </div>
              <div className="rounded-lg border border-zinc-700/60 p-3">
                <p className="text-xs text-gray-500">Получено gems</p>
                <p className="text-lg font-semibold text-emerald-500">{artifactTxTotals.sellTotalPrice}</p>
              </div>
            </div>
          ) : null}

          {artifactTxError ? <div className="text-sm text-red-500">{artifactTxError}</div> : null}

          {artifactTxLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : null}

          {!artifactTxLoading ? (
            artifactTransactions.length > 0 ? (
              <Table aria-label="Таблица операций с артефактами">
                <TableHeader>
                  <TableColumn>АРТЕФАКТ</TableColumn>
                  <TableColumn>ИСТОРИЯ</TableColumn>
                  <TableColumn>ТИП</TableColumn>
                  <TableColumn>ЦЕНА</TableColumn>
                  <TableColumn>БАЛАНС</TableColumn>
                  <TableColumn>ДАТА</TableColumn>
                </TableHeader>
                <TableBody>
                  {artifactTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tx.artifact?.name || `#${tx.artifactId}`}</p>
                          <p className="text-xs text-gray-500">{tx.artifact?.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>{tx.historyName}</TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={tx.type === 'BUY' ? 'warning' : 'success'}
                        >
                          {tx.type === 'BUY' ? 'Покупка' : 'Продажа'}
                        </Chip>
                      </TableCell>
                      <TableCell>{tx.price}</TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-500">{tx.balanceBefore}</span>
                        <span className="mx-1">→</span>
                        <span className="text-xs">{tx.balanceAfter}</span>
                      </TableCell>
                      <TableCell>{formatDate(tx.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-400">Операций с артефактами не найдено.</div>
            )
          ) : null}
        </CardBody>
      </Card>

      {/* Purchased Rewards */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Купленные награды</h3>
            <Chip size="sm" variant="flat" color="secondary">
              {purchasedRewards.length}
            </Chip>
          </div>

          {purchasedRewardsError ? (
            <div className="text-sm text-red-500">{purchasedRewardsError}</div>
          ) : null}

          {purchasedRewardsLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : null}

          {!purchasedRewardsLoading ? (
            purchasedRewards.length > 0 ? (
                <Table aria-label="Таблица купленных наград">
                <TableHeader>
                  <TableColumn>НАГРАДА</TableColumn>
                  <TableColumn>ЦЕНА</TableColumn>
                  <TableColumn>СТАТУС</TableColumn>
                  <TableColumn>КУПЛЕНО</TableColumn>
                  <TableColumn>ДЕЙСТВИЯ</TableColumn>
                </TableHeader>
                <TableBody>
                  {purchasedRewards.map((pr) => {
                    const media = pr.reward?.mediaFile;
                    const withdrawalStatus = getWithdrawalStatus(pr);

                    const statusChip = (() => {
                      if (!withdrawalStatus) {
                        return (
                          <Chip size="sm" variant="flat">
                            В инвентаре
                          </Chip>
                        );
                      }
                      if (withdrawalStatus === 'pending') {
                        return (
                          <Chip size="sm" variant="flat" color="warning">
                            Вывод: ожидает
                          </Chip>
                        );
                      }
                      if (withdrawalStatus === 'completed') {
                        return (
                          <Chip size="sm" variant="flat" color="success">
                            Вывод: выполнен
                          </Chip>
                        );
                      }
                      return (
                        <Chip size="sm" variant="flat" color="danger">
                          Вывод: отклонен
                        </Chip>
                      );
                    })();

                    const mediaNode = (() => {
                      if (!media?.url) {
                        return (
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                            <Gift className="w-6 h-6 text-white" />
                          </div>
                        );
                      }
                      if (media.mimeType === 'application/json') {
                        const anim = rewardAnimations[media.url];
                        return anim ? (
                          <div className="w-12 h-12 flex items-center justify-center">
                            <Lottie
                              animationData={anim}
                              loop={false}
                              autoplay={true}
                              style={{ width: 48, height: 48 }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-gray-400">
                            ...
                          </div>
                        );
                      }
                      if (media.mimeType.startsWith('image/')) {
                        return (
                          <Image
                            src={media.url}
                            alt={pr.reward?.name || 'Награда'}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        );
                      }
                      return (
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                      );
                    })();

                    return (
                      <TableRow key={pr.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {mediaNode}
                            <div>
                              <p className="font-medium">{pr.reward?.name || `Награда #${pr.rewardId}`}</p>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {pr.reward?.description || ''}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold">{pr.purchasePrice}</div>
                        </TableCell>
                        <TableCell>{statusChip}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{formatDate(pr.purchaseDate)}</span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            startContent={<Trash2 size={14} />}
                            onClick={() => handleDeleteReward(pr.id, pr.reward?.name || `Награда #${pr.rewardId}`)}
                            isLoading={deletingRewardId === pr.id}
                            isDisabled={deletingRewardId !== null}
                          >
                            Удалить
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-400">Купленные награды не найдены.</div>
            )
          ) : null}
        </CardBody>
      </Card>

      {/* Chat History */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">История чата</h3>
            <div className="flex gap-2">
              <Select
                label="История"
                placeholder="Выберите историю"
                selectedKeys={selectedHistoryName ? [selectedHistoryName] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setSelectedHistoryName(selected || '');
                }}
                className="w-48"
              >
                {histories.map((agent) => (
                  <SelectItem key={agent.historyName}>
                    {agent.historyName}
                  </SelectItem>
                ))}
              </Select>
              <Button
                color="primary"
                variant="flat"
                startContent={<MessageSquare size={16} />}
                onPress={handleLoadChatHistory}
                isLoading={loadingHistory}
                isDisabled={!selectedHistoryName}
              >
                Загрузить историю
              </Button>
              {chatHistory && (
                <Button
                  color="danger"
                  variant="flat"
                  startContent={<RotateCcw size={16} />}
                  onPress={handleResetHistory}
                  isLoading={loading}
                >
                  Сбросить историю
                </Button>
              )}
            </div>
          </div>

          {chatHistory && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-zinc-800  rounded">
                  <div className="text-sm text-gray-200">Всего сообщений</div>
                  <div className="text-xl font-bold">{chatHistory.totalMessages}</div>
                </div>
                <div className="text-center p-3 bg-zinc-800 rounded">
                  <div className="text-sm text-gray-200">Сообщений пользователя</div>
                  <div className="text-xl font-bold">{chatHistory.userMessageCount}</div>
                </div>
                <div className="text-center p-3 bg-zinc-800 rounded">
                  <div className="text-sm text-gray-200">Сообщений ассистента</div>
                  <div className="text-xl font-bold">{chatHistory.assistantMessageCount}</div>
                </div>
              </div>

              {chatHistory.history.length > 0 ? (
                <Table aria-label="Таблица истории чата">
                  <TableHeader>
                    <TableColumn>ДАТА</TableColumn>
                    <TableColumn>СООБЩЕНИЕ ПОЛЬЗОВАТЕЛЯ</TableColumn>
                    <TableColumn>ОТВЕТ АССИСТЕНТА</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {chatHistory.history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="text-xs text-gray-500">
                            {formatDate(item.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <div className="text-sm bg-blue-500/20 rounded-lg p-2">
                              {item.userMessage}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            {item.assistantMessage ? (
                              <div className="text-sm bg-gray-500/20 rounded-lg p-2">
                                {item.assistantMessage}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Нет ответа</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  История чата для выбранной истории не найдена.
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Modals */}
      <Modal isOpen={isBalanceModalOpen} onClose={onBalanceModalClose}>
        <ModalContent>
          <ModalHeader>Установить баланс</ModalHeader>
          <ModalBody>
            <Input
              label="Новый баланс"
              type="number"
              placeholder="Введите значение (>= 0)"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onBalanceModalClose}>Отмена</Button>
            <Button color="success" onPress={handleSetBalance} isLoading={loading}>
              Установить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEnergyModalOpen} onClose={onEnergyModalClose}>
        <ModalContent>
          <ModalHeader>Установить энергию</ModalHeader>
          <ModalBody>
            <Input
              label="Новая энергия"
              type="number"
              placeholder="Введите значение (>= 0)"
              value={energyAmount}
              onChange={(e) => setEnergyAmount(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onEnergyModalClose}>Отмена</Button>
            <Button color="warning" onPress={handleSetEnergy} isLoading={loading}>
              Установить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <GrantUserArtifactsModal
        isOpen={isGrantArtifactsOpen}
        onClose={onGrantArtifactsClose}
        userId={userId ?? null}
        catalog={artifactsCatalog}
        catalogLoading={artifactsCatalogLoading}
        onGranted={() => void loadArtifactsCatalog()}
      />

      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalContent>
          <ModalHeader>Удалить пользователя</ModalHeader>
          <ModalBody>
            <p>Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить, включая удаление истории чата.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteModalClose}>Отмена</Button>
            <Button color="danger" onPress={handleDeleteUser} isLoading={loading}>
              Удалить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

export default UserDetailsPage;

