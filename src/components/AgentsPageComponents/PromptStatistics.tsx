import { MessageSquare } from 'lucide-react';

interface PromptStatisticsProps {
  promptLength: number;
  wordCount: number;
}

export const PromptStatistics: React.FC<PromptStatisticsProps> = ({
  promptLength,
  wordCount
}) => {
  if (promptLength === 0) return null;

  return (
    <div className="p-3 bg-zinc-800 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Prompt Statistics</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Length:</span>
          <span className="ml-2 font-semibold text-gray-700 dark:text-gray-300">{promptLength} chars</span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Words:</span>
          <span className="ml-2 font-semibold text-gray-700 dark:text-gray-300">{wordCount}</span>
        </div>
      </div>
    </div>
  );
};

