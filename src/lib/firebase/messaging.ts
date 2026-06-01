import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { app, db, auth } from '@/lib/firebase';

export async function initializeMessaging() {
  try {
    const messaging = getMessaging(app);

    // İzin iste
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return;
    }

    // Token al
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    // Firestore'a kaydet
    const uid = auth.currentUser?.uid;
    if (uid && token) {
      await updateDoc(doc(db, 'users', uid), {
        fcmToken: token,
        fcmTokenWeb: token,  // web için ayrı field
      });
    }

    // Foreground mesajları
    onMessage(messaging, (payload) => {
      const { title, body } = payload.notification ?? {};
      if (title) {
        new Notification(title, { body });
      }
    });

  } catch (error) {
    console.error('FCM init error:', error);
    // Sessizce atla — notification kritik değil
  }
}
