import {
  collection, query, orderBy, limit,
  getDocs, updateDoc, doc, where,
  serverTimestamp, startAfter,
  getDoc, DocumentSnapshot
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { AiMonitorItem } from '@/types/admin';

const PAGE_SIZE = 20;

// Tüm wardrobe items (paginated)
export async function getAiMonitorItems(
  filter: 'all' | 'pending' | 'failed' | 'no_material',
  lastDoc?: DocumentSnapshot,
): Promise<{ items: AiMonitorItem[]; lastDoc: DocumentSnapshot | null }> {

  let q = query(
    collection(db, 'wardrobeItems'),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE),
  );

  // Filtrele
  if (filter === 'pending') {
    q = query(
      collection(db, 'wardrobeItems'),
      where('uploadStatus', '==', 'analyzing'),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE),
    );
  } else if (filter === 'failed') {
    q = query(
      collection(db, 'wardrobeItems'),
      where('uploadStatus', '==', 'failed'),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE),
    );
  } else if (filter === 'no_material') {
    // detectedMaterial null olanlar (bilinen sorun)
    q = query(
      collection(db, 'wardrobeItems'),
      where('aiAnalysis.detectedMaterial', '==', null),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE),
    );
  }

  // Pagination
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snap = await getDocs(q);
  const items = snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
  })) as AiMonitorItem[];

  // User displayName'i enrich et
  const enriched = await Promise.all(
    items.map(async (item) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', item.userId));
        return {
          ...item,
          userDisplayName: userDoc.data()?.displayName ?? 'Bilinmeyen',
        };
      } catch {
        return item;
      }
    })
  );

  return {
    items: enriched,
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
  };
}

// Admin override kaydet
export async function overrideAiAnalysis(
  itemId: string,
  override: {
    category?: string;
    subcategory?: string;
    material?: string;
  }
) {
  const adminUid = auth.currentUser?.uid;
  if (!adminUid) throw new Error('Not authenticated');

  const updatePayload: Record<string, any> = {
    adminOverride: {
      ...override,
      overriddenAt: serverTimestamp(),
      overriddenBy: adminUid,
    },
    uploadStatus: 'ready',
  };

  // Sync root fields so normal user apps see the change immediately
  if (override.category) updatePayload.category = override.category;
  if (override.subcategory) updatePayload.subcategory = override.subcategory;

  await updateDoc(doc(db, 'wardrobeItems', itemId), updatePayload);
}

// İstatistikler
export async function getAiStats() {
  const [total, failed, analyzing] = await Promise.all([
    getDocs(query(collection(db, 'wardrobeItems'), limit(1000))),
    getDocs(query(
      collection(db, 'wardrobeItems'),
      where('uploadStatus', '==', 'failed'),
    )),
    getDocs(query(
      collection(db, 'wardrobeItems'),
      where('uploadStatus', '==', 'analyzing'),
    )),
  ]);

  return {
    total: total.size,
    failed: failed.size,
    analyzing: analyzing.size,
    ready: total.size - failed.size - analyzing.size,
  };
}
