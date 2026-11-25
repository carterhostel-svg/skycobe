import React, { useState } from 'react';
import { Calendar, MessageSquare, ShieldCheck, Tag, Info, CheckCheck, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface Notification {
  id: string;
  type: 'booking' | 'message' | 'system' | 'promo';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Room Viewing Confirmed',
    message: 'Your reservation request for Private Single Room at Pentagon Annex has been acknowledged for Friday 2:00 PM.',
    time: '2 hours ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'message',
    title: 'Message from Mrs. Sarah Jenkins',
    message: 'We have reserved your slot. Water is 24/7 borehole and WiFi is unlimited.',
    time: '5 hours ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'system',
    title: 'UG Legon Student Status Verified',
    message: 'Your student profile (Alex Owusu, Level 300) has been verified. You can book rooms without preliminary deposit.',
    time: '1 day ago',
    isRead: true,
  },
  {
    id: '4',
    type: 'promo',
    title: 'Semester Early Bird Discount',
    message: 'Pentagon Annex and Bani Hostel are offering 5% cashback on full academic year upfront payments.',
    time: '2 days ago',
    isRead: true,
  },
  {
    id: '5',
    type: 'booking',
    title: '360° Virtual Tour Available',
    message: 'A high-definition 360° panorama tour is now active for Evandy Residence Master Suite.',
    time: '3 days ago',
    isRead: true,
  },
];

export const Notifications: React.FC = () => {
  const { showToast } = useAppContext();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read');
  };

  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Notification removed');
  };

  const filteredNotifications = notifications.filter((n) =>
    activeTab === 'unread' ? !n.isRead : true
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar size={16} className="text-teal-700" />;
      case 'message':
        return <MessageSquare size={16} className="text-blue-700" />;
      case 'system':
        return <ShieldCheck size={16} className="text-emerald-700" />;
      case 'promo':
        return <Tag size={16} className="text-amber-700" />;
      default:
        return <Info size={16} className="text-slate-700" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-teal-50 border-teal-200';
      case 'message':
        return 'bg-blue-50 border-blue-200';
      case 'system':
        return 'bg-emerald-50 border-emerald-200';
      case 'promo':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[var(--color-bg)] font-sans">
      {/* Top Header Bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-16 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-accent)]">
                  Updates & Alerts
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">
                  {unreadCount} unread
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[var(--color-heading)] tracking-tight">
                Notifications
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text-primary)] hover:border-slate-400 transition-colors cursor-pointer"
                >
                  <CheckCheck size={14} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-slate-400'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'unread'
                  ? 'bg-slate-900 text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-slate-400'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {filteredNotifications.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center max-w-md mx-auto my-12">
            <h3 className="text-base font-bold text-[var(--color-heading)] mb-1">
              You're all caught up!
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              No new alerts right now. We'll notify you whenever there are new booking updates or price drops.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => toggleReadStatus(n.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 bg-[var(--color-surface)] ${
                  !n.isRead
                    ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/15 shadow-xs'
                    : 'border-[var(--color-border)] hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${getIconBg(
                    n.type
                  )}`}
                >
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`text-xs font-bold truncate ${
                        !n.isRead ? 'text-[var(--color-heading)]' : 'text-slate-700'
                      }`}
                    >
                      {n.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {n.time}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  className="text-slate-300 hover:text-rose-500 p-1 transition-colors shrink-0"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
