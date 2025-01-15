import React from 'react';
import "../../../ServiceConfigurator.scss"

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
  return <h1 className="heading-h1 text-custom-primary text-center">{children}</h1>;
};
