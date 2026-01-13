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
  deleteUser,
  type UserDetailsResponse,
  type UserChatHistoryResponse,
  type PurchasedRewardAdmin,
  type WithdrawalStatus
} from '@/http/adminAPI';
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
  Gift
} from 'lucide-react';
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
  
  // Модалки для действий
  const { isOpen: isBalanceModalOpen, onOpen: onBalanceModalOpen, onClose: onBalanceModalClose } = useDisclosure();
  const { isOpen: isEnergyModalOpen, onOpen: onEnergyModalOpen, onClose: onEnergyModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  
  const [balanceAmount, setBalanceAmount] = useState<string>('');
  const [energyAmount, setEnergyAmount] = useState<string>('');

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
      console.error('Failed to load user details:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load user details');
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
          console.error('Failed to load purchased rewards:', err);
          const errorObj = err as { response?: { data?: { message?: string } } };
          setPurchasedRewardsError(errorObj.response?.data?.message || 'Failed to load purchased rewards');
          setPurchasedRewards([]);
        })
        .finally(() => setPurchasedRewardsLoading(false));
    }
  }, [userId, loadUserDetails, caseStore]);

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
      console.error('Failed to load histories:', err);
    }
  };

  const handleLoadChatHistory = async () => {
    if (!userId || !selectedHistoryName) {
      setError('Please select a history');
      return;
    }

    setLoadingHistory(true);
    setError(null);
    try {
      const history = await getUserChatHistory(parseInt(userId), selectedHistoryName);
      setChatHistory(history);
    } catch (err: unknown) {
      console.error('Failed to load chat history:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load chat history');
      setChatHistory(null);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleResetHistory = async () => {
    if (!userId || !selectedHistoryName) {
      setError('Please select a history');
      return;
    }

    if (!window.confirm(`Are you sure you want to reset chat history for history "${selectedHistoryName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await resetUserHistory(parseInt(userId), selectedHistoryName);
      alert('History reset successfully!');
      if (chatHistory) {
        await handleLoadChatHistory();
      }
      await loadUserDetails();
    } catch (err: unknown) {
      console.error('Failed to reset history:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to reset history');
    } finally {
      setLoading(false);
    }
  };

  const handleSetBalance = async () => {
    if (!userId) return;
    const nextBalance = parseInt(balanceAmount);
    if (isNaN(nextBalance) || nextBalance < 0) {
      setError('Please enter a valid number (>= 0)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await setUserBalance(parseInt(userId), nextBalance);
      alert(`Balance set successfully!`);
      onBalanceModalClose();
      setBalanceAmount('');
      await loadUserDetails();
    } catch (err: unknown) {
      console.error('Failed to update balance:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update balance');
    } finally {
      setLoading(false);
    }
  };

  const handleSetEnergy = async () => {
    if (!userId) return;
    const nextEnergy = parseInt(energyAmount);
    if (isNaN(nextEnergy) || nextEnergy < 0) {
      setError('Please enter a valid number (>= 0)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await setUserEnergy(parseInt(userId), nextEnergy);
      alert(`Energy set successfully!`);
      onEnergyModalClose();
      setEnergyAmount('');
      await loadUserDetails();
    } catch (err: unknown) {
      console.error('Failed to update energy:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update energy');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userId) return;

    if (!window.confirm(`Are you sure you want to delete this user? This action cannot be undone and will delete all user data.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteUser(parseInt(userId));
      alert('User deleted successfully!');
      navigate(USERS_ROUTE);
    } catch (err: unknown) {
      console.error('Failed to delete user:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete user');
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
          User not found
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
            Back
          </Button>
          <PageHeader
            title={`User Details: ${userDetails.user.firstName} ${userDetails.user.lastName}`}
            description={`ID: ${userDetails.user.id} | Telegram ID: ${userDetails.user.telegramId || 'N/A'}`}
          />
        </div>
        <Button
          color="danger"
          variant="flat"
          startContent={<Trash2 size={16} />}
          onPress={onDeleteModalOpen}
        >
          Delete User
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
            <h3 className="font-semibold mb-4 text-3xl">User Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-200">Username:</span>
                <span className="font-medium">@{userDetails.user.username || 'No username'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-200">Language:</span>
                <Chip size="sm">{userDetails.user.language?.toUpperCase() || 'EN'}</Chip>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-200">Registered:</span>
                <span>{formatDate(userDetails.user.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-200">Selected History:</span>
                <span>{userDetails.user.selectedHistoryName || 'starwars'}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-semibold mb-4 text-3xl">Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-200">Balance:</span>
                <Chip color="success" variant="flat">{userDetails.user.balance}</Chip>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-200">Energy:</span>
                <Chip color="warning" variant="flat">{userDetails.user.energy}</Chip>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-200">Messages Sent:</span>
                <span>{userDetails.messageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-200">First Message:</span>
                <span>{userDetails.firstMessageAt ? formatDate(userDetails.firstMessageAt) : 'Never'}</span>
              </div>
              <Divider />
              <div className="flex justify-between">
                <span className="text-gray-200">Referrals:</span>
                <Chip color="primary" variant="flat">{userDetails.referralCount}</Chip>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-200">Purchased Rewards:</span>
                <Chip color="secondary" variant="flat">{userDetails.purchasedRewardsCount}</Chip>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardBody>
          <h3 className="font-semibold mb-4">Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              color="success"
              variant="flat"
              startContent={<Coins size={16} />}
              onPress={onBalanceModalOpen}
            >
              Set Balance
            </Button>
            <Button
              color="warning"
              variant="flat"
              startContent={<Zap size={16} />}
              onPress={onEnergyModalOpen}
            >
              Set Energy
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Case Open History */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Case Open History</h3>
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
                  <div className="text-sm text-gray-200">Total Opened</div>
                  <div className="text-xl font-bold">{caseOpenHistory.totalOpened}</div>
                </div>
                <div className="text-center p-3 bg-zinc-800 rounded">
                  <div className="text-sm text-gray-200">Rewards</div>
                  <div className="text-xl font-bold">{caseOpenHistory.byDropType.reward}</div>
                </div>
                <div className="text-center p-3 bg-zinc-800 rounded">
                  <div className="text-sm text-gray-200">Gems / Energy</div>
                  <div className="text-xl font-bold">
                    {caseOpenHistory.byDropType.gems} / {caseOpenHistory.byDropType.energy}
                  </div>
                </div>
              </div>

              {caseOpenHistoryByCaseLabel ? (
                <div className="text-xs text-gray-400">{caseOpenHistoryByCaseLabel}</div>
              ) : null}

              {caseOpenHistory.opens?.length ? (
                <Table aria-label="Case open history table">
                  <TableHeader>
                    <TableColumn>OPENED AT</TableColumn>
                    <TableColumn>CASE</TableColumn>
                    <TableColumn>DROP</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {caseOpenHistory.opens.map((row) => {
                      const type = row.result?.type;
                      const drop =
                        type === 'reward'
                          ? row.result?.reward?.name || (row.result?.reward?.id ? `Reward #${row.result.reward.id}` : 'Reward')
                          : type === 'gems'
                            ? `+${row.result?.amount ?? '?'} Gems`
                            : type === 'energy'
                              ? `+${row.result?.amount ?? '?'} Energy`
                              : 'Unknown';

                      return (
                        <TableRow key={row.userCaseId}>
                          <TableCell>
                            <div className="text-xs text-gray-500">{formatDate(row.openedAt)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{row.case?.name || 'Unknown case'}</div>
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
                <div className="text-center py-8 text-gray-400">No opened cases found.</div>
              )}
            </>
          ) : null}
        </CardBody>
      </Card>

      {/* Purchased Rewards */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Purchased Rewards</h3>
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
              <Table aria-label="Purchased rewards table">
                <TableHeader>
                  <TableColumn>REWARD</TableColumn>
                  <TableColumn>PRICE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>PURCHASED</TableColumn>
                </TableHeader>
                <TableBody>
                  {purchasedRewards.map((pr) => {
                    const media = pr.reward?.mediaFile;
                    const withdrawalStatus = getWithdrawalStatus(pr);

                    const statusChip = (() => {
                      if (!withdrawalStatus) {
                        return (
                          <Chip size="sm" variant="flat">
                            Owned
                          </Chip>
                        );
                      }
                      if (withdrawalStatus === 'pending') {
                        return (
                          <Chip size="sm" variant="flat" color="warning">
                            Withdrawal: Pending
                          </Chip>
                        );
                      }
                      if (withdrawalStatus === 'completed') {
                        return (
                          <Chip size="sm" variant="flat" color="success">
                            Withdrawal: Completed
                          </Chip>
                        );
                      }
                      return (
                        <Chip size="sm" variant="flat" color="danger">
                          Withdrawal: Rejected
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
                            alt={pr.reward?.name || 'Reward'}
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
                              <p className="font-medium">{pr.reward?.name || `Reward #${pr.rewardId}`}</p>
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-400">No purchased rewards found.</div>
            )
          ) : null}
        </CardBody>
      </Card>

      {/* Chat History */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Chat History</h3>
            <div className="flex gap-2">
              <Select
                label="History"
                placeholder="Select history"
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
                Load History
              </Button>
              {chatHistory && (
                <Button
                  color="danger"
                  variant="flat"
                  startContent={<RotateCcw size={16} />}
                  onPress={handleResetHistory}
                  isLoading={loading}
                >
                  Reset History
                </Button>
              )}
            </div>
          </div>

          {chatHistory && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-zinc-800  rounded">
                  <div className="text-sm text-gray-200">Total Messages</div>
                  <div className="text-xl font-bold">{chatHistory.totalMessages}</div>
                </div>
                <div className="text-center p-3 bg-zinc-800 rounded">
                  <div className="text-sm text-gray-200">User Messages</div>
                  <div className="text-xl font-bold">{chatHistory.userMessageCount}</div>
                </div>
                <div className="text-center p-3 bg-zinc-800 rounded">
                  <div className="text-sm text-gray-200">AI Messages</div>
                  <div className="text-xl font-bold">{chatHistory.assistantMessageCount}</div>
                </div>
              </div>

              {chatHistory.history.length > 0 ? (
                <Table aria-label="Chat history table">
                  <TableHeader>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>USER MESSAGE</TableColumn>
                    <TableColumn>ASSISTANT RESPONSE</TableColumn>
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
                              <span className="text-xs text-gray-400 italic">No response</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No chat history found for this history.
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Modals */}
      <Modal isOpen={isBalanceModalOpen} onClose={onBalanceModalClose}>
        <ModalContent>
          <ModalHeader>Set Balance</ModalHeader>
          <ModalBody>
            <Input
              label="New balance"
              type="number"
              placeholder="Enter value (>= 0)"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onBalanceModalClose}>Cancel</Button>
            <Button color="success" onPress={handleSetBalance} isLoading={loading}>
              Set
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEnergyModalOpen} onClose={onEnergyModalClose}>
        <ModalContent>
          <ModalHeader>Set Energy</ModalHeader>
          <ModalBody>
            <Input
              label="New energy"
              type="number"
              placeholder="Enter value (>= 0)"
              value={energyAmount}
              onChange={(e) => setEnergyAmount(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onEnergyModalClose}>Cancel</Button>
            <Button color="warning" onPress={handleSetEnergy} isLoading={loading}>
              Set
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalContent>
          <ModalHeader>Delete User</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this user? This action cannot be undone and will delete all user data including chat history.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteModalClose}>Cancel</Button>
            <Button color="danger" onPress={handleDeleteUser} isLoading={loading}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

export default UserDetailsPage;

