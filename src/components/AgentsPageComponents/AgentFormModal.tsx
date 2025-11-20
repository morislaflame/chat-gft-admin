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
import { Bot, MessageSquare, Video, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Agent } from '@/http/agentAPI';

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
}

export const AgentFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  onFormDataChange,
  onSave,
  selectedAgent,
  onUploadVideo
}: AgentFormModalProps) => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обновляем превью при изменении selectedAgent
  useEffect(() => {
    if (selectedAgent?.video?.url) {
      setVideoPreview(selectedAgent.video.url);
    } else {
      setVideoPreview(null);
    }
    setSelectedVideo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedAgent]);

  const handleInputChange = (field: keyof AgentFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
      }
      setSelectedVideo(file);
      // Создаем превью
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
    setVideoPreview(selectedAgent?.video?.url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadVideo = async () => {
    if (!selectedVideo || !selectedAgent || !onUploadVideo) return;
    
    try {
      setUploadingVideo(true);
      await onUploadVideo(selectedAgent.id, selectedVideo);
      setSelectedVideo(null);
      setVideoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload video:', error);
      alert('Failed to upload video');
    } finally {
      setUploadingVideo(false);
    }
  };

  const promptLength = formData.systemPrompt.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
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

            {promptLength > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                  <p className="text-sm font-medium text-gray-700">Prompt Statistics</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Length:</span>
                    <span className="ml-2 font-semibold">{promptLength} chars</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Words:</span>
                    <span className="ml-2 font-semibold">{formData.systemPrompt.split(/\s+/).filter(Boolean).length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Video Upload Section - только при редактировании */}
            {isEditing && selectedAgent && (
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="w-4 h-4 text-gray-600" />
                  <p className="text-sm font-medium text-gray-700">Agent Video</p>
                </div>
                
                {videoPreview && (
                  <div className="mb-3 relative">
                    <video 
                      src={videoPreview} 
                      controls 
                      className="w-full max-h-64 rounded-lg"
                    />
                    {selectedVideo && (
                      <button
                        onClick={handleRemoveVideo}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="flex-1 cursor-pointer"
                  >
                    <Button
                      as="span"
                      variant="bordered"
                      className="w-full"
                      startContent={<Video className="w-4 h-4" />}
                    >
                      {selectedVideo ? 'Change Video' : 'Select Video'}
                    </Button>
                  </label>
                  {selectedVideo && (
                    <Button
                      color="primary"
                      onClick={handleUploadVideo}
                      isLoading={uploadingVideo}
                      disabled={uploadingVideo}
                    >
                      Upload
                    </Button>
                  )}
                </div>
                {selectedVideo && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {selectedVideo.name} ({(selectedVideo.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
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

