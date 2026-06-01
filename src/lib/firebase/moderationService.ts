import {
  collection, query, where, orderBy,
  getDocs, updateDoc, doc, addDoc,
  serverTimestamp, limit, getDoc
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

// ─── REPORTS ────────────────────────────────────

// Şikayet oluştur (kullanıcı tarafından)
export async function reportContent(
  targetType: 'post' | 'comment',
  targetId: string,
  reason: string,
  description?: string,
) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const userDoc = await getDoc(doc(db, 'users', user.uid));

  await addDoc(collection(db, 'reports'), {
    reporterId: user.uid,
    reporterDisplayName: userDoc.data()?.displayName ?? 'Kullanıcı',
    targetType,
    targetId,
    reason,
    description: description ?? '',
    status: 'pending',
    createdAt: serverTimestamp(),
    resolvedAt: null,
    resolvedBy: null,
  });
}

// Şikayetleri getir (admin)
export async function getReports(
  status: 'pending' | 'resolved' | 'dismissed' | 'all' = 'pending'
) {
  const q = status === 'all'
    ? query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc'),
        limit(50),
      )
    : query(
        collection(db, 'reports'),
        where('status', '==', status),
        orderBy('createdAt', 'desc'),
        limit(50),
      );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── POST MODERASYONU ───────────────────────────

// Tüm postları getir (admin)
export async function getAllPosts(
  filter: 'all' | 'reported' | 'moderated' = 'all'
) {
  let q;

  if (filter === 'moderated') {
    q = query(
      collection(db, 'forumPosts'),
      where('isModerated', '==', true),
      orderBy('createdAt', 'desc'),
      limit(50),
    );
  } else {
    q = query(
      collection(db, 'forumPosts'),
      orderBy('createdAt', 'desc'),
      limit(50),
    );
  }

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Post kaldır (soft delete)
export async function removePost(postId: string, reason: string) {
  const adminUid = auth.currentUser?.uid;

  await updateDoc(doc(db, 'forumPosts', postId), {
    isArchived: true,
    isModerated: true,
    moderationReason: reason,
    moderatedAt: serverTimestamp(),
    moderatedBy: adminUid,
  });
}

// Post geri yükle
export async function restorePost(postId: string) {
  await updateDoc(doc(db, 'forumPosts', postId), {
    isArchived: false,
    isModerated: false,
    moderationReason: null,
    moderatedAt: null,
    moderatedBy: null,
  });
}

// Yorum kaldır
export async function removeComment(commentId: string) {
  await updateDoc(doc(db, 'forumComments', commentId), {
    isArchived: true,
    isModerated: true,
    moderatedAt: serverTimestamp(),
  });
}

// ─── KULLANICI UYARI SİSTEMİ ────────────────────

// Strike ver
export async function strikeUser(userId: string, reason: string) {
  const adminUid = auth.currentUser?.uid;
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const strikes = (userDoc.data()?.strikes ?? 0) + 1;

  await updateDoc(userRef, {
    strikes,
    // 3 strike = otomatik suspend
    isSuspended: strikes >= 3,
    lastStrikeReason: reason,
    lastStrikeAt: serverTimestamp(),
    lastStrikeBy: adminUid,
  });

  return strikes;
}

// Suspend kaldır
export async function unsuspendUser(userId: string) {
  await updateDoc(doc(db, 'users', userId), {
    isSuspended: false,
    strikes: 0,
  });
}

// Şikayeti çözümle
export async function resolveReport(
  reportId: string,
  action: 'resolved' | 'dismissed'
) {
  const adminUid = auth.currentUser?.uid;

  await updateDoc(doc(db, 'reports', reportId), {
    status: action,
    resolvedAt: serverTimestamp(),
    resolvedBy: adminUid,
  });
}

// Moderasyon istatistikleri
export async function getModerationStats() {
  const [pending, posts, moderated] = await Promise.all([
    getDocs(query(
      collection(db, 'reports'),
      where('status', '==', 'pending'),
    )),
    getDocs(query(
      collection(db, 'forumPosts'),
      where('isArchived', '==', false),
    )),
    getDocs(query(
      collection(db, 'forumPosts'),
      where('isModerated', '==', true),
    )),
  ]);

  return {
    pendingReports: pending.size,
    totalPosts: posts.size,
    moderatedPosts: moderated.size,
  };
}
