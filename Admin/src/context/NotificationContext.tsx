import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationItem {
  id: number;
  message: string;
  type: NotificationType;
}

interface ConfirmationState {
  message: string;
  resolve: (confirmed: boolean) => void;
}

interface NotifyOptions {
  type?: NotificationType;
  duration?: number;
}

interface NotificationContextValue {
  notify: (message: string, options?: NotifyOptions) => void;
  confirm: (message: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const inferType = (message: string): NotificationType => {
  const normalized = message.trim().toLowerCase();
  if (normalized.startsWith('lỗi') || normalized.includes(' thất bại') || normalized.includes('không thể')) {
    return 'error';
  }
  if (normalized.includes('thành công')) {
    return 'success';
  }
  if (normalized.startsWith('vui lòng') || normalized.includes('cảnh báo')) {
    return 'warning';
  }
  return 'info';
};

const typeStyles: Record<NotificationType, { icon: React.ReactNode; className: string; title: string }> = {
  success: {
    icon: <CheckCircle2 size={20} />,
    className: 'border-green-200 bg-green-50 text-green-800',
    title: 'Thành công',
  },
  error: {
    icon: <AlertCircle size={20} />,
    className: 'border-red-200 bg-red-50 text-red-800',
    title: 'Thông báo lỗi',
  },
  warning: {
    icon: <AlertCircle size={20} />,
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    title: 'Cần chú ý',
  },
  info: {
    icon: <Info size={20} />,
    className: 'border-sky-200 bg-sky-50 text-sky-800',
    title: 'Thông báo',
  },
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);

  const removeNotification = useCallback((id: number) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const notify = useCallback((message: string, options?: NotifyOptions) => {
    const id = Date.now() + Math.random();
    const type = options?.type ?? inferType(message);
    setNotifications((current) => [...current, { id, message, type }]);

    window.setTimeout(() => {
      removeNotification(id);
    }, options?.duration ?? 4500);
  }, [removeNotification]);

  const confirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmation({ message, resolve });
    });
  }, []);

  const resolveConfirmation = useCallback((confirmed: boolean) => {
    setConfirmation((current) => {
      current?.resolve(confirmed);
      return null;
    });
  }, []);

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message?: unknown) => {
      notify(String(message ?? ''), { duration: 5000 });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [notify]);

  const value = useMemo(() => ({ notify, confirm }), [notify, confirm]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {confirmation && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-[0_20px_50px_rgba(15,23,42,0.22)]">
            <div className="border-b border-[#E1F1FF] bg-[#F4F9FF] px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Xác nhận thao tác</h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm leading-6 text-gray-700">{confirmation.message}</p>
            </div>
            <div className="flex justify-end gap-3 border-t border-[#E1F1FF] bg-[#F4F9FF] px-6 py-4">
              <button
                type="button"
                onClick={() => resolveConfirmation(false)}
                className="rounded-lg border border-[#B8D7E8] bg-white px-4 py-2 text-sm font-medium text-[#00668A] transition hover:bg-[#E1F1FF] focus:outline-none focus:ring-2 focus:ring-[#00668A]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => resolveConfirmation(true)}
                className="rounded-lg bg-[#00668A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#005272] focus:outline-none focus:ring-2 focus:ring-[#00668A] focus:ring-offset-2"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="fixed right-4 top-4 z-[1000] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3" aria-live="polite">
        {notifications.map((notification) => {
          const style = typeStyles[notification.type];
          return (
            <div
              key={notification.id}
              className={`rounded-xl border px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.14)] backdrop-blur transition-all ${style.className}`}
              role={notification.type === 'error' ? 'alert' : 'status'}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">{style.icon}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{style.title}</p>
                  <p className="mt-0.5 whitespace-pre-line text-sm leading-5">{notification.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeNotification(notification.id)}
                  className="-mr-1 rounded-full p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
                  aria-label="Đóng thông báo"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
