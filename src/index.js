import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AudioProvider } from './context/AudioContext';

// Find the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  // Create root element if it doesn't exist
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
}

// Create React root
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app
root.render(
  <React.StrictMode>
    <AudioProvider>
      <App />
    </AudioProvider>
  </React.StrictMode>
);

// Add error boundary for debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});