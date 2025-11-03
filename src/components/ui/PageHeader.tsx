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
  secondaryActionButton?: {
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
  secondaryActionButton,
  className = ""
}: PageHeaderProps) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {description && <p className="text-gray-300">{description}</p>}
      </div>
      <div className="flex gap-2">
        {secondaryActionButton && (
          <Button
            color={secondaryActionButton.color || 'warning'}
            variant={secondaryActionButton.variant || 'flat'}
            startContent={secondaryActionButton.icon && <secondaryActionButton.icon size={16} />}
            onClick={secondaryActionButton.onClick}
          >
            {secondaryActionButton.label}
          </Button>
        )}
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
    </div>
  );
};
