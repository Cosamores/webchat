// components/Button.tsx
import React from 'react';

interface ButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  label,
  icon,
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const baseClasses =
    'flex items-center justify-center p-2 m-2 rounded bg-primary text-white hover:bg-primary-dark disabled:opacity-50';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
      type={type}
    >
      {icon && <span className="m-0">{icon}</span>}
      {label}
    </button>
  );
};

export default Button;