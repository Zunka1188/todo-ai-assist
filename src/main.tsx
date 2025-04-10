
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Get the root element
const rootElement = document.getElementById("root");

if (rootElement) {
  // Clear the root element and any old styles
  rootElement.innerHTML = '';
  
  // Create new root and render with StrictMode
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
