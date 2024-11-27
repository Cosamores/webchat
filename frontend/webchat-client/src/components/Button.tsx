// components/Button.tsx
import React from 'react';

interface ButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';

}

const Button: React.FC<ButtonProps> = ({ onClick, label, disabled = false, className = '', type }) => {
  const baseClasses =
    'px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark disabled:opacity-50';

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${className}`} type={type}>
      {label}
    </button>
  );
};

export default Button;