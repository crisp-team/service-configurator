import React from 'react';
import ReactDOM from 'react-dom/client'; // Use this import for React 18+
import './index.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import ServiceConfigurator from './ServiceConfigurator';

// Use createRoot instead of render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ServiceConfigurator />
  </React.StrictMode>
);
