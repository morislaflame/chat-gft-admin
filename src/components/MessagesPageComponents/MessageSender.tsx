import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button,
  Textarea
} from '@heroui/react';
import { Send } from 'lucide-react';

interface MessageSenderProps {
  newMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  loading: boolean;
}

export const MessageSender = ({ 
  newMessage, 
  onMessageChange, 
  onSendMessage, 
  loading 
}: MessageSenderProps) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Отправка сообщения</h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <Textarea
            placeholder="Введите сообщение..."
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            minRows={3}
            maxRows={6}
          />
          <div className="flex justify-end">
            <Button
              color="primary"
              startContent={<Send size={16} />}
              onClick={onSendMessage}
              disabled={!newMessage.trim() || loading}
              isLoading={loading}
            >
              Отправить сообщение
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
