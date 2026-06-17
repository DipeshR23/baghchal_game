import React from 'react';
import { navigate } from '../Router.js';
import { Button } from '../components/ui/Button.js';
import { HelpCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center gap-6 max-w-sm">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
          <HelpCircle className="h-8 w-8" />
        </div>
        
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Page Not Found</h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            The page you are looking for does not exist or has been relocated.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/')}
          className="w-full"
        >
          Return to Lobby
        </Button>
      </div>
    </div>
  );
};
export { NotFoundPage as default };
