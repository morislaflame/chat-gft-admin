import { Button, Input, Textarea } from '@heroui/react';
import { Target, Edit, Trash2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Mission } from '@/http/agentAPI';
import { MediaUploadField } from './MediaUploadField';

interface AgentMissionsSectionProps {
  missions: Mission[];
  loading: boolean;
  agentId: number;
  onCreateMission: (missionData: { title: string; description?: string | null; orderIndex: number }) => Promise<void>;
  onUpdateMission: (missionId: number, missionData: { title?: string; description?: string | null; orderIndex?: number }) => Promise<void>;
  onDeleteMission: (missionId: number) => Promise<void>;
  onUploadMissionVideo?: (agentId: number, missionId: number, videoFile: File) => Promise<void>;
  onDeleteMissionVideo?: (agentId: number, missionId: number) => Promise<void>;
}

export const AgentMissionsSection: React.FC<AgentMissionsSectionProps> = ({
  missions,
  loading,
  agentId,
  onCreateMission,
  onUpdateMission,
  onDeleteMission,
  onUploadMissionVideo,
  onDeleteMissionVideo
}) => {
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [showMissionForm, setShowMissionForm] = useState(false);
  const [missionFormData, setMissionFormData] = useState({
    title: '',
    description: '',
    orderIndex: ''
  });
  const [uploadingVideo, setUploadingVideo] = useState<Record<number, boolean>>({});
  const [deletingVideo, setDeletingVideo] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Сбрасываем форму при изменении missions
    setEditingMission(null);
    setShowMissionForm(false);
    setMissionFormData({ title: '', description: '', orderIndex: '' });
  }, [missions]);

  const handleEditMission = (mission: Mission) => {
    setEditingMission(mission);
    setMissionFormData({
      title: mission.title,
      description: mission.description || '',
      orderIndex: mission.orderIndex.toString()
    });
    setShowMissionForm(true);
  };

  const handleSaveMission = async () => {
    if (!missionFormData.title || !missionFormData.orderIndex) return;
    
    try {
      const missionData = {
        title: missionFormData.title,
        description: missionFormData.description || null,
        orderIndex: parseInt(missionFormData.orderIndex)
      };

      if (editingMission) {
        await onUpdateMission(editingMission.id, missionData);
      } else {
        await onCreateMission(missionData);
      }
      
      setShowMissionForm(false);
      setEditingMission(null);
      setMissionFormData({ title: '', description: '', orderIndex: '' });
    } catch (error) {
      console.error('Failed to save mission:', error);
    }
  };

  const handleDeleteMission = async (missionId: number) => {
    if (window.confirm('Are you sure you want to delete this mission?')) {
      try {
        await onDeleteMission(missionId);
      } catch (error) {
        console.error('Failed to delete mission:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowMissionForm(false);
    setEditingMission(null);
    setMissionFormData({ title: '', description: '', orderIndex: '' });
  };

  const handleCreateNewMission = () => {
    setEditingMission(null);
    setMissionFormData({ 
      title: '', 
      description: '', 
      orderIndex: missions.length > 0 ? (Math.max(...missions.map(m => m.orderIndex)) + 1).toString() : '1'
    });
    setShowMissionForm(true);
  };

  const sortedMissions = [...missions].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="border-t pt-4 mt-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Missions</p>
        </div>
        {!showMissionForm && (
          <Button
            size="sm"
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onClick={handleCreateNewMission}
          >
            Create Mission
          </Button>
        )}
      </div>

      {showMissionForm ? (
        <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-gray-700 dark:text-gray-300">
              {editingMission ? 'Edit Mission' : 'Create New Mission'}
            </p>
            <Button
              size="sm"
              variant="light"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
          <Input
            label="Title"
            placeholder="Enter mission title"
            value={missionFormData.title}
            onChange={(e) => setMissionFormData({ ...missionFormData, title: e.target.value })}
            isRequired
          />
          <Textarea
            label="Description"
            placeholder="Enter mission description (optional)"
            value={missionFormData.description}
            onChange={(e) => setMissionFormData({ ...missionFormData, description: e.target.value })}
            minRows={2}
          />
          <Input
            label="Order Index"
            placeholder="Enter order index"
            type="number"
            value={missionFormData.orderIndex}
            onChange={(e) => setMissionFormData({ ...missionFormData, orderIndex: e.target.value })}
            isRequired
            description="The order in which this mission appears (lower numbers appear first)"
          />
          <div className="flex gap-2">
            <Button
              color="primary"
              onClick={handleSaveMission}
              disabled={!missionFormData.title || !missionFormData.orderIndex}
            >
              {editingMission ? 'Update' : 'Create'}
            </Button>
            <Button
              variant="light"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading missions...</p>
            </div>
          ) : sortedMissions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sortedMissions.map((mission) => (
                <div
                  key={mission.id}
                  className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-4 space-y-4"
                >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{mission.orderIndex}</span>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">{mission.title}</h4>
                    </div>
                    {mission.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{mission.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="light"
                      startContent={<Edit className="w-3 h-3" />}
                      onClick={() => handleEditMission(mission)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      startContent={<Trash2 className="w-3 h-3" />}
                      onClick={() => handleDeleteMission(mission.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                {onUploadMissionVideo && (
                  <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
                    <MediaUploadField
                      key={`mission-video-${mission.id}`}
                      label="Mission Video"
                      icon={<Target className="w-4 h-4" />}
                      accept="video/*"
                      mediaType="video"
                      currentMedia={mission.video || null}
                      onUpload={async (file) => {
                        setUploadingVideo(prev => ({ ...prev, [mission.id]: true }));
                        try {
                          await onUploadMissionVideo(agentId, mission.id, file);
                        } finally {
                          setUploadingVideo(prev => ({ ...prev, [mission.id]: false }));
                        }
                      }}
                      onDelete={onDeleteMissionVideo ? async () => {
                        setDeletingVideo(prev => ({ ...prev, [mission.id]: true }));
                        try {
                          await onDeleteMissionVideo(agentId, mission.id);
                        } finally {
                          setDeletingVideo(prev => ({ ...prev, [mission.id]: false }));
                        }
                      } : undefined}
                      uploading={uploadingVideo[mission.id] || false}
                      deleting={deletingVideo[mission.id] || false}
                    />
                  </div>
                )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">No missions yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

