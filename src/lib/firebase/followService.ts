import { auth, db } from "./config";
import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    updateDoc,
    getDocs,
    collection,
    query,
    where,
    increment,
    serverTimestamp,
} from "firebase/firestore";
import type { VestoUser } from "@/types";

export async function toggleFollow(targetUserId: string): Promise<void> {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const followRef = doc(db, "userFollows", `${uid}_${targetUserId}`);
    const myRef = doc(db, "users", uid);
    const targetRef = doc(db, "users", targetUserId);

    const followDoc = await getDoc(followRef);

    if (followDoc.exists()) {
        await deleteDoc(followRef);
        await updateDoc(myRef, { followingCount: increment(-1) });
        await updateDoc(targetRef, { followerCount: increment(-1) });
    } else {
        await setDoc(followRef, {
            followerId: uid,
            followingId: targetUserId,
            createdAt: serverTimestamp(),
        });
        await updateDoc(myRef, { followingCount: increment(1) });
        await updateDoc(targetRef, { followerCount: increment(1) });
    }
}

export async function checkIsFollowing(targetUserId: string): Promise<boolean> {
    const uid = auth.currentUser?.uid;
    if (!uid) return false;
    const snap = await getDoc(doc(db, "userFollows", `${uid}_${targetUserId}`));
    return snap.exists();
}

export async function getFollowers(userId: string): Promise<VestoUser[]> {
    const snap = await getDocs(
        query(collection(db, "userFollows"), where("followingId", "==", userId))
    );
    const ids = snap.docs.map((d) => d.data().followerId as string);
    if (ids.length === 0) return [];
    const users = await Promise.all(
        ids.map(async (id) => {
            const userSnap = await getDoc(doc(db, "users", id));
            if (!userSnap.exists()) return null;
            return { uid: userSnap.id, ...userSnap.data() } as VestoUser;
        })
    );
    return users.filter((u): u is VestoUser => u !== null);
}

export async function getFollowing(userId: string): Promise<VestoUser[]> {
    const snap = await getDocs(
        query(collection(db, "userFollows"), where("followerId", "==", userId))
    );
    const ids = snap.docs.map((d) => d.data().followingId as string);
    if (ids.length === 0) return [];
    const users = await Promise.all(
        ids.map(async (id) => {
            const userSnap = await getDoc(doc(db, "users", id));
            if (!userSnap.exists()) return null;
            return { uid: userSnap.id, ...userSnap.data() } as VestoUser;
        })
    );
    return users.filter((u): u is VestoUser => u !== null);
}
