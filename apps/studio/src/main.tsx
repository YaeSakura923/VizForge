import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './styles/app.css';

// Hide splash screen
const splash = document.getElementById('splash');
if (splash) {
  // Small delay to ensure smooth transition
  requestAnimationFrame(() => {
    splash.classList.add('hidden');
    setTimeout(() => splash.remove(), 500);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
