import React from 'react';

const CardHeader = ({ children }) => {
  return (
    <div className="mb-4 border-b pb-2">
      {children}
    </div>
  );
};

export default CardHeader;