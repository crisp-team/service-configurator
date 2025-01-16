import React from 'react';

export const Total = ({ children, className }) => {
    return (
        <div className={`container ${className}`}>
            {children}
        </div>
    );
};

export const TotalContent = ({ children }) => {
    return <div className="card">{children}</div>;
};

export const TotalHeader = ({ children }) => {
    return <div className="">{children}</div>;
};

// export default Total;
