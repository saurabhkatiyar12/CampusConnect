import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg border border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

export { Card };