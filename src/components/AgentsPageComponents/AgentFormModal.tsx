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
import { Bot, MessageSquare } from 'lucide-react';

interface AgentFormData {
  historyName: string;
  systemPrompt: string;
}

interface AgentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: AgentFormData;
  onFormDataChange: (data: AgentFormData) => void;
  onSave: () => void;
}

export const AgentFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  onFormDataChange,
  onSave
}: AgentFormModalProps) => {
  const handleInputChange = (field: keyof AgentFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
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

