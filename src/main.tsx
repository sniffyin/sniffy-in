import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { bootApplyForActiveSession } from './lib/userSettings';

// Apply the persisted text size + reduce-motion preferences before
// React paints, so reload doesn't flicker the default look first.
// No-op when no session is stored.
bootApplyForActiveSession();

// The service worker (skipWaiting + clientsClaim in vite.config.ts) installs
// and activates a new build automatically, but a tab that was already open
// keeps running the old JS in memory until something reloads it. Reload once
// the moment the new worker takes control, so a visitor who had the site
// open during a deploy still lands on the current build without having to
// know to refresh. The `reloaded` guard stops a loop if control changes more
// than once in a session.
if ('serviceWorker' in navigator) {
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
