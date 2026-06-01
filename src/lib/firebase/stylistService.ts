import {
    collection, query, where, orderBy,
    onSnapshot, doc, setDoc, serverTimestamp,
    getDocs, limit, updateDoc, getDoc
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { OutfitRecommendation } from '@/types/stylist';
import { nanoid } from 'nanoid';

// Stilist mode toggle
export async function setStylistMode(active: boolean) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid), {
        isStylistModeActive: active,
    });
}

// Aktif stilistler
export async function getActiveStylists(currentUserId: string) {
    const snap = await getDocs(
        query(
            collection(db, 'users'),
            where('isStylistModeActive', '==', true),
            limit(20),
        )
    );

    return snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((u: any) => u.id !== currentUserId);
}

// Öneri gönder
export async function sendRecommendation(
    targetUserId: string,
    items: OutfitRecommendation['items'],
    note: string,
) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    const recId = nanoid();
    await setDoc(doc(db, 'outfitRecommendations', recId), {
        stylistId: user.uid,
        stylistDisplayName: userData?.displayName ?? 'Stilist',
        stylistPhotoUrl: userData?.photoUrl ?? null,
        targetUserId,
        items,
        note,
        status: 'pending',
        createdAt: serverTimestamp(),
        respondedAt: null,
    });
}

// Gelen öneriler
export function subscribeIncomingRecommendations(
    callback: (recs: OutfitRecommendation[]) => void
) {
    const uid = auth.currentUser?.uid;
    if (!uid) return () => { };

    const q = query(
        collection(db, 'outfitRecommendations'),
        where('targetUserId', '==', uid),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc'),
    );

    return onSnapshot(q, (snap) => {
        const recs = snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
        })) as OutfitRecommendation[];
        callback(recs);
    });
}

// Öneri kabul et
export async function acceptRecommendation(rec: OutfitRecommendation) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');

  const outfitId = nanoid();

  // 1. Outfit oluştur
  await setDoc(doc(db, 'outfits', outfitId), {
    id: outfitId,
    userId: uid,
    name: `${rec.stylistDisplayName} önerdi`,
    items: rec.items,
    tags: ['öneri'],
    createdAt: serverTimestamp(),
    lastWorn: null,
    wearCount: 0,
    isFavorite: false,
    isArchived: false,
    createdBy: 'stylist',
  });

  // 2. Status güncelle
  await updateDoc(doc(db, 'outfitRecommendations', rec.id), {
    status: 'accepted',
    respondedAt: serverTimestamp(),
    acceptedOutfitId: outfitId,
  });
}

// Öneri reddet
export async function rejectRecommendation(recId: string) {
  await updateDoc(doc(db, 'outfitRecommendations', recId), {
    status: 'rejected',
    respondedAt: serverTimestamp(),
  });
}

// Status'a göre öneriler
export function subscribeRecommendationsByStatus(
  status: string,
  callback: (recs: OutfitRecommendation[]) => void
) {
  const uid = auth.currentUser?.uid;
  if (!uid) return () => {};

  const q = query(
    collection(db, 'outfitRecommendations'),
    where('targetUserId', '==', uid),
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as OutfitRecommendation[]);
  });
}

// Öneriye puan ver
export async function rateRecommendation(recId: string, rating: number) {
  await updateDoc(doc(db, 'outfitRecommendations', recId), {
    rating,
  });
}
