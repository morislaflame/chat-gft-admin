import { Button } from '@heroui/react';
import { X, Image as ImageIcon, Video, Upload } from 'lucide-react';
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
  const [preview, setPreview] = useState<string | null>(currentMedia?.url || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uniqueId = useId();
  const fileId = `media-upload-${label.toLowerCase().replace(/\s+/g, '-')}-${uniqueId}`;

  useEffect(() => {
    if (!selectedFile) {
      setPreview(currentMedia?.url || null);
    }
  }, [currentMedia, selectedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaType === 'image' && !file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения');
      return;
    }
    if (mediaType === 'video' && !file.type.startsWith('video/')) {
      alert('Пожалуйста, выберите видеофайл');
      return;
    }
    if (mediaType === 'mixed') {
      const isValidType = file.type.startsWith('image/') || 
                         file.type.startsWith('video/') || 
                         file.type === 'application/json';
      if (!isValidType) {
        alert('Пожалуйста, выберите изображение, видео или JSON-файл анимации');
        return;
      }
    }

    setSelectedFile(file);
    if (file.type === 'application/json') {
      setPreview(null);
      return;
    }
    const nextPreview = URL.createObjectURL(file);
    setPreview(nextPreview);
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
    if (window.confirm(`Вы уверены, что хотите удалить "${label.toLowerCase()}"?`)) {
      try {
        await onDelete();
      } catch (error) {
        console.error(`Failed to delete ${label.toLowerCase()}:`, error);
        alert(`Не удалось удалить: ${label.toLowerCase()}`);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (error) {
      console.error(`Failed to upload ${label.toLowerCase()}:`, error);
      alert(`Не удалось загрузить: ${label.toLowerCase()}`);
    }
  };

  const getFormatsHint = () => {
    if (accept.includes('video') && accept.includes('image') && accept.includes('.json')) {
      return 'Разрешено: PNG, JPG, MP4, WEBM, JSON';
    }
    if (accept.includes('video')) return 'Разрешено: MP4, WEBM, MOV';
    if (accept.includes('.json')) return 'Разрешено: PNG, JPG, JSON';
    return 'Разрешено: PNG, JPG, WEBP';
  };

  const renderPreview = () => {
    const isVideo = selectedFile?.type.startsWith('video/') || currentMedia?.mimeType?.startsWith('video/');
    const isJSON = selectedFile?.type === 'application/json' || currentMedia?.mimeType === 'application/json';
    const isImage = !isVideo && !isJSON;

    if (isVideo) {
      return (
        <div className={`relative h-full w-full ${previewClassName}`}>
          <video 
            src={preview || currentMedia?.url || undefined}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        </div>
      );
    }

    if (isJSON) {
      return (
        <div className={`relative h-full w-full ${previewClassName}`}>
          <div className="w-full h-full rounded-lg bg-zinc-800 p-4 flex items-center justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">JSON-файл анимации</p>
          </div>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className={`relative h-full w-full ${previewClassName}`}>
          <img 
            src={preview || currentMedia?.url || undefined}
            alt={label}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      );
    }

    return null;
  };

  const defaultIcon = mediaType === 'video' ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        {icon || defaultIcon}
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id={fileId}
      />

      <label htmlFor={fileId} className="cursor-pointer block">
        <div className={`relative w-full h-40 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/70 flex items-center justify-center ${previewClassName}`}>
          {(preview || currentMedia?.url || currentMedia?.mimeType === 'application/json' || selectedFile?.type === 'application/json') ? (
            renderPreview()
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-200">
              <Upload className="w-6 h-6" />
              <span className="text-sm font-medium">Загрузить медиа</span>
              <span className="text-xs text-zinc-400">{getFormatsHint()}</span>
            </div>
          )}

          {currentMedia && !selectedFile && onDelete ? (
            <button
              type="button"
              className="absolute top-2 right-2 z-10 bg-black/70 hover:bg-red-600 disabled:hover:bg-black/70 text-white rounded-md p-1.5 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void handleDelete();
              }}
              disabled={deleting}
              aria-label="Удалить медиа"
              title="Удалить медиа"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}

          {(uploading || deleting) ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-sm text-white">{uploading ? 'Загрузка...' : 'Удаление...'}</span>
            </div>
          ) : null}
        </div>
      </label>

      {selectedFile ? (
        <div className="flex items-center gap-2">
          <Button
            color="primary"
            onClick={handleUpload}
            isLoading={uploading}
            disabled={uploading}
            size="sm"
          >
            Сохранить медиа
          </Button>
          <Button
            variant="flat"
            onClick={handleRemove}
            size="sm"
          >
            Отмена
          </Button>
          <span className="text-xs text-zinc-400 truncate">
            {selectedFile.name}
          </span>
        </div>
      ) : null}
    </div>
  );
};

