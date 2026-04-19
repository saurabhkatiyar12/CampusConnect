import React from 'react';

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  };

  return (
    <div className={`rounded-full overflow-hidden bg-gray-300 flex items-center justify-center text-white font-semibold ${sizeClasses[size]} ${className}`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-sm">{getInitials(name)}</span>
      )}
    </div>
  );
};

export { Avatar };