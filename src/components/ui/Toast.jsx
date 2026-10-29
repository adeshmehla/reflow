import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, "success", duration),
    error: (msg, duration) => addToast(msg, "error", duration),
    info: (msg, duration) => addToast(msg, "info", duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container fixed at top right */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
            error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
            info: <Info className="w-4 h-4 text-indigo-400 shrink-0" />,
          };
          const borders = {
            success: "border-emerald-500/30 bg-[var(--bg-elevated)]",
            error: "border-rose-500/30 bg-[var(--bg-elevated)]",
            info: "border-indigo-500/30 bg-[var(--bg-elevated)]",
          };

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-[var(--radius-md)] border shadow-xl backdrop-blur-md text-sm text-[var(--text-primary)] transition-all animate-in slide-in-from-top-2 duration-200 ${borders[t.type] || borders.info}`}
            >
              <div className="flex items-center gap-2.5">
                {icons[t.type]}
                <span>{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return context;
}
