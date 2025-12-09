import { Button } from '@heroui/react';
import { X, Image as ImageIcon, Video } from 'lucide-react';
import { useState, useRef, useEffect, useId } from 'react';
import type { MediaFile } from '@/http/agentAPI';

export type MediaType = 'image' | 'video' | 'mixed'; // mixed = image, video, or JSON

interface MediaUploadFieldProps {
  label: string;
  icon?: React.ReactNode;
  accept: string;
  mediaType: MediaType;
  currentMedia?: MediaFile | null;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  uploading?: boolean;
  deleting?: boolean;
  previewClassName?: string;
}

export const MediaUploadField: React.FC<MediaUploadFieldProps> = ({
  label,
  icon,
  accept,
  mediaType,
  currentMedia,
  onUpload,
  onDelete,
  uploading = false,
  deleting = false,
  previewClassName = ''
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uniqueId = useId(); // Генерирует уникальный ID для каждого экземпляра компонента
  const fileId = `media-upload-${label.toLowerCase().replace(/\s+/g, '-')}-${uniqueId}`;

  // Обновляем превью при изменении currentMedia
  useEffect(() => {
    // Если нет выбранного файла, показываем текущее медиа
    if (!selectedFile) {
      if (currentMedia?.url) {
        setPreview(currentMedia.url);
      } else {
        setPreview(null);
      }
    }
  }, [currentMedia, selectedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Валидация типа файла
    if (mediaType === 'image' && !file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (mediaType === 'video' && !file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }
    if (mediaType === 'mixed') {
      const isValidType = file.type.startsWith('image/') || 
                         file.type.startsWith('video/') || 
                         file.type === 'application/json';
      if (!isValidType) {
        alert('Please select an image, video, or JSON animation file');
        return;
      }
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(currentMedia?.url || null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !currentMedia) return;
    if (window.confirm(`Are you sure you want to delete this ${label.toLowerCase()}?`)) {
      try {
        await onDelete();
      } catch (error) {
        console.error(`Failed to delete ${label.toLowerCase()}:`, error);
        alert(`Failed to delete ${label.toLowerCase()}`);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      // Превью обновится автоматически через useEffect при изменении currentMedia
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (error) {
      console.error(`Failed to upload ${label.toLowerCase()}:`, error);
      alert(`Failed to upload ${label.toLowerCase()}`);
    }
  };

  const renderPreview = () => {
    if (!preview) return null;

    const isVideo = selectedFile?.type.startsWith('video/') || currentMedia?.mimeType?.startsWith('video/');
    const isJSON = selectedFile?.type === 'application/json' || currentMedia?.mimeType === 'application/json';
    const isImage = mediaType === 'image' || (!isVideo && !isJSON);

    if (isVideo) {
      return (
        <div className={`mb-3 relative ${previewClassName}`}>
          <video 
            src={preview} 
            controls 
            className="w-full max-h-64 rounded-lg"
          />
          {selectedFile && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      );
    }

    if (isJSON) {
      return (
        <div className={`mb-3 relative ${previewClassName}`}>
          <div className="w-full max-h-64 rounded-lg bg-gray-100 dark:bg-zinc-800 p-4 flex items-center justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">JSON Animation File</p>
          </div>
          {selectedFile && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      );
    }

    if (isImage) {
      const imageClassName = mediaType === 'image' 
        ? 'w-32 h-32 object-cover rounded-lg'
        : 'w-full max-h-64 object-contain rounded-lg';
      
      return (
        <div className={`mb-3 relative ${mediaType === 'image' ? 'inline-block' : ''} ${previewClassName}`}>
          <img 
            src={preview} 
            alt={label}
            className={imageClassName}
          />
          {selectedFile && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  const defaultIcon = mediaType === 'video' ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon || defaultIcon}
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      </div>
      
      {renderPreview()}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id={fileId}
        />
        <label
          htmlFor={fileId}
          className="flex-1 cursor-pointer"
        >
          <Button
            as="span"
            variant="bordered"
            className="w-full"
            startContent={icon || defaultIcon}
          >
            {selectedFile ? `Change ${label}` : `Select ${label}`}
          </Button>
        </label>
        {selectedFile && (
          <Button
            color="primary"
            onClick={handleUpload}
            isLoading={uploading}
            disabled={uploading}
          >
            Upload
          </Button>
        )}
        {!selectedFile && currentMedia && onDelete && (
          <Button
            color="danger"
            variant="bordered"
            onClick={handleDelete}
            isLoading={deleting}
            disabled={deleting}
            startContent={<X className="w-4 h-4" />}
          >
            Delete
          </Button>
        )}
      </div>
      {selectedFile && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
        </p>
      )}
    </div>
  );
};

