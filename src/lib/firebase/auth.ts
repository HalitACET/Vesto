import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

const googleProvider = new GoogleAuthProvider();

export async function signUp(
    email: string,
    password: string,
    displayName: string
): Promise<User> {
    const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );
    await updateProfile(credential.user, { displayName });

    // Create user document in Firestore
    await setDoc(doc(db, "users", credential.user.uid), {
        uid: credential.user.uid,
        email,
        displayName,
        role: "user",
        isStylistModeActive: false,
        profileSetupCompleted: false,
        wardrobeCount: 0,
        outfitCount: 0,
        followerCount: 0,
        followingCount: 0,
        createdAt: serverTimestamp(),
    });

    return credential.user;
}

export async function signIn(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
}

export async function signInWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, googleProvider);

    // Check if user exists to avoid overwriting setup status
    const userSnap = await getDoc(doc(db, "users", result.user.uid));
    
    if (!userSnap.exists()) {
        await setDoc(doc(db, "users", result.user.uid), {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            role: "user",
            isStylistModeActive: false,
            profileSetupCompleted: false,
            createdAt: serverTimestamp(),
        });
    } else {
        await updateDoc(doc(db, "users", result.user.uid), {
            photoURL: result.user.photoURL, // Sync photo
            lastLogin: serverTimestamp(),
        });
    }

    return result.user;
}

export async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
}

export function watchAuthState(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}
