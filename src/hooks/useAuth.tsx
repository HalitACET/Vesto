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
        const unsubscribe = watchAuthState(async (user) => {
            setFirebaseUser(user);
            if (user) {
                const profile = await getUser(user.uid);
                setVestoUser(profile);
            } else {
                setVestoUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
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
