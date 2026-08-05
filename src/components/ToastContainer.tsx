import React, { useState, useEffect } from 'react';
import { toast } from '../services/toast';
import { Toast } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return toast.subscribe((items) => setToasts(items));
  }, []);

  if (toasts.length === 0) return null;

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto glass-panel border border-white/20 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3 bg-black/80 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200"
        >
          {getIcon(t.type)}
          <div className="flex-1 min-w-0">
            {t.title && <h4 className="text-xs font-bold text-white mb-0.5">{t.title}</h4>}
            <p className="text-xs text-slate-300 leading-snug">{t.message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
