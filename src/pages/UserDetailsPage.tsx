import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { PageHeader } from '@/components/ui';
import { 
  getUserDetails,
  getUserChatHistory,
  resetUserHistory,
  updateUserBalance,
  updateUserEnergy,
  deleteUser,
  type UserDetailsResponse,
  type UserChatHistoryResponse
} from '@/http/adminAPI';
import { getAllAgents, type Agent } from '@/http/agentAPI';
import { USERS_ROUTE } from '@/utils/consts';
import { formatDate } from '@/utils/formatters';
import {
  Card,
  CardBody,
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
  Coins
} from 'lucide-react';

const UserDetailsPage = observer(() => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<UserDetailsResponse | null>(null);
  const [chatHistory, setChatHistory] = useState<UserChatHistoryResponse | null>(null);
  const [histories, setHistories] = useState<Agent[]>([]);
  const [selectedHistoryName, setSelectedHistoryName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Модалки для действий
  const { isOpen: isBalanceModalOpen, onOpen: onBalanceModalOpen, onClose: onBalanceModalClose } = useDisclosure();
  const { isOpen: isEnergyModalOpen, onOpen: onEnergyModalOpen, onClose: onEnergyModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  
  const [balanceAmount, setBalanceAmount] = useState<string>('');
  const [energyAmount, setEnergyAmount] = useState<string>('');

  useEffect(() => {
    if (userId) {
      loadUserDetails();
      loadHistories();
    }
  }, [userId]);

  const loadUserDetails = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const details = await getUserDetails(userId);
      setUserDetails(details);
      if (details.user.selectedHistoryName) {
        setSelectedHistoryName(details.user.selectedHistoryName);
      }
    } catch (err: any) {
      console.error('Failed to load user details:', err);
      setError(err.response?.data?.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err: any) {
      console.error('Failed to load chat history:', err);
      setError(err.response?.data?.message || 'Failed to load chat history');
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
    } catch (err: any) {
      console.error('Failed to reset history:', err);
      setError(err.response?.data?.message || 'Failed to reset history');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = async () => {
    if (!userId || !balanceAmount) return;
    const amount = parseInt(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid positive number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateUserBalance(parseInt(userId), amount);
      alert(`Balance updated successfully!`);
      onBalanceModalClose();
      setBalanceAmount('');
      await loadUserDetails();
    } catch (err: any) {
      console.error('Failed to update balance:', err);
      setError(err.response?.data?.message || 'Failed to update balance');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEnergy = async () => {
    if (!userId || !energyAmount) return;
    const amount = parseInt(energyAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid positive number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateUserEnergy(parseInt(userId), amount);
      alert(`Energy updated successfully!`);
      onEnergyModalClose();
      setEnergyAmount('');
      await loadUserDetails();
    } catch (err: any) {
      console.error('Failed to update energy:', err);
      setError(err.response?.data?.message || 'Failed to update energy');
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
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
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
              Add Balance
            </Button>
            <Button
              color="warning"
              variant="flat"
              startContent={<Zap size={16} />}
              onPress={onEnergyModalOpen}
            >
              Add Energy
            </Button>
          </div>
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
          <ModalHeader>Add Balance</ModalHeader>
          <ModalBody>
            <Input
              label="Amount"
              type="number"
              placeholder="Enter amount"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onBalanceModalClose}>Cancel</Button>
            <Button color="success" onPress={handleAddBalance} isLoading={loading}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEnergyModalOpen} onClose={onEnergyModalClose}>
        <ModalContent>
          <ModalHeader>Add Energy</ModalHeader>
          <ModalBody>
            <Input
              label="Amount"
              type="number"
              placeholder="Enter amount"
              value={energyAmount}
              onChange={(e) => setEnergyAmount(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onEnergyModalClose}>Cancel</Button>
            <Button color="warning" onPress={handleAddEnergy} isLoading={loading}>
              Add
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

