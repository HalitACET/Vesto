import { db, storage } from "./config";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    collection,
    where,
    writeBatch,
    serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface UpdateProfileParams {
    uid: string;
    displayName?: string;
    bio?: string;
    username?: string;
    photoFile?: File | null;
}

// Profil güncelle
export async function updateProfile({
    uid,
    displayName,
    bio,
    username,
    photoFile,
}: UpdateProfileParams) {
    let photoUrl: string | undefined;

    if (photoFile) {
        const storageRef = ref(storage, `users/${uid}/avatar.jpg`);
        await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(storageRef);
    }

    // Username unique check
    if (username) {
        const cleanUsername = username.trim().toLowerCase();
        const existing = await getDoc(doc(db, "usernames", cleanUsername));
        if (existing.exists() && existing.data()?.uid !== uid) {
            throw new Error("USERNAME_TAKEN");
        }

        // Eski username sil
        const userDoc = await getDoc(doc(db, "users", uid));
        const oldUsername = userDoc.data()?.username;
        if (oldUsername && oldUsername.trim().toLowerCase() !== cleanUsername) {
            await deleteDoc(doc(db, "usernames", oldUsername.trim().toLowerCase()));
        }

        await setDoc(doc(db, "usernames", cleanUsername), { uid });
    }

    await updateDoc(doc(db, "users", uid), {
        ...(displayName && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(username !== undefined && { username: username.trim().toLowerCase() }),
        ...(photoUrl && { photoURL: photoUrl, photoUrl: photoUrl }),
        updatedAt: serverTimestamp(),
    });
}

// Public wardrobe
export async function setWardrobePublic(userId: string, isPublic: boolean) {
    const items = await getDocs(
        query(collection(db, "wardrobeItems"), where("userId", "==", userId))
    );

    const batch = writeBatch(db);
    items.forEach((item) => {
        batch.update(item.ref, { isPublic });
    });
    await batch.update(doc(db, "users", userId), { wardrobePublic: isPublic });
    await batch.commit();
}

// Per-item toggle
export async function toggleItemPublic(itemId: string, isPublic: boolean) {
    await updateDoc(doc(db, "wardrobeItems", itemId), {
        isPublic,
        updatedAt: serverTimestamp(),
    });
}
