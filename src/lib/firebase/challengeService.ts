import {
    collection, doc, addDoc, query, orderBy,
    onSnapshot, serverTimestamp, updateDoc, increment,
    Timestamp
} from 'firebase/firestore';
import { db } from './config';

export interface Challenge {
    id: string;
    title: string;
    description: string;
    theme: string;
    createdBy: string;
    createdByName: string;
    endsAt: Timestamp;
    participantCount: number;
    featured: boolean;
    createdAt: Timestamp;
}

export interface ChallengeEntry {
    id: string;
    challengeId: string;
    userId: string;
    userName: string;
    outfitId: string;
    note?: string;
    likeCount: number;
    createdAt: Timestamp;
}

export async function createChallenge(data: {
    title: string;
    description: string;
    theme: string;
    createdBy: string;
    createdByName: string;
    endsAt: Date;
}): Promise<string> {
    const ref = await addDoc(collection(db, 'challenges'), {
        ...data,
        endsAt: Timestamp.fromDate(data.endsAt),
        participantCount: 0,
        featured: false,
        createdAt: serverTimestamp(),
    });
    return ref.id;
}

export function subscribeToChallenges(callback: (challenges: Challenge[]) => void): () => void {
    const q = query(
        collection(db, 'challenges'),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Challenge)));
    }, error => {
        console.error("subscribeToChallenges error:", error);
    });
}

export async function joinChallenge(
    challengeId: string,
    userId: string,
    userName: string,
    outfitId: string,
    note?: string
): Promise<void> {
    await addDoc(collection(db, 'challenges', challengeId, 'entries'), {
        challengeId, userId, userName, outfitId,
        note: note || '',
        likeCount: 0,
        createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'challenges', challengeId), {
        participantCount: increment(1)
    });
}

export function subscribeToChallengeEntries(
    challengeId: string,
    callback: (entries: ChallengeEntry[]) => void
): () => void {
    const q = query(
        collection(db, 'challenges', challengeId, 'entries'),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChallengeEntry)));
    }, error => {
        console.error("subscribeToChallengeEntries error:", error);
    });
}
