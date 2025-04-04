
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Force a full refresh to clear any cached components
const rootElement = document.getElementById("root");
if (rootElement) {
  // Clear the root element and any old styles
  rootElement.innerHTML = '';
  
  // Force style recalculation
  document.documentElement.style.setProperty('--force-repaint', Math.random().toString());
  
  // Create new root and render
  createRoot(rootElement).render(<App />);
}
