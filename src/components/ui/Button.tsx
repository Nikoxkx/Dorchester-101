'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--blue)] text-white border-[var(--blue)] hover:bg-[var(--blue-dark)] hover:border-[var(--blue-dark)]',
  secondary:
    'bg-transparent text-[var(--charcoal)] border border-[var(--charcoal)] hover:bg-[var(--charcoal)] hover:text-[var(--paper)]',
  ghost: 'bg-transparent text-[var(--ink)] hover:bg-[var(--wax)]',
  danger: 'bg-[var(--red)] text-white border-[var(--red)] hover:bg-[var(--red-dark)] hover:border-[var(--red-dark)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[12px]',
  md: 'px-4.5 py-2 text-[13.5px]',
  lg: 'px-6 py-2.5 text-[15px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    type = 'button',
    onClick,
  }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 border',
          'rounded-[2px] font-display font-semibold uppercase tracking-[0.06em] leading-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-150 active:translate-y-px',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        disabled={disabled || isLoading}
        onClick={onClick}
      >
        {isLoading ? (
          <span className="inline-block w-3 h-3 border-[1.5px] border-current border-t-transparent rounded-full animate-spin" />
        ) : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';
