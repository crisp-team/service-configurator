import React from 'react';

const Alert = ({ children, className }) => {
  return (
    <div className={`p-4 rounded-md bg-yellow-100 border border-yellow-300 text-yellow-800 ${className}`}>
      {children}
    </div>
  );
}; 