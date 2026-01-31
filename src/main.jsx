import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Enhanced app initialization with beautiful loading state
const rootElement = document.getElementById('root');

if (rootElement) {
  // Add beautiful loading overlay
  const loadingOverlay = document.createElement('div');
  loadingOverlay.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #f0fdfa 0%, #e5f7ff 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      transition: opacity 0.5s ease;
    ">
      <div style="
        width: 48px;
        height: 48px;
        border: 4px solid #e5f7ff;
        border-top: 4px solid #14b8a6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
      "></div>
      <div style="
        color: #6b7280;
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      ">Loading Empowerment App...</div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  
  document.body.appendChild(loadingOverlay);

  // Register Service Worker for PWA functionality
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker registered!'))
        .catch(err => console.log('Service Worker registration failed:', err));
    });
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  // Remove loading overlay after app mounts
  setTimeout(() => {
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(loadingOverlay);
    }, 500);
  }, 1000);
}
