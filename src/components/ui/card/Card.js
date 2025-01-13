import React from 'react';
import "../../../ServiceConfigurator.css"

export const Card = ({ children, className }) => {
  return (
    <div className={`container ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ children }) => {
  return <div className="card">{children}</div>;
};

export const CardHeader = ({ children }) => {
  return <div className="card-header">{children}</div>;
};

export const CardTitle = ({ children }) => {
  return <h2 className="card-title">{children}</h2>;
};
