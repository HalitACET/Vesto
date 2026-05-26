import {
  collection, query, where, orderBy,
  onSnapshot, addDoc, deleteDoc, updateDoc,
  doc, getDoc, setDoc, serverTimestamp,
  increment, Timestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { ForumPost, ForumComment } from '@/types/forum';

// ─── FEED ───────────────────────────────────
export function subscribeFeed(
  callback: (posts: ForumPost[]) => void
) {
  const q = query(
    collection(db, 'forumPosts'),
    where('isArchived', '==', false),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as ForumPost[];
    callback(posts);
  });
}

// ─── LIKE ───────────────────────────────────
export async function toggleLike(postId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const likeRef = doc(db, 'forumLikes', `${postId}_${uid}`);
  const postRef = doc(db, 'forumPosts', postId);

  const likeDoc = await getDoc(likeRef);

  if (likeDoc.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(postRef, { likeCount: increment(-1) });
  } else {
    await setDoc(likeRef, {
      postId, userId: uid,
      createdAt: serverTimestamp(),
    });
    await updateDoc(postRef, { likeCount: increment(1) });
  }
}

export async function isLiked(postId: string): Promise<boolean> {
  const uid = auth.currentUser?.uid;
  if (!uid) return false;
  const snap = await getDoc(doc(db, 'forumLikes', `${postId}_${uid}`));
  return snap.exists();
}

// ─── COMMENTS ───────────────────────────────
export function subscribeComments(
  postId: string,
  callback: (comments: ForumComment[]) => void
) {
  const q = query(
    collection(db, 'forumComments'),
    where('postId', '==', postId),
    where('isArchived', '==', false),
    orderBy('createdAt', 'asc'),
  );

  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as ForumComment[];
    callback(comments);
  });
}

export async function addComment(
  postId: string,
  text: string,
  parentId: string | null = null,
  replyToDisplayName: string | null = null
) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const userData = userDoc.data();

  await addDoc(collection(db, 'forumComments'), {
    postId,
    authorId: user.uid,
    authorDisplayName: userData?.displayName ?? 'Kullanıcı',
    authorPhotoUrl: userData?.photoUrl ?? userData?.photoURL ?? null,
    text,
    createdAt: serverTimestamp(),
    isArchived: false,
    likeCount: 0,
    parentId: parentId || null,
    replyToDisplayName: replyToDisplayName || null,
  });

  await updateDoc(doc(db, 'forumPosts', postId), {
    commentCount: increment(1),
  });
}

export async function toggleCommentLike(commentId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const likeRef = doc(db, 'commentLikes', `${commentId}_${uid}`);
  const commentRef = doc(db, 'forumComments', commentId);

  const likeDoc = await getDoc(likeRef);

  if (likeDoc.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(commentRef, { likeCount: increment(-1) });
  } else {
    await setDoc(likeRef, {
      commentId,
      userId: uid,
      createdAt: serverTimestamp(),
    });
    await updateDoc(commentRef, { likeCount: increment(1) });
  }
}

export function subscribeMyCommentLikes(
  callback: (likedCommentIds: string[]) => void
) {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'commentLikes'),
    where('userId', '==', uid)
  );

  return onSnapshot(q, (snap) => {
    const ids = snap.docs.map(doc => doc.data().commentId as string);
    callback(ids);
  });
}

// ─── POST ───────────────────────────────────
export async function shareOutfit(outfitId: string | null, caption: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const userData = userDoc.data();

  await addDoc(collection(db, 'forumPosts'), {
    authorId: user.uid,
    authorDisplayName: userData?.displayName ?? 'Kullanıcı',
    authorPhotoUrl: userData?.photoUrl ?? userData?.photoURL ?? null,
    outfitId: outfitId || null,
    caption,
    likeCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
    isModerated: false,
    isArchived: false,
  });
}

export async function deletePost(postId: string) {
  await updateDoc(doc(db, 'forumPosts', postId), {
    isArchived: true,
  });
}

// ─── OUTFIT SUGGESTION COMMENT ───────────────
export async function addOutfitSuggestionComment(
  postId: string,
  suggestion: {
    topId: string | null;
    bottomId: string | null;
    shoesId: string | null;
    accessoryId: string | null;
    note?: string;
  }
) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const userData = userDoc.data();

  const hasItems = suggestion.topId || suggestion.bottomId || suggestion.shoesId || suggestion.accessoryId;
  if (!hasItems) throw new Error('At least one item required');

  await addDoc(collection(db, 'forumComments'), {
    postId,
    authorId: user.uid,
    authorDisplayName: userData?.displayName ?? 'Kullanıcı',
    authorPhotoUrl: userData?.photoUrl ?? userData?.photoURL ?? null,
    text: suggestion.note || '🎽 Kombin önerisi',
    commentType: 'outfit_suggestion',
    outfitSuggestion: {
      topId: suggestion.topId ?? null,
      bottomId: suggestion.bottomId ?? null,
      shoesId: suggestion.shoesId ?? null,
      accessoryId: suggestion.accessoryId ?? null,
      note: suggestion.note ?? null,
    },
    createdAt: serverTimestamp(),
    isArchived: false,
    likeCount: 0,
    parentId: null,
    replyToDisplayName: null,
  });

  await updateDoc(doc(db, 'forumPosts', postId), {
    commentCount: increment(1),
  });
}

