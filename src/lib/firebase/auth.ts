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
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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
        wardrobeCount: 0,
        outfitCount: 0,
        followersCount: 0,
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

    // Upsert user document
    await setDoc(
        doc(db, "users", result.user.uid),
        {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            role: "user",
            createdAt: serverTimestamp(),
        },
        { merge: true }
    );

    return result.user;
}

export async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
}

export function watchAuthState(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}
