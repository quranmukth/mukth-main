// ── Toast Container — Global notification stack ─────────────────────────────
import { useNotificationStore } from '../../stores/notificationStore';
import Toast from '../ui/Toast';

export default function ToastContainer() {
  const { toasts, removeToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '0.6rem',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast toast={toast} onDismiss={removeToast} />
        </div>
      ))}
    </div>
  );
}
