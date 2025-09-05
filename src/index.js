import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AudioProvider } from './context/AudioContext'; // <-- Import the provider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AudioProvider> {/* <-- Wrap your App */}
      <App />
    </AudioProvider>
  </React.StrictMode>
);