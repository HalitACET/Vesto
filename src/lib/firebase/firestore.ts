import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { WardrobeItem, Outfit, VestoUser, ForumPost } from "@/types";

// ─── Wardrobe ─────────────────────────────────────────────────────────────────

export async function getWardrobeItems(userId: string): Promise<WardrobeItem[]> {
    const q = query(
        collection(db, "wardrobeItems"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WardrobeItem));
}

export async function addWardrobeItem(
    item: Omit<WardrobeItem, "id" | "createdAt" | "updatedAt">
): Promise<string> {
    const ref = await addDoc(collection(db, "wardrobeItems"), {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return ref.id;
}

export async function updateWardrobeItem(
    id: string,
    data: Partial<WardrobeItem>
): Promise<void> {
    await updateDoc(doc(db, "wardrobeItems", id), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteWardrobeItem(id: string): Promise<void> {
    await deleteDoc(doc(db, "wardrobeItems", id));
}

// ─── Outfits ──────────────────────────────────────────────────────────────────

export async function getOutfits(userId: string): Promise<Outfit[]> {
    const q = query(
        collection(db, "outfits"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Outfit));
}

export async function saveOutfit(
    outfit: Omit<Outfit, "id" | "createdAt" | "updatedAt">
): Promise<string> {
    const ref = await addDoc(collection(db, "outfits"), {
        ...outfit,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return ref.id;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUser(uid: string): Promise<VestoUser | null> {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    return { uid: snap.id, ...snap.data() } as VestoUser;
}

export async function getAllUsers(): Promise<VestoUser[]> {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() } as VestoUser));
}

// ─── Forum ────────────────────────────────────────────────────────────────────

export async function getForumPosts(limitCount = 20): Promise<ForumPost[]> {
    const q = query(
        collection(db, "forumPosts"),
        where("isModerated", "==", false),
        orderBy("createdAt", "desc"),
        limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ForumPost));
}

export async function addForumPost(
    post: Omit<ForumPost, "id" | "createdAt">
): Promise<string> {
    const ref = await addDoc(collection(db, "forumPosts"), {
        ...post,
        createdAt: serverTimestamp(),
    });
    return ref.id;
}
