import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { CheckCircle, Clock, Target } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface UserTask {
  id: number;
  completed: boolean;
  progress: number;
  completedAt?: string;
  task?: {
    description: string;
    targetCount: number;
  };
}

interface MyTasksListProps {
  myTasks: UserTask[];
}

export const MyTasksList = ({ myTasks }: MyTasksListProps) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">My Tasks ({myTasks.length})</h3>
      </CardHeader>
      <CardBody>
        {myTasks.length > 0 ? (
          <div className="space-y-4">
            {myTasks.map((userTask) => (
              <div key={userTask.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
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
                    <p className="text-sm text-gray-300">
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
                    <p className="text-xs text-gray-300 mt-1">
                      {formatDate(userTask.completedAt)}
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
  );
};
