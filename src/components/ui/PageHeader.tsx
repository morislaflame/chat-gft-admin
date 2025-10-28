import { Button } from '@heroui/react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionButton?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    variant?: 'solid' | 'flat' | 'bordered' | 'light' | 'shadow' | 'ghost';
  };
  className?: string;
}

export const PageHeader = ({ 
  title, 
  description, 
  actionButton, 
  className = "" 
}: PageHeaderProps) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {description && <p className="text-gray-300">{description}</p>}
      </div>
      {actionButton && (
        <Button
          color={actionButton.color || 'primary'}
          variant={actionButton.variant || 'solid'}
          startContent={actionButton.icon && <actionButton.icon size={16} />}
          onClick={actionButton.onClick}
        >
          {actionButton.label}
        </Button>
      )}
    </div>
  );
};
