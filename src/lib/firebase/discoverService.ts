import {
  collection, query, where, orderBy,
  getDocs, limit, startAt, endAt,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Kullanıcı arama (prefix search)
export async function searchUsers(searchQuery: string) {
  if (searchQuery.trim().length < 2) return [];

  const q = searchQuery.trim();
  const qLower = q.toLowerCase();

  // displayName ile ara
  const nameSnap = await getDocs(
    query(
      collection(db, 'users'),
      orderBy('displayName'),
      startAt(q),
      endAt(q + '\uf8ff'),
      limit(10),
    )
  );

  // username ile ara
  const usernameSnap = await getDocs(
    query(
      collection(db, 'users'),
      orderBy('username'),
      startAt(qLower),
      endAt(qLower + '\uf8ff'),
      limit(10),
    )
  );

  // Birleştir, duplicate temizle
  const allUsers = [
    ...nameSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    ...usernameSnap.docs.map(d => ({ id: d.id, ...d.data() })),
  ];

  const seen = new Set<string>();
  return allUsers.filter(u => {
    if (seen.has(u.id)) return false;
    seen.add(u.id);
    return true;
  });
}

// Stilistler
export async function getTopStylists(limitCount = 10) {
  const snap = await getDocs(
    query(
      collection(db, 'users'),
      where('isStylistModeActive', '==', true),
      orderBy('followerCount', 'desc'),
      limit(limitCount),
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Öne Çıkanlar
export async function getFeaturedUsers(limitCount = 10) {
  const snap = await getDocs(
    query(
      collection(db, 'users'),
      orderBy('followerCount', 'desc'),
      limit(limitCount),
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Yeni Katılanlar
export async function getNewUsers(limitCount = 10) {
  const snap = await getDocs(
    query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(limitCount),
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
