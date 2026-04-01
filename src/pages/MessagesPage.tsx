import { useEffect, useState, useContext } from 'react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { MessageStats, MessageSender, MessageHistory } from '@/components/MessagesPageComponents';

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
      console.error('Не удалось отправить сообщение:', error);
    }
  };


  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Сообщения</h1>
        <p className="text-gray-300">Просмотр истории сообщений и отправка сообщений</p>
      </div>

      <MessageStats 
        stats={message.stats || undefined} 
        forceProgress={message.forceProgress} 
      />

      <MessageSender
        newMessage={newMessage}
        onMessageChange={setNewMessage}
        onSendMessage={handleSendMessage}
        loading={message.loading}
      />

      <MessageHistory 
        messages={message.history} 
        loading={message.loading} 
      />
    </div>
  );
});

export default MessagesPage;
