importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAOY1a_TqF5RbFUyGA9KUbMu8k4YXs3HVg",
  authDomain: "vesto-ai-a7ad6.firebaseapp.com",
  projectId: "vesto-ai-a7ad6",
  storageBucket: "vesto-ai-a7ad6.firebasestorage.app",
  messagingSenderId: "802172153346",
  appId: "1:802172153346:web:967a6bd66c28bc9ae6011b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload?.notification || {};
  
  self.registration.showNotification(title || 'Vesto', {
    body: body || 'Yeni bir bildiriminiz var.',
    icon: '/icon-192x192.png',
  });
});
