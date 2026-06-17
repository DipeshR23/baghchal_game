/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from 'react';
import { HomePage } from './pages/HomePage.js';
import { PlayPage } from './pages/PlayPage.js';
import { GamePage } from './pages/GamePage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

export const Router: React.FC = () => {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Hash-based routing
  const path = currentHash.replace(/^#/, '');

  if (path === '/' || path === '') {
    return <HomePage />;
  }
  if (path === '/play') {
    return <PlayPage />;
  }
  if (path === '/game') {
    return <GamePage />;
  }

  return <NotFoundPage />;
};

/**
 * Navigate to a client-side route.
 *
 * @param to The target path, e.g. '/play' or '/game'.
 */
export function navigate(to: string) {
  window.location.hash = to.startsWith('#') ? to : `#${to}`;
}
export { Router as default };
