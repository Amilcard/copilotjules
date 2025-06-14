import React, { useEffect } from 'react';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: (id: string) => void;
  duration?: number; // Duration in ms
}

const ToastNotification: React.FC<ToastProps> = ({ id, message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [id, duration, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'var(--color-success, #2ECC71)'; // Green
      case 'error':
        return 'var(--color-error, #E74C3C)'; // Red
      case 'info':
        return 'var(--color-info, #3498DB)'; // Blue
      default:
        return 'var(--color-text-secondary, #7f8c8d)'; // Grey
    }
  };

  const toastStyle: React.CSSProperties = {
    backgroundColor: getBackgroundColor(),
    color: 'var(--color-text-light, white)',
    padding: '12px 18px',
    borderRadius: 'var(--button-border-radius, 8px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'var(--font-primary, Montserrat)',
    fontSize: '0.9rem',
    marginBottom: '10px', // For stacking in container
    animation: 'toast-in-right 0.5s ease forwards, toast-out-right 0.5s ease forwards var(--toast-duration, 5s)',
    // The toast-out-right animation will start after var(--toast-duration)
    // This requires setting the CSS variable --toast-duration in the parent or globally if it's dynamic per toast.
    // Or, handle exit animation via JS state change. For now, CSS handles entry. Exit will be abrupt on timeout.
    // For a JS-controlled exit animation, we'd need another state like `isExiting`.
  };

  const messageStyle: React.CSSProperties = {
    marginRight: '10px',
    flexGrow: 1,
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'inherit', // Inherits white/contrasting text color
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '0 5px',
    opacity: 0.7,
  };

  return (
    <div style={toastStyle} role="alert" aria-live="assertive" aria-atomic="true">
      <span style={messageStyle}>{message}</span>
      <button onClick={() => onClose(id)} style={closeButtonStyle} aria-label="Close notification">
        &times;
      </button>
    </div>
  );
};

export default ToastNotification;

// Add CSS for animations in a global stylesheet e.g. index.css or App.css
/*
@keyframes toast-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

// For JS-controlled exit animation:
// @keyframes toast-out-right {
//   from {
//     transform: translateX(0);
//     opacity: 1;
//   }
//   to {
//     transform: translateX(100%);
//     opacity: 0;
//   }
// }
*/
