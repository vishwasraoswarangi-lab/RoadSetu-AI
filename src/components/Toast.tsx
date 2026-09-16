import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useAuth();

  if (!toastMessage) return null;

  const { text, type } = toastMessage;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-center space-x-3 rounded-xl border p-3.5 shadow-2xl backdrop-blur-md ${
          type === 'success'
            ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
            : type === 'error'
            ? 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            : 'border-cyan-500/40 bg-slate-900/90 text-cyan-200'
        }`}
      >
        <div className="shrink-0">
          {type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
          {type === 'error' && <AlertCircle className="h-5 w-5 text-rose-400" />}
          {type === 'info' && <Info className="h-5 w-5 text-cyan-400" />}
        </div>
        <p className="text-xs font-medium leading-snug">{text}</p>
      </div>
    </div>
  );
};
