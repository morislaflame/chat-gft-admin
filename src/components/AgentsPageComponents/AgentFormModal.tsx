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
import { Bot, MessageSquare, Video, Image, X } from 'lucide-react';
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
  onUploadAvatar?: (agentId: number, avatarFile: File) => Promise<void>;
  onUploadPreview?: (agentId: number, previewFile: File) => Promise<void>;
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
  onUploadPreview
}: AgentFormModalProps) => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<File | null>(null);
  const [previewPreview, setPreviewPreview] = useState<string | null>(null);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);

  // Обновляем превью при изменении selectedAgent
  useEffect(() => {
    if (selectedAgent?.video?.url) {
      setVideoPreview(selectedAgent.video.url);
    } else {
      setVideoPreview(null);
    }
    if (selectedAgent?.avatar?.url) {
      setAvatarPreview(selectedAgent.avatar.url);
    } else {
      setAvatarPreview(null);
    }
    if (selectedAgent?.preview?.url) {
      setPreviewPreview(selectedAgent.preview.url);
    } else {
      setPreviewPreview(null);
    }
    setSelectedVideo(null);
    setSelectedAvatar(null);
    setSelectedPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
    if (previewInputRef.current) {
      previewInputRef.current.value = '';
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

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setSelectedAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedAvatar(null);
    setAvatarPreview(selectedAgent?.avatar?.url || null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedAvatar || !selectedAgent || !onUploadAvatar) return;
    
    try {
      setUploadingAvatar(true);
      await onUploadAvatar(selectedAgent.id, selectedAvatar);
      setSelectedAvatar(null);
      setAvatarPreview(null);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePreviewSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Превью может быть изображением, видео или JSON анимацией
      const isValidType = file.type.startsWith('image/') || 
                         file.type.startsWith('video/') || 
                         file.type === 'application/json';
      if (!isValidType) {
        alert('Please select an image, video, or JSON animation file');
        return;
      }
      setSelectedPreview(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePreview = () => {
    setSelectedPreview(null);
    setPreviewPreview(selectedAgent?.preview?.url || null);
    if (previewInputRef.current) {
      previewInputRef.current.value = '';
    }
  };

  const handleUploadPreview = async () => {
    if (!selectedPreview || !selectedAgent || !onUploadPreview) return;
    
    try {
      setUploadingPreview(true);
      await onUploadPreview(selectedAgent.id, selectedPreview);
      setSelectedPreview(null);
      setPreviewPreview(null);
      if (previewInputRef.current) {
        previewInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload preview:', error);
      alert('Failed to upload preview');
    } finally {
      setUploadingPreview(false);
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

            {/* Media Upload Sections - только при редактировании */}
            {isEditing && selectedAgent && (
              <div className="border-t pt-4 mt-4 space-y-6">
                {/* Avatar Upload Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Image className="w-4 h-4 text-gray-600" />
                    <p className="text-sm font-medium text-gray-700">Agent Avatar</p>
                  </div>
                  
                  {avatarPreview && (
                    <div className="mb-3 relative inline-block">
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      {selectedAvatar && (
                        <button
                          onClick={handleRemoveAvatar}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex-1 cursor-pointer"
                    >
                      <Button
                        as="span"
                        variant="bordered"
                        className="w-full"
                        startContent={<Image className="w-4 h-4" />}
                      >
                        {selectedAvatar ? 'Change Avatar' : 'Select Avatar'}
                      </Button>
                    </label>
                    {selectedAvatar && (
                      <Button
                        color="primary"
                        onClick={handleUploadAvatar}
                        isLoading={uploadingAvatar}
                        disabled={uploadingAvatar}
                      >
                        Upload
                      </Button>
                    )}
                  </div>
                  {selectedAvatar && (
                    <p className="text-xs text-gray-500 mt-2">
                      Selected: {selectedAvatar.name} ({(selectedAvatar.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {/* Preview Upload Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Image className="w-4 h-4 text-gray-600" />
                    <p className="text-sm font-medium text-gray-700">Agent Preview</p>
                  </div>
                  
                  {previewPreview && (
                    <div className="mb-3 relative">
                      {selectedPreview?.type.startsWith('video/') || selectedAgent?.preview?.mimeType?.startsWith('video/') ? (
                        <video 
                          src={previewPreview} 
                          controls 
                          className="w-full max-h-64 rounded-lg"
                        />
                      ) : selectedPreview?.type === 'application/json' || selectedAgent?.preview?.mimeType === 'application/json' ? (
                        <div className="w-full max-h-64 rounded-lg bg-gray-100 p-4 flex items-center justify-center">
                          <p className="text-sm text-gray-600">JSON Animation File</p>
                        </div>
                      ) : (
                        <img 
                          src={previewPreview} 
                          alt="Preview"
                          className="w-full max-h-64 object-contain rounded-lg"
                        />
                      )}
                      {selectedPreview && (
                        <button
                          onClick={handleRemovePreview}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      ref={previewInputRef}
                      type="file"
                      accept="image/*,video/*,.json"
                      onChange={handlePreviewSelect}
                      className="hidden"
                      id="preview-upload"
                    />
                    <label
                      htmlFor="preview-upload"
                      className="flex-1 cursor-pointer"
                    >
                      <Button
                        as="span"
                        variant="bordered"
                        className="w-full"
                        startContent={<Image className="w-4 h-4" />}
                      >
                        {selectedPreview ? 'Change Preview' : 'Select Preview'}
                      </Button>
                    </label>
                    {selectedPreview && (
                      <Button
                        color="primary"
                        onClick={handleUploadPreview}
                        isLoading={uploadingPreview}
                        disabled={uploadingPreview}
                      >
                        Upload
                      </Button>
                    )}
                  </div>
                  {selectedPreview && (
                    <p className="text-xs text-gray-500 mt-2">
                      Selected: {selectedPreview.name} ({(selectedPreview.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {/* Video Upload Section */}
                <div>
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

