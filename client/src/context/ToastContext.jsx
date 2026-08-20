import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const addToast = useCallback((message, options = {}) => {
    const id = ++toastId;
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 4000,
      title: options.title || null,
    };

    setToasts(prev => [...prev.slice(-4), toast]); // max 5 toasts

    if (toast.duration > 0) {
      timersRef.current[id] = setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, [removeToast]);

  const toast = useMemo(() => ({
    success: (msg, opts) => addToast(msg, { ...opts, type: 'success' }),
    error: (msg, opts) => addToast(msg, { ...opts, type: 'error' }),
    info: (msg, opts) => addToast(msg, { ...opts, type: 'info' }),
    warning: (msg, opts) => addToast(msg, { ...opts, type: 'warning' }),
  }), [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container" role="alert" aria-live="polite">
      {toasts.map((toast, i) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} index={i} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss, index }) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={`toast toast-${toast.type}`}
      style={{ animationDelay: `${index * 50}ms` }}
      role="status"
    >
      <div className={`toast-icon-wrapper toast-icon-${toast.type}`}>
        <span className="toast-icon">{icons[toast.type]}</span>
      </div>
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-message">{toast.message}</div>
      </div>
      <button className="toast-close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss">
        ✕
      </button>
      {toast.duration > 0 && (
        <div className="toast-progress">
          <div
            className={`toast-progress-bar toast-progress-${toast.type}`}
            style={{ animationDuration: `${toast.duration}ms` }}
          />
        </div>
      )}
    </div>
  );
}
