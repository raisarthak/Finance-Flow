import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, DollarSign, AlertTriangle, TrendingUp, CreditCard, AlertCircle, Award } from 'lucide-react';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../services/notificationService';

const ICON_MAP = {
  'dollar-sign': DollarSign,
  'alert-triangle': AlertTriangle,
  'trending-up': TrendingUp,
  'credit-card': CreditCard,
  'alert-circle': AlertCircle,
  'award': Award,
  'bell': Bell
};

const TYPE_COLORS = {
  salary: 'var(--accent-green)',
  budget_alert: 'var(--accent-amber)',
  investment: 'var(--accent-blue)',
  bill_due: 'var(--accent-red)',
  unusual_spending: 'var(--accent-purple)',
  achievement: 'var(--accent-amber)',
  system: 'var(--accent-primary)'
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  async function loadNotifications() {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteNotification(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  }

  function formatTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" icon={CheckCheck} onClick={handleMarkAllRead}>
            Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" message="You're all caught up! Notifications will appear here." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {notifications.map(notif => {
            const Icon = ICON_MAP[notif.icon] || Bell;
            const color = TYPE_COLORS[notif.type] || 'var(--accent-primary)';
            return (
              <div className={`notification-item ${!notif.isRead ? 'unread' : ''}`} key={notif._id}>
                <div className="notification-icon" style={{ background: color + '18', color }}>
                  <Icon size={18} />
                </div>
                <div className="notification-content">
                  <div className="flex items-center gap-2">
                    <div className="notification-title">{notif.title}</div>
                    <Badge variant={notif.priority}>{notif.priority}</Badge>
                  </div>
                  <div className="notification-message">{notif.message}</div>
                  <div className="notification-time">{formatTime(notif.createdAt)}</div>
                </div>
                <div className="flex gap-2">
                  {!notif.isRead && (
                    <button className="btn btn-ghost btn-sm" onClick={() => handleMarkRead(notif._id)} title="Mark as read">
                      <CheckCheck size={14} />
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(notif._id)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
