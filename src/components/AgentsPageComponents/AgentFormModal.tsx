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
  orderIndex: string;
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
  onDeleteVideo?: (agentId: number) => Promise<void>;
  onDeleteAvatar?: (agentId: number) => Promise<void>;
  onDeletePreview?: (agentId: number) => Promise<void>;
  onDeleteBackground?: (agentId: number) => Promise<void>;
  missions?: Mission[];
  missionsLoading?: boolean;
  onCreateMission?: (agentId: number, missionData: { title: string; description?: string | null; orderIndex: number }) => Promise<void>;
  onUpdateMission?: (agentId: number, missionId: number, missionData: { title?: string; description?: string | null; orderIndex?: number }) => Promise<void>;
  onDeleteMission?: (agentId: number, missionId: number) => Promise<void>;
  onUploadMissionVideo?: (agentId: number, missionId: number, videoFile: File) => Promise<void>;
  onDeleteMissionVideo?: (agentId: number, missionId: number) => Promise<void>;
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
  onDeleteVideo,
  onDeleteAvatar,
  onDeletePreview,
  onDeleteBackground,
  missions = [],
  missionsLoading = false,
  onCreateMission,
  onUpdateMission,
  onDeleteMission,
  onUploadMissionVideo,
  onDeleteMissionVideo
}: AgentFormModalProps) => {
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [deletingVideo, setDeletingVideo] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [deletingPreview, setDeletingPreview] = useState(false);
  const [deletingBackground, setDeletingBackground] = useState(false);

  // Сбрасываем состояние при закрытии/открытии
  useEffect(() => {
    if (!isOpen) {
      setUploadingVideo(false);
      setUploadingAvatar(false);
      setUploadingPreview(false);
      setUploadingBackground(false);
      setDeletingVideo(false);
      setDeletingAvatar(false);
      setDeletingPreview(false);
      setDeletingBackground(false);
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

  const handleDeleteVideo = async () => {
    if (!selectedAgent || !onDeleteVideo) return;
    setDeletingVideo(true);
    try {
      await onDeleteVideo(selectedAgent.id);
    } finally {
      setDeletingVideo(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!selectedAgent || !onDeleteAvatar) return;
    setDeletingAvatar(true);
    try {
      await onDeleteAvatar(selectedAgent.id);
    } finally {
      setDeletingAvatar(false);
    }
  };

  const handleDeletePreview = async () => {
    if (!selectedAgent || !onDeletePreview) return;
    setDeletingPreview(true);
    try {
      await onDeletePreview(selectedAgent.id);
    } finally {
      setDeletingPreview(false);
    }
  };

  const handleDeleteBackground = async () => {
    if (!selectedAgent || !onDeleteBackground) return;
    setDeletingBackground(true);
    try {
      await onDeleteBackground(selectedAgent.id);
    } finally {
      setDeletingBackground(false);
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

            <Input
              label="Order Index"
              type="number"
              value={formData.orderIndex}
              onChange={(e) => handleInputChange('orderIndex', e.target.value)}
              placeholder="0"
              description="Lower numbers appear first in the list. Default: 0"
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
                    onDelete={onDeleteAvatar ? handleDeleteAvatar : undefined}
                    uploading={uploadingAvatar}
                    deleting={deletingAvatar}
                    previewClassName="inline-block"
                  />

                  <MediaUploadField
                    label="Agent Preview"
                    icon={<Image className="w-4 h-4" />}
                    accept="image/*,video/*,.json"
                    mediaType="mixed"
                    currentMedia={selectedAgent.preview}
                    onUpload={handleUploadPreview}
                    onDelete={onDeletePreview ? handleDeletePreview : undefined}
                    uploading={uploadingPreview}
                    deleting={deletingPreview}
                  />

                  <MediaUploadField
                    label="Agent Background"
                    icon={<Image className="w-4 h-4" />}
                    accept="image/*,video/*,.json"
                    mediaType="mixed"
                    currentMedia={selectedAgent.background}
                    onUpload={handleUploadBackground}
                    onDelete={onDeleteBackground ? handleDeleteBackground : undefined}
                    uploading={uploadingBackground}
                    deleting={deletingBackground}
                  />

                  <MediaUploadField
                    label="Agent Video"
                    icon={<Video className="w-4 h-4" />}
                    accept="video/*"
                    mediaType="video"
                    currentMedia={selectedAgent.video}
                    onUpload={handleUploadVideo}
                    onDelete={onDeleteVideo ? handleDeleteVideo : undefined}
                    uploading={uploadingVideo}
                    deleting={deletingVideo}
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
                onDeleteMissionVideo={onDeleteMissionVideo}
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
