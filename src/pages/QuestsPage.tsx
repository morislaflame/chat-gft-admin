import { useEffect, useState, useContext } from 'react';
import { useDisclosure } from '@heroui/react';
import { Plus } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { PageHeader } from '@/components/ui';
import { TasksTable, MyTasksList, TaskFormModal } from '@/components/QuestsPageComponents';

interface Task {
  id: number;
  type: string;
  description: string;
  reward: number;
  rewardType: string;
  targetCount: number;
  code?: string;
  metadata?: Record<string, unknown>;
}

interface TaskFormData {
  type: string;
  reward: string;
  rewardType: string;
  description: string;
  targetCount: string;
  code: string;
  metadata: string;
  // Поля для метадаты TELEGRAM_SUB
  channelUsername?: string;
  // Поля для метадаты STORY_SHARE
  mediaUrl?: string;
  shareText?: string;
  widgetName?: string;
  widgetUrl?: string;
}

const QuestsPage = observer(() => {
  const { quest } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    type: 'DAILY',
    reward: '',
    rewardType: 'energy',
    description: '',
    targetCount: '1',
    code: '',
    metadata: ''
  });

  useEffect(() => {
    quest.fetchTasks();
    quest.fetchMyTasks();
  }, [quest]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsEditing(false);
    setFormData({
      type: 'DAILY',
      reward: '',
      rewardType: 'energy',
      description: '',
      targetCount: '1',
      code: '',
      metadata: '',
      channelUsername: undefined,
      mediaUrl: undefined,
      shareText: undefined,
      widgetName: undefined,
      widgetUrl: undefined
    });
    onOpen();
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditing(true);
    const metadata = task.metadata ? JSON.stringify(task.metadata) : '';
    const formData: TaskFormData = {
      type: task.type,
      reward: task.reward.toString(),
      rewardType: task.rewardType,
      description: task.description,
      targetCount: task.targetCount.toString(),
      code: task.code || '',
      metadata: metadata,
      channelUsername: undefined,
      mediaUrl: undefined,
      shareText: undefined,
      widgetName: undefined,
      widgetUrl: undefined
    };
    
    // Инициализируем поля метадаты из парсера
    if (task.metadata) {
      if (task.code === 'TELEGRAM_SUB' || task.code === 'CHAT_BOOST') {
        const channelUsername = task.metadata.channelUsername;
        formData.channelUsername = typeof channelUsername === 'string' ? channelUsername : '';
      }
      if (task.code === 'STORY_SHARE') {
        const mediaUrl = task.metadata.mediaUrl;
        const shareText = task.metadata.shareText;
        const widgetName = task.metadata.widgetName;
        const widgetUrl = task.metadata.widgetUrl;
        formData.mediaUrl = typeof mediaUrl === 'string' ? mediaUrl : '';
        formData.shareText = typeof shareText === 'string' ? shareText : '';
        formData.widgetName = typeof widgetName === 'string' ? widgetName : '';
        formData.widgetUrl = typeof widgetUrl === 'string' ? widgetUrl : '';
      }
    }
    
    setFormData(formData);
    onOpen();
  };

  const handleSaveTask = async () => {
    try {
      let metadataObj: Record<string, string | number> = {};
      
      // Если есть код, формируем метадату из полей формы
      if (formData.code) {
        if (formData.code === 'TELEGRAM_SUB') {
          metadataObj = {
            channelUsername: formData.channelUsername || ''
          };
        } else if (formData.code === 'STORY_SHARE') {
          metadataObj = {
            mediaUrl: formData.mediaUrl || '',
            shareText: formData.shareText || '',
            widgetName: formData.widgetName || '',
            widgetUrl: formData.widgetUrl || ''
          };
        } else if (formData.code === 'CHAT_BOOST') {
          metadataObj = {
            channelUsername: formData.channelUsername || ''
          };
        }
      } else if (formData.metadata) {
        // Если код не выбран, пытаемся парсить метадату из JSON
        try {
          const parsed = JSON.parse(formData.metadata);
          metadataObj = typeof parsed === 'object' && parsed !== null ? parsed as Record<string, string | number> : {};
        } catch {
          metadataObj = {};
        }
      }
      
      const taskData = {
        ...formData,
        reward: parseInt(formData.reward),
        targetCount: parseInt(formData.targetCount),
        metadata: Object.keys(metadataObj).length > 0 ? metadataObj : undefined
      };

      if (isEditing && selectedTask) {
        await quest.updateTask(selectedTask.id, taskData);
      } else {
        await quest.createTask(taskData);
      }
      
      onClose();
      quest.fetchTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await quest.deleteTask(id);
        quest.fetchTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };


  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Quests"
        description="Manage quests and tasks"
        actionButton={{
          label: "Create Task",
          icon: Plus,
          onClick: handleCreateTask
        }}
      />

      <TasksTable
        tasks={quest.tasks}
        loading={quest.loading}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />

      <MyTasksList myTasks={quest.myTasks} />

      <TaskFormModal
        isOpen={isOpen}
        onClose={onClose}
        isEditing={isEditing}
        formData={formData}
        onFormDataChange={setFormData}
        onSave={handleSaveTask}
      />
    </div>
  );
});

export default QuestsPage;
