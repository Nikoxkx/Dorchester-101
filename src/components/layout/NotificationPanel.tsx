'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Home, 
  Apple, 
  Train, 
  AlertTriangle, 
  Newspaper, 
  Clock,
  ExternalLink,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'housing' | 'food' | 'transit' | 'alert' | 'news' | 'deadline';
  title: string;
  message: string;
  link?: string;
  linkText?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  read: boolean;
  source: string;
}

const typeIcons = {
  housing: Home,
  food: Apple,
  transit: Train,
  alert: AlertTriangle,
  news: Newspaper,
  deadline: Clock,
};

const typeColors = {
  housing: '#1B3A6B',
  food: '#C8102E',
  transit: '#6B5B95',
  alert: '#B8860B',
  news: '#4A7BC4',
  deadline: '#1A6B3A',
};

const priorityColors = {
  urgent: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-blue-500',
  low: 'border-l-gray-300',
};

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
    // Auto-refresh every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg transition-colors',
          'hover:bg-[var(--color-bg-secondary)]',
          isOpen && 'bg-[var(--color-bg-secondary)]'
        )}
        aria-label={`Notifications: ${unreadCount} unread`}
      >
        <Bell className="w-5 h-5 text-[var(--color-text-muted)]" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[var(--color-accent-secondary)] text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute right-0 top-full mt-2 z-50',
                'w-96 max-h-[70vh] overflow-hidden',
                'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
                'rounded-xl shadow-xl'
              )}
            >
              {/* Header */}
              <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-semibold">Notifications</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Updated {lastUpdated || 'just now'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[var(--color-accent-primary)] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded hover:bg-[var(--color-bg-tertiary)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto max-h-[50vh]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--color-text-muted)]">
                      No new notifications
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--color-border)]">
                    {notifications.map((notif) => {
                      const Icon = typeIcons[notif.type];
                      const isExternal = notif.link?.startsWith('http');
                      
                      return (
                        <div
                          key={notif.id}
                          className={cn(
                            'p-4 border-l-4 transition-colors',
                            priorityColors[notif.priority],
                            !notif.read && 'bg-[var(--color-accent-primary)]/5',
                            'hover:bg-[var(--color-bg-tertiary)]'
                          )}
                        >
                          <div className="flex gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${typeColors[notif.type]}20` }}
                            >
                              <Icon className="w-4 h-4" style={{ color: typeColors[notif.type] }} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-heading font-medium text-sm line-clamp-2">
                                  {notif.title}
                                </h4>
                                {!notif.read && (
                                  <button
                                    onClick={() => markAsRead(notif.id)}
                                    className="p-1 rounded hover:bg-[var(--color-bg-secondary)]"
                                    title="Mark as read"
                                  >
                                    <Check className="w-3 h-3 text-[var(--color-accent-green)]" />
                                  </button>
                                )}
                              </div>
                              
                              <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">
                                {notif.message}
                              </p>
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[10px] text-[var(--color-text-muted)]">
                                  {notif.source} • {formatTime(notif.createdAt)}
                                </span>
                                
                                {notif.link && (
                                  isExternal ? (
                                    <a
                                      href={notif.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-[var(--color-accent-primary)] hover:underline"
                                      onClick={() => markAsRead(notif.id)}
                                    >
                                      {notif.linkText || 'View'}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ) : (
                                    <Link
                                      href={notif.link}
                                      className="text-xs text-[var(--color-accent-primary)] hover:underline"
                                      onClick={() => {
                                        markAsRead(notif.id);
                                        setIsOpen(false);
                                      }}
                                    >
                                      {notif.linkText || 'View'} →
                                    </Link>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
                <p className="text-[10px] text-[var(--color-text-muted)] text-center">
                  Live updates from MBTA, City of Boston, and community sources
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
