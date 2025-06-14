import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ToastNotification, { ToastProps } from '../components/Common/ToastNotification';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastMessage['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type'], duration: number = 5000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9); // More unique ID
    setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
    
    // Auto-remove logic is now inside ToastNotification component itself
    // If not, it would be here:
    // setTimeout(() => {
    //   removeToast(id);
    // }, duration);

  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const toastContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999, // Very high z-index
    display: 'flex',
    flexDirection: 'column',
    gap: '10px', // Spacing between toasts
    maxWidth: '350px', // Max width of toasts
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div style={toastContainerStyle} id="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
