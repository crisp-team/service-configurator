import React from "react";
import './styles.scss';

export const LoaderComponent = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="loader w-16 relative aspect-square"></div>
    </div>
  )
}
