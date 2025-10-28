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

const QuestsPage = observer(() => {
  const { quest } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
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
      metadata: ''
    });
    onOpen();
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditing(true);
    setFormData({
      type: task.type,
      reward: task.reward.toString(),
      rewardType: task.rewardType,
      description: task.description,
      targetCount: task.targetCount.toString(),
      code: task.code || '',
      metadata: task.metadata ? JSON.stringify(task.metadata) : ''
    });
    onOpen();
  };

  const handleSaveTask = async () => {
    try {
      const taskData = {
        ...formData,
        reward: parseInt(formData.reward),
        targetCount: parseInt(formData.targetCount),
        metadata: formData.metadata ? JSON.parse(formData.metadata) : {}
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
