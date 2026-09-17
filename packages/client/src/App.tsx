import { Analytics } from '@vercel/analytics/react';
import { Router } from './Router.js';

function App() {
  return (
    <>
      <Router />
      <Analytics />
    </>
  );
}

export default App;
