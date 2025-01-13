// src/components/ui/card/CardContent.js
import React from 'react';

const CardContent = ({ children }) => {
  return (
    <div className="text-gray-700">
      {children}
    </div>
  );
};

export default CardContent;