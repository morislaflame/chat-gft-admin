import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea
} from '@heroui/react';
import { Bot, Video, Image } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Agent, Mission } from '@/http/agentAPI';
import { MediaUploadField } from './MediaUploadField';
import { AgentMissionsSection } from './AgentMissionsSection';
import { PromptStatistics } from './PromptStatistics';

interface AgentFormData {
  historyName: string;
  systemPrompt: string;
  description: string;
}

interface AgentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: AgentFormData;
  onFormDataChange: (data: AgentFormData) => void;
  onSave: () => void;
  selectedAgent?: Agent | null;
  onUploadVideo?: (agentId: number, videoFile: File) => Promise<void>;
  onUploadAvatar?: (agentId: number, avatarFile: File) => Promise<void>;
  onUploadPreview?: (agentId: number, previewFile: File) => Promise<void>;
  onUploadBackground?: (agentId: number, backgroundFile: File) => Promise<void>;
  missions?: Mission[];
  missionsLoading?: boolean;
  onCreateMission?: (agentId: number, missionData: { title: string; description?: string | null; orderIndex: number }) => Promise<void>;
  onUpdateMission?: (agentId: number, missionId: number, missionData: { title?: string; description?: string | null; orderIndex?: number }) => Promise<void>;
  onDeleteMission?: (agentId: number, missionId: number) => Promise<void>;
  onUploadMissionVideo?: (agentId: number, missionId: number, videoFile: File) => Promise<void>;
}

export const AgentFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  onFormDataChange,
  onSave,
  selectedAgent,
  onUploadVideo,
  onUploadAvatar,
  onUploadPreview,
  onUploadBackground,
  missions = [],
  missionsLoading = false,
  onCreateMission,
  onUpdateMission,
  onDeleteMission,
  onUploadMissionVideo
}: AgentFormModalProps) => {
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);

  // Сбрасываем состояние при закрытии/открытии
  useEffect(() => {
    if (!isOpen) {
      setUploadingVideo(false);
      setUploadingAvatar(false);
      setUploadingPreview(false);
      setUploadingBackground(false);
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof AgentFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const handleUploadVideo = async (file: File) => {
    if (!selectedAgent || !onUploadVideo) return;
    setUploadingVideo(true);
    try {
      await onUploadVideo(selectedAgent.id, file);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleUploadAvatar = async (file: File) => {
    if (!selectedAgent || !onUploadAvatar) return;
    setUploadingAvatar(true);
    try {
      await onUploadAvatar(selectedAgent.id, file);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUploadPreview = async (file: File) => {
    if (!selectedAgent || !onUploadPreview) return;
    setUploadingPreview(true);
    try {
      await onUploadPreview(selectedAgent.id, file);
    } finally {
      setUploadingPreview(false);
    }
  };

  const handleUploadBackground = async (file: File) => {
    if (!selectedAgent || !onUploadBackground) return;
    setUploadingBackground(true);
    try {
      await onUploadBackground(selectedAgent.id, file);
    } finally {
      setUploadingBackground(false);
    }
  };

  const handleCreateMission = async (missionData: { title: string; description?: string | null; orderIndex: number }) => {
    if (!selectedAgent || !onCreateMission) return;
    await onCreateMission(selectedAgent.id, missionData);
  };

  const handleUpdateMission = async (missionId: number, missionData: { title?: string; description?: string | null; orderIndex?: number }) => {
    if (!selectedAgent || !onUpdateMission) return;
    await onUpdateMission(selectedAgent.id, missionId, missionData);
  };

  const handleDeleteMission = async (missionId: number) => {
    if (!selectedAgent || !onDeleteMission) return;
    await onDeleteMission(selectedAgent.id, missionId);
  };

  const promptLength = formData.systemPrompt.length;
  const wordCount = formData.systemPrompt.split(/\s+/).filter(Boolean).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" scrollBehavior="inside" className='dark'>
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-semibold">
            {isEditing ? 'Edit Agent' : 'Create New Agent'}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="History Name"
              value={formData.historyName}
              onChange={(e) => handleInputChange('historyName', e.target.value)}
              placeholder="e.g., starwars, harrypotter, default"
              isRequired
              startContent={<Bot className="w-4 h-4 text-gray-400" />}
              description="Unique identifier for this agent's conversation history"
            />

            <Textarea
              label="Description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter a brief description of this story/history (shown to users when selecting)"
              minRows={2}
              maxRows={4}
              description="Brief description that will be shown to users when they select this history"
              classNames={{
                input: "resize-none",
              }}
            />

            <Textarea
              label="System Prompt"
              value={formData.systemPrompt}
              onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
              placeholder="Enter the system prompt that defines this agent's personality and behavior..."
              isRequired
              minRows={8}
              maxRows={12}
              description={`Character count: ${promptLength}`}
              classNames={{
                input: "resize-none",
              }}
            />

            <PromptStatistics promptLength={promptLength} wordCount={wordCount} />

            {/* Media Upload Sections - только при редактировании */}
            {isEditing && selectedAgent && (
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MediaUploadField
                    label="Agent Avatar"
                    icon={<Image className="w-4 h-4" />}
                    accept="image/*"
                    mediaType="image"
                    currentMedia={selectedAgent.avatar}
                    onUpload={handleUploadAvatar}
                    uploading={uploadingAvatar}
                    previewClassName="inline-block"
                  />

                  <MediaUploadField
                    label="Agent Preview"
                    icon={<Image className="w-4 h-4" />}
                    accept="image/*,video/*,.json"
                    mediaType="mixed"
                    currentMedia={selectedAgent.preview}
                    onUpload={handleUploadPreview}
                    uploading={uploadingPreview}
                  />

                  <MediaUploadField
                    label="Agent Background"
                    icon={<Image className="w-4 h-4" />}
                    accept="image/*,video/*,.json"
                    mediaType="mixed"
                    currentMedia={selectedAgent.background}
                    onUpload={handleUploadBackground}
                    uploading={uploadingBackground}
                  />

                  <MediaUploadField
                    label="Agent Video"
                    icon={<Video className="w-4 h-4" />}
                    accept="video/*"
                    mediaType="video"
                    currentMedia={selectedAgent.video}
                    onUpload={handleUploadVideo}
                    uploading={uploadingVideo}
                  />
                </div>
              </div>
            )}

            {/* Missions Section - только при редактировании */}
            {isEditing && selectedAgent && onCreateMission && onUpdateMission && onDeleteMission && (
              <AgentMissionsSection
                missions={missions}
                loading={missionsLoading}
                agentId={selectedAgent.id}
                onCreateMission={handleCreateMission}
                onUpdateMission={handleUpdateMission}
                onDeleteMission={handleDeleteMission}
                onUploadMissionVideo={onUploadMissionVideo}
              />
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button 
            color="primary" 
            onPress={onSave}
            disabled={!formData.historyName || !formData.systemPrompt}
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
