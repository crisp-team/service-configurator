import React from 'react';

const AlertDescription = ({ children }) => {
  return (
    <p className="text-sm text-gray-700">
      {children}
    </p>
  );
};

export default AlertDescription;