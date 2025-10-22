import { useEffect } from 'react';
import { Check, ShoppingCart, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <Check size={20} />,
    error: <X size={20} />,
    info: <ShoppingCart size={20} />,
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      className="fixed bottom-8 right-8 z-50 animate-slideUp"
      role="alert"
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md">
        <div className="flex items-center gap-4 p-4">
          <div className={`${colors[type]} text-white p-2 rounded-xl flex-shrink-0`}>
            {icons[type]}
          </div>
          <p className="text-gray-900 font-medium flex-1">{message}</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className={`h-full ${colors[type]} transition-all`}
            style={{
              animation: `shrink ${duration}ms linear`,
              transformOrigin: 'left'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
