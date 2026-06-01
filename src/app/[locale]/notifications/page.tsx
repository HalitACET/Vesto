'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { AppNotification } from '@/types';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(50),
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as AppNotification[]);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-playfair text-3xl text-onyx mb-8">
        Bildirimler
      </h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-mist rounded animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-inter text-4xl mb-4">🔔</p>
          <p className="font-inter text-sm text-stone">
            Henüz bildirim yok
          </p>
        </div>
      ) : (
        <div className="divide-y divide-mist">
          {notifications.map(notif => (
            <NotificationRow key={notif.id} notification={notif} />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationRow({ notification }: { notification: AppNotification }) {
  const config = {
    recommendation: { icon: '✨', bg: 'bg-onyx/5' },
    accepted: { icon: '✅', bg: 'bg-green-50' },
    rejected: { icon: '❌', bg: 'bg-red-50' },
    follow: { icon: '👤', bg: 'bg-onyx/5' },
  }[notification.type] ?? { icon: '🔔', bg: 'bg-mist' };

  return (
    <div className={cn(
      'flex items-center gap-4 py-4 px-2',
      !notification.isRead && 'bg-onyx/[0.02]'
    )}>
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center',
        config.bg
      )}>
        <span>{config.icon}</span>
      </div>
      <div className="flex-1">
        <p className="font-inter text-sm font-semibold text-onyx">
          {notification.title}
        </p>
        <p className="font-inter text-xs text-stone">
          {notification.body}
        </p>
      </div>
      <span className="font-inter text-xs text-stone">
        {notification.createdAt ? new Date(notification.createdAt.toDate()).toLocaleDateString() : ''}
      </span>
    </div>
  );
}
