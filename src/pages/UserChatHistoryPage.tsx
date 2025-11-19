import { useEffect, useState, useContext } from 'react';
import { useDisclosure } from '@heroui/react';
import { MessageSquare, RotateCcw, Search } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { PageHeader, SearchBar } from '@/components/ui';
import { 
  resetUserHistory, 
  getUserChatHistory, 
  type UserChatHistoryResponse 
} from '@/http/adminAPI';
import { getAllAgents, type Agent } from '@/http/agentAPI';
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Button,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure as useModalDisclosure,
  Card,
  CardBody
} from '@heroui/react';

const UserChatHistoryPage = observer(() => {
  const [userId, setUserId] = useState<string>('');
  const [selectedHistoryName, setSelectedHistoryName] = useState<string>('');
  const [histories, setHistories] = useState<Agent[]>([]);
  const [chatHistory, setChatHistory] = useState<UserChatHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useModalDisclosure();

  useEffect(() => {
    loadHistories();
  }, []);

  const loadHistories = async () => {
    try {
      const agents = await getAllAgents();
      setHistories(agents);
      if (agents.length > 0 && !selectedHistoryName) {
        setSelectedHistoryName(agents[0].historyName);
      }
    } catch (err) {
      console.error('Failed to load histories:', err);
      setError('Failed to load histories');
    }
  };

  const handleLoadHistory = async () => {
    if (!userId || !selectedHistoryName) {
      setError('Please enter user ID and select history');
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
      setError('Please enter user ID and select history');
      return;
    }

    if (!window.confirm(`Are you sure you want to reset chat history for user ${userId} in history "${selectedHistoryName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await resetUserHistory(parseInt(userId), selectedHistoryName);
      alert('History reset successfully!');
      // Перезагружаем историю если она была загружена
      if (chatHistory) {
        await handleLoadHistory();
      }
    } catch (err: any) {
      console.error('Failed to reset history:', err);
      setError(err.response?.data?.message || 'Failed to reset history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="User Chat History"
        description="View and manage user chat history by history name"
      />

      {/* Search and Filter Section */}
      <Card>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="User ID"
              placeholder="Enter user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              type="number"
              startContent={<Search className="w-4 h-4 text-gray-400" />}
            />
            
            <Select
              label="History"
              placeholder="Select history"
              selectedKeys={selectedHistoryName ? [selectedHistoryName] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedHistoryName(selected || '');
              }}
            >
              {histories.map((agent) => (
                <SelectItem key={agent.historyName} value={agent.historyName}>
                  {agent.historyName} {agent.description && `- ${agent.description}`}
                </SelectItem>
              ))}
            </Select>

            <div className="flex items-end gap-2">
              <Button
                color="primary"
                onPress={handleLoadHistory}
                isLoading={loadingHistory}
                isDisabled={!userId || !selectedHistoryName}
                className="flex-1"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Load History
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Statistics */}
      {chatHistory && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody>
              <div className="text-sm text-gray-500">Total Messages</div>
              <div className="text-2xl font-bold">{chatHistory.totalMessages}</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-sm text-gray-500">User Messages</div>
              <div className="text-2xl font-bold">{chatHistory.userMessageCount}</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-sm text-gray-500">Assistant Messages</div>
              <div className="text-2xl font-bold">{chatHistory.assistantMessageCount}</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Button
                color="danger"
                variant="flat"
                onPress={handleResetHistory}
                isLoading={loading}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset History
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Chat History Table */}
      {chatHistory && chatHistory.history.length > 0 && (
        <Card>
          <CardBody>
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
          </CardBody>
        </Card>
      )}

      {chatHistory && chatHistory.history.length === 0 && (
        <Card>
          <CardBody>
            <div className="text-center py-8 text-gray-400">
              No chat history found for this user and history.
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
});

export default UserChatHistoryPage;

