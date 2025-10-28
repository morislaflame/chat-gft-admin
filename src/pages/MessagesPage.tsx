import { useEffect, useState, useContext } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button,
  Textarea,
  Chip,
  Divider
} from '@heroui/react';
import { Send, MessageSquare, TrendingUp, Gift } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';

const MessagesPage = observer(() => {
  const { message } = useContext(Context) as IStoreContext;
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    message.fetchMessageHistory();
    message.fetchMessageStats();
  }, [message]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await message.sendMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">View message history and send messages</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">
                  {message.stats?.messageCount || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Until Next Gift</p>
                <p className="text-2xl font-bold text-gray-900">
                  {message.stats?.messagesUntilCongratulation || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {message.forceProgress ? Math.round(message.forceProgress.currentProgress) : 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Send Message */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Send Message</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              minRows={3}
              maxRows={6}
            />
            <div className="flex justify-end">
              <Button
                color="primary"
                startContent={<Send size={16} />}
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || message.loading}
                isLoading={message.loading}
              >
                Send Message
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Message History */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Message History</h3>
        </CardHeader>
        <CardBody>
          {message.loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : message.history.length > 0 ? (
            <div className="space-y-4">
              {message.history.map((msg, index) => (
                <div key={msg.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">User:</p>
                        <p className="text-gray-900">{msg.messageText}</p>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-xs text-gray-500">
                        {formatDate(msg.createdAt)}
                      </p>
                      {msg.isCongratulation && (
                        <Chip color="success" size="sm" className="mt-1">
                          Gift
                        </Chip>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-blue-100 p-3 rounded-lg max-w-2xl">
                      <p className="text-sm text-gray-600 mb-1">Bot:</p>
                      <p className="text-gray-900">{msg.responseText}</p>
                    </div>
                  </div>
                  
                  {index < message.history.length - 1 && <Divider />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No messages yet</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
});

export default MessagesPage;
