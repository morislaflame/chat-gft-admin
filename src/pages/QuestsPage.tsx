import { useEffect, useState, useContext } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem
} from '@heroui/react';
import { Plus, Edit, Trash2, Target, CheckCircle, Clock } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';

const QuestsPage = observer(() => {
  const { quest } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState<any>(null);
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
  }, []);

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

  const handleEditTask = (task: any) => {
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

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'DAILY': return 'success';
      case 'ONE_TIME': return 'primary';
      case 'SPECIAL': return 'warning';
      default: return 'default';
    }
  };

  const getRewardTypeColor = (type: string) => {
    return type === 'energy' ? 'secondary' : 'primary';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quests</h1>
          <p className="text-gray-600">Manage quests and tasks</p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={16} />}
          onClick={handleCreateTask}
        >
          Create Task
        </Button>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">All Tasks ({quest.tasks.length})</h3>
        </CardHeader>
        <CardBody>
          {quest.loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table aria-label="Tasks table">
              <TableHeader>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>DESCRIPTION</TableColumn>
                <TableColumn>REWARD</TableColumn>
                <TableColumn>TARGET</TableColumn>
                <TableColumn>CODE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {quest.tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Chip color={getTaskTypeColor(task.type)} variant="flat">
                        {task.type}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{task.description}</p>
                        {task.metadata && (
                          <p className="text-sm text-gray-500">
                            {JSON.stringify(task.metadata)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Chip color={getRewardTypeColor(task.rewardType)} size="sm">
                          {task.rewardType}
                        </Chip>
                        <span className="font-semibold">{task.reward}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{task.targetCount}</span>
                    </TableCell>
                    <TableCell>
                      {task.code ? (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {task.code}
                        </code>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          startContent={<Edit size={14} />}
                          onClick={() => handleEditTask(task)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          startContent={<Trash2 size={14} />}
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* My Tasks */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">My Tasks ({quest.myTasks.length})</h3>
        </CardHeader>
        <CardBody>
          {quest.myTasks.length > 0 ? (
            <div className="space-y-4">
              {quest.myTasks.map((userTask) => (
                <div key={userTask.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      userTask.completed ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {userTask.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{userTask.task?.description}</p>
                      <p className="text-sm text-gray-500">
                        Progress: {userTask.progress}/{userTask.task?.targetCount}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Chip 
                      color={userTask.completed ? 'success' : 'primary'} 
                      variant="flat"
                    >
                      {userTask.completed ? 'Completed' : 'In Progress'}
                    </Chip>
                    {userTask.completedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(userTask.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tasks assigned</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create/Edit Task Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-semibold">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Task Type"
                  selectedKeys={[formData.type]}
                  onSelectionChange={(keys) => setFormData({...formData, type: Array.from(keys)[0] as string})}
                >
                  <SelectItem key="DAILY">Daily</SelectItem>
                  <SelectItem key="ONE_TIME">One Time</SelectItem>
                  <SelectItem key="SPECIAL">Special</SelectItem>
                </Select>

                <Select
                  label="Reward Type"
                  selectedKeys={[formData.rewardType]}
                  onSelectionChange={(keys) => setFormData({...formData, rewardType: Array.from(keys)[0] as string})}
                >
                  <SelectItem key="energy">Energy</SelectItem>
                  <SelectItem key="tokens">Tokens</SelectItem>
                </Select>
              </div>

              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter task description"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Reward Amount"
                  type="number"
                  value={formData.reward}
                  onChange={(e) => setFormData({...formData, reward: e.target.value})}
                  placeholder="Enter reward amount"
                />

                <Input
                  label="Target Count"
                  type="number"
                  value={formData.targetCount}
                  onChange={(e) => setFormData({...formData, targetCount: e.target.value})}
                  placeholder="Enter target count"
                />
              </div>

              <Input
                label="Code (optional)"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="Enter task code"
              />

              <Input
                label="Metadata (JSON, optional)"
                value={formData.metadata}
                onChange={(e) => setFormData({...formData, metadata: e.target.value})}
                placeholder='{"key": "value"}'
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSaveTask}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

export default QuestsPage;
