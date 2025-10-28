import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { MessageSquare } from 'lucide-react';
import { formatTime } from '@/utils/formatters';

interface Message {
  id: number;
  messageText: string;
  responseText: string;
  createdAt: string;
  isCongratulation: boolean;
}

interface MessageHistoryProps {
  messages: Message[];
  loading: boolean;
}

export const MessageHistory = ({ messages, loading }: MessageHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Message History</h3>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                <div className="flex items-end justify-end flex-col gap-1">
                  <div className="">
                    <div className="bg-zinc-700 px-5 py-3 rounded-3xl">
                      <p className="text-lg">{msg.messageText}</p>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-xs text-gray-500">
                      {formatTime(msg.createdAt)}
                    </p>
                    {msg.isCongratulation && (
                      <Chip color="success" size="sm" className="mt-1">
                        Gift
                      </Chip>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="bg-blue-100 px-5 py-3 rounded-3xl max-w-2xl">
                    <p className="text-sm text-gray-600">Bot:</p>
                    <p className="text-gray-900">{msg.responseText}</p>
                  </div>
                </div>
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
  );
};
