// src/components/ui/alert/AlertTitle.js
import React from 'react';

const AlertTitle = ({ children }) => {
  return (
    <h3 className="text-md font-semibold">
      {children}
    </h3>
  );
};