import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Định nghĩa style theo variant
  const variantStyles = {
    primary: 'bg-[#89D4FF] text-white hover:bg-[#65C1FF] shadow-[0px_4px_20px_rgba(137,212,255,0.08)]',
    secondary: 'border border-[#5BB8F5] text-[#5BB8F5] bg-transparent hover:bg-[#F4F9FF]',
    danger: 'bg-[#BA1A1A] text-white hover:bg-red-700',
    ghost: 'text-gray-500 bg-transparent hover:bg-[#F9F9FF]',
  };

  // Định nghĩa style theo size
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-md',
    md: 'px-5 py-2.5 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
  };

  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:ring-offset-1';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  // Ghép các class lại với nhau
  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`.trim();

  return (
    <button className={classes} disabled={disabled} {...props}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
