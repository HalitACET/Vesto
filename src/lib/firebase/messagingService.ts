import {
    collection, addDoc, getDocs, query, orderBy, onSnapshot,
    serverTimestamp, where, limit, Timestamp
} from 'firebase/firestore';
import { db } from './config';

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    createdAt: Timestamp | null;
    type: 'text' | 'outfit_ref';
    outfitId?: string;
}

export interface Conversation {
    id: string;
    participants: [string, string]; // [userId, stylistId]
    lastMessage?: string;
    lastMessageAt?: Timestamp | null;
    userDisplayName?: string;
    stylistDisplayName?: string;
}

// Get or create a conversation between user and stylist
export async function getOrCreateConversation(userId: string, stylistId: string): Promise<string> {
    const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId)
    );
    const snapshot = await getDocs(q);
    const existing = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(stylistId);
    });
    if (existing) return existing.id;
    
    const ref = await addDoc(collection(db, 'conversations'), {
        participants: [userId, stylistId],
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
    });
    return ref.id;
}

// Subscribe to messages in a conversation
export function subscribeToMessages(
    conversationId: string,
    callback: (messages: ChatMessage[]) => void
): () => void {
    const q = query(
        collection(db, 'conversations', conversationId, 'messages'),
        orderBy('createdAt', 'asc'),
        limit(100)
    );
    return onSnapshot(q, snap => {
        const msgs = snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
        })) as ChatMessage[];
        callback(msgs);
    }, (error) => {
        console.error("subscribeMessages error:", error);
    });
}

// Send a message
export async function sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    text: string
): Promise<void> {
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        senderId,
        senderName,
        text: text.trim(),
        createdAt: serverTimestamp(),
        type: 'text',
    });
}

// Get user's conversations
export function subscribeToConversations(
    userId: string,
    callback: (convs: Conversation[]) => void
): () => void {
    const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
    );
    return onSnapshot(q, snap => {
        const convs = snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
        })) as Conversation[];
        callback(convs);
    }, (error) => {
        console.error("subscribeConversations error:", error);
    });
}
