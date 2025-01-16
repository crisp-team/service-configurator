import React from 'react';
import ReactDOM from 'react-dom/client'; // Use this import for React 18+
import ServiceConfigurator from './ServiceConfigurator';
import './App.scss';

// Use createRoot instead of render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ServiceConfigurator />
  </React.StrictMode>
);
