import { getUser, getAllUsers } from "@/lib/firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { VestoUser, UserRole } from "@/types";

// ── Read ──────────────────────────────────────────────────────────────────────

export async function fetchUser(uid: string): Promise<VestoUser | null> {
    return getUser(uid);
}

export async function fetchAllUsers(): Promise<VestoUser[]> {
    return getAllUsers();
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateUserRole(
    uid: string,
    role: UserRole
): Promise<void> {
    await updateDoc(doc(db, "users", uid), { role });
}

export async function updateUserProfile(
    uid: string,
    data: Partial<Pick<VestoUser, "displayName" | "bio" | "location" | "stylePreferences">>
): Promise<void> {
    await updateDoc(doc(db, "users", uid), data);
}
