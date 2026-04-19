import React from 'react';

const Button = ({ children, type = 'button', disabled = false, className = '', ...props }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };