'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { initializeMessaging } from '@/lib/firebase/messaging';

export function FirebaseMessagingInitializer() {
  const { vestoUser } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      if (vestoUser) {
        initializeMessaging();
      }
    }
  }, [vestoUser]);

  return null;
}
