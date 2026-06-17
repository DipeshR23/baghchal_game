import React from 'react';
import { useUIStore } from '../../stores/uiStore.js';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-400" />,
  };

  const bgStyles = {
    success: 'border-emerald-500/20 bg-slate-900/95 shadow-emerald-500/5',
    info: 'border-blue-500/20 bg-slate-900/95 shadow-blue-500/5',
    warning: 'border-amber-500/20 bg-slate-900/95 shadow-amber-500/5',
    error: 'border-red-500/20 bg-slate-900/95 shadow-red-500/5',
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg pointer-events-auto
            animate-in slide-in-from-top duration-300
            ${bgStyles[toast.type]}
          `}
        >
          <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
          <div className="flex-grow text-sm font-medium text-slate-200">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 p-0.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
export { ToastContainer as default };
