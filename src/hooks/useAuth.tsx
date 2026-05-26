"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { watchAuthState } from "@/lib/firebase/auth";
import { getUser } from "@/lib/firebase/firestore";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { VestoUser } from "@/types";

interface AuthContextValue {
    firebaseUser: User | null;
    vestoUser: VestoUser | null;
    loading: boolean;
    isAdmin: boolean;
    isStylist: boolean;
}

const AuthContext = createContext<AuthContextValue>({
    firebaseUser: null,
    vestoUser: null,
    loading: true,
    isAdmin: false,
    isStylist: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [vestoUser, setVestoUser] = useState<VestoUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc: (() => void) | null = null;

        const unsubscribeAuth = watchAuthState((user) => {
            setFirebaseUser(user);

            // Clean up previous document listener
            if (unsubscribeDoc) {
                unsubscribeDoc();
                unsubscribeDoc = null;
            }

            if (user) {
                unsubscribeDoc = onSnapshot(
                    doc(db, "users", user.uid),
                    (snapshot) => {
                        if (snapshot.exists()) {
                            setVestoUser({ uid: snapshot.id, ...snapshot.data() } as VestoUser);
                        } else {
                            setVestoUser(null);
                        }
                        setLoading(false);
                    },
                    (error) => {
                        console.error("Error subscribing to user doc:", error);
                        setLoading(false);
                    }
                );
            } else {
                setVestoUser(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeDoc) {
                unsubscribeDoc();
            }
        };
    }, []);

    const isAdmin = vestoUser?.role === "admin";
    const isStylist = vestoUser?.role === "stylist" || isAdmin;

    return (
        <AuthContext.Provider value={{ firebaseUser, vestoUser, loading, isAdmin, isStylist }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
