import React from 'react';

export interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  dot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  dot = true,
  size = 'md',
  className = '',
}) => {
  // Định nghĩa màu nền và chữ theo variant
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-red-50 text-red-700',
    info: 'bg-sky-50 text-sky-700',
    neutral: 'bg-gray-100 text-gray-600',
  };

  // Định nghĩa màu chấm (dot) theo variant
  const dotStyles = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-sky-500',
    neutral: 'bg-gray-400',
  };

  // Định nghĩa size (mặc định design là px-2.5 py-1 theo y/c, scale theo size param nếu cần)
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const baseStyles = 'inline-flex items-center rounded-full font-semibold';
  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

  return (
    <span className={classes}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotStyles[variant]}`}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
};
