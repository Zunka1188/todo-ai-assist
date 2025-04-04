
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Force a full refresh to clear any cached components
const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.innerHTML = '';
  createRoot(rootElement).render(<App />);
}
