
import React from 'react'
import ReactDOM from 'react-dom/client'
import TestComponent from './components/TestComponent'
import './index.css'
import './i18n/i18n' // Import i18n configuration

console.log('main.tsx is executing');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found!');
    document.body.innerHTML = '<div>Root element not found in the DOM</div>';
  } else {
    console.log('Root element found, attempting to render');
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <TestComponent />
      </React.StrictMode>,
    );
    console.log('Render call completed');
  }
} catch (error) {
  console.error('Error rendering React application:', error);
  document.body.innerHTML = '<div>Failed to load application. Please check the console for errors.</div>';
}
