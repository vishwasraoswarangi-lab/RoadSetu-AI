import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useAuth();
  if (!toastMessage) return null;
  const { text, type } = toastMessage;
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 ${
          type === 'success'
            ? 'border-emerald-200 bg-white/95 text-emerald-900'
            : type === 'error'
            ? 'border-rose-200 bg-white/95 text-rose-900'
            : 'border-cyan-200 bg-white/95 text-slate-900'
        }`}
      >
        <div className="shrink-0">
          {type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          {type === 'error' && <AlertCircle className="h-5 w-5 text-rose-600" />}
          {type === 'info' && <Info className="h-5 w-5 text-cyan-600" />}
        </div>
        <p className="text-sm font-semibold leading-snug">{text}</p>
      </div>
    </div>
  );
};
