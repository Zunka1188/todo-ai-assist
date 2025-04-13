
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { logger } from './utils/logger';

// Get the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Create root and render
const root = ReactDOM.createRoot(rootElement);

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  logger.error('[Global Error]', event.error);
});

// Global promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  logger.error('[Unhandled Promise Rejection]', event.reason);
});

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  logger.error('[Render Error]', error);
  // Render a minimal fallback UI if the main app fails to render
  root.render(
    <div className="p-8 flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Critical Error</h1>
      <p className="mb-4">The application failed to start. Please try refreshing the page.</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh Page
      </button>
    </div>
  );
}
