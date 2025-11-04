import React from 'react';
import { cn } from '@/shared/lib/utils/cn';
import Button, { type ButtonProps } from './Button';

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  ariaLabel: string;
}

export default function IconButton({
  icon,
  ariaLabel,
  className,
  ...props
}: IconButtonProps) {
  return (
    <Button
      {...props}
      className={cn('!p-2 min-w-0', className)}
      aria-label={ariaLabel}
    >
      {icon}
    </Button>
  );
}
