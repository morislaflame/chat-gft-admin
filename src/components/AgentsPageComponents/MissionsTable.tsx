import { 
  Button
} from '@heroui/react';
import { Edit, Trash2, Target } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { formatDate } from '@/utils/formatters';
import { type Mission } from '@/http/agentAPI';

interface MissionsTableProps {
  missions: Mission[];
  loading: boolean;
  onEditMission: (mission: Mission) => void;
  onDeleteMission: (missionId: number) => void;
}

export const MissionsTable = ({ 
  missions, 
  loading, 
  onEditMission, 
  onDeleteMission
}: MissionsTableProps) => {
  const columns = [
    { key: 'order', label: 'ORDER' },
    { key: 'title', label: 'TITLE' },
    { key: 'description', label: 'DESCRIPTION' },
    { key: 'created', label: 'CREATED' },
    { key: 'actions', label: 'ACTIONS' },
  ];

  const renderCell = (mission: Mission, columnKey: string) => {
    switch (columnKey) {
      case 'order':
        return (
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">#{mission.orderIndex}</p>
              <p className="text-sm text-gray-500">ID: {mission.id}</p>
            </div>
          </div>
        );
      case 'title':
        return (
          <div>
            <p className="font-semibold">{mission.title}</p>
          </div>
        );
      case 'description':
        return (
          <div className="max-w-md">
            <p className="text-sm text-gray-700 line-clamp-2">
              {mission.description || '-'}
            </p>
          </div>
        );
      case 'created':
        return (
          <span className="text-sm text-gray-600">
            {formatDate(mission.createdAt)}
          </span>
        );
      case 'actions':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Edit size={14} />}
              onClick={() => onEditMission(mission)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={<Trash2 size={14} />}
              onClick={() => onDeleteMission(mission.id)}
            >
              Delete
            </Button>
          </div>
        );
      default:
        return '-';
    }
  };

  return (
    <DataTable
      title={`Missions (${missions.length})`}
      columns={columns}
      data={missions}
      loading={loading}
      renderCell={renderCell}
      emptyMessage="No missions found"
    />
  );
};

