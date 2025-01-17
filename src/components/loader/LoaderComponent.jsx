import React from "react";
import './styles.scss';

export const LoaderComponent = () => {
  return (
    <div className="absolute inset-0 w-full h-screen flex justify-center items-center z-10 bg-light-bg">
      <div className="loader w-16 relative aspect-square"></div>
    </div>
  )
}
