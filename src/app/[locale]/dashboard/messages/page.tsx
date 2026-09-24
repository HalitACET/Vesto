"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, MessageSquare, ArrowLeft } from "lucide-react";
import {
    Conversation,
    ChatMessage,
    getOrCreateConversation,
    subscribeToConversations,
    subscribeToMessages,
    sendMessage
} from "@/lib/firebase/messagingService";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";

interface ProfileCache {
    [uid: string]: {
        displayName: string;
        photoURL?: string;
        photoUrl?: string;
    };
}

export default function MessagesPage() {
    const { vestoUser } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("chat");
    const dateLocale = locale === "tr" ? tr : enUS;

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [profiles, setProfiles] = useState<ProfileCache>({});
    
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const targetChatUid = searchParams.get("chat");

    // Scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 1. Subscribe to conversations list
    useEffect(() => {
        if (!vestoUser?.uid) return;

        setLoadingConvs(true);
        const unsub = subscribeToConversations(vestoUser.uid, (convs) => {
            setConversations(convs);
            setLoadingConvs(false);
        });

        return () => unsub();
    }, [vestoUser?.uid]);

    // 2. Fetch profiles of participants to show avatars & names
    useEffect(() => {
        const uidsToFetch = new Set<string>();
        conversations.forEach((c) => {
            c.participants.forEach((p) => {
                if (p !== vestoUser?.uid && !profiles[p]) {
                    uidsToFetch.add(p);
                }
            });
        });

        if (uidsToFetch.size === 0) return;

        const fetchProfiles = async () => {
            const updated = { ...profiles };
            for (const uid of uidsToFetch) {
                try {
                    const snap = await getDoc(doc(db, "users", uid));
                    if (snap.exists()) {
                        const data = snap.data();
                        updated[uid] = {
                            displayName: data.displayName || t("userFallback"),
                            photoURL: data.photoURL || data.photoUrl || undefined
                        };
                    } else {
                        updated[uid] = { displayName: t("unknownUser") };
                    }
                } catch {
                    updated[uid] = { displayName: t("loadError") };
                }
            }
            setProfiles(updated);
        };

        fetchProfiles();
    }, [conversations, vestoUser?.uid, profiles, t]);

    // 3. Handle target chat initialization from URL parameter (?chat=UID)
    useEffect(() => {
        if (!vestoUser?.uid || !targetChatUid || loadingConvs) return;

        // Check if a conversation with this participant already exists
        const existing = conversations.find((c) => c.participants.includes(targetChatUid));
        
        if (existing) {
            setSelectedConv(existing);
            // Clear parameter silently
            router.replace("/dashboard/messages");
        } else {
            // Get target user details first to see who is the stylist
            const initializeChat = async () => {
                setLoadingChat(true);
                try {
                    const snap = await getDoc(doc(db, "users", targetChatUid));
                    if (snap.exists()) {
                        const targetUser = snap.data();
                        
                        // Decide customerId and stylistId based on roles
                        let customerId = vestoUser.uid;
                        let stylistId = targetChatUid;

                        if (vestoUser.role === "stylist") {
                            customerId = targetChatUid;
                            stylistId = vestoUser.uid;
                        } else if (targetUser.role === "stylist") {
                            customerId = vestoUser.uid;
                            stylistId = targetChatUid;
                        }

                        const convId = await getOrCreateConversation(customerId, stylistId);
                        
                        // Wait a brief moment for query to refresh list
                        // Set selected conversation with placeholder data
                        setSelectedConv({
                            id: convId,
                            participants: [customerId, stylistId],
                            lastMessage: ""
                        });
                    }
                } catch (err) {
                    console.error("Failed to initialize conversation:", err);
                } finally {
                    setLoadingChat(false);
                    router.replace("/dashboard/messages");
                }
            };
            initializeChat();
        }
    }, [targetChatUid, conversations, vestoUser, loadingConvs, router]);

    // 4. Subscribe to messages when selected conversation changes
    useEffect(() => {
        if (!selectedConv?.id) {
            setMessages([]);
            return;
        }

        setLoadingChat(true);
        const unsub = subscribeToMessages(selectedConv.id, (msgs) => {
            setMessages(msgs);
            setLoadingChat(false);
        });

        return () => unsub();
    }, [selectedConv?.id]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConv?.id || !vestoUser) return;

        setSending(true);
        try {
            await sendMessage(
                selectedConv.id,
                vestoUser.uid,
                vestoUser.displayName || t("me"),
                newMessage
            );
            setNewMessage("");
        } catch (err) {
            console.error("Error sending message:", err);
        } finally {
            setSending(false);
        }
    };

    const getPartnerId = (conv: Conversation) => {
        return conv.participants.find((p) => p !== vestoUser?.uid) || "";
    };

    const getPartnerProfile = (conv: Conversation) => {
        const partnerId = getPartnerId(conv);
        return profiles[partnerId] || { displayName: t("loadingName") };
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 lg:px-8 py-6 max-w-6xl h-[calc(100vh-6rem)] flex flex-col">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-[320px_1fr] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    {/* Left Pane: Conversation list */}
                    <div className={`min-h-0 flex flex-col border-r border-border ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <h2 className="font-playfair text-xl font-semibold">{t("conversations")}</h2>
                            <MessageSquare className="text-muted-foreground" size={18} />
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {loadingConvs ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-muted-foreground" size={20} />
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="text-center text-muted-foreground py-12 text-sm">
                                    {t("noConversations")}
                                </div>
                            ) : (
                                conversations.map((conv) => {
                                    const partner = getPartnerProfile(conv);
                                    const partnerId = getPartnerId(conv);
                                    const isSelected = selectedConv?.id === conv.id;
                                    
                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => setSelectedConv(conv)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                                                isSelected 
                                                    ? "bg-accent/15 border-accent/20 border" 
                                                    : "hover:bg-muted/50 border border-transparent"
                                            }`}
                                        >
                                            <Avatar className="h-10 w-10 border border-border">
                                                <AvatarImage src={partner.photoURL || partner.photoUrl || undefined} />
                                                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                                    {partner.displayName?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-sm text-foreground truncate">
                                                        {partner.displayName}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                    {conv.lastMessage || t("startConversation")}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Pane: Chat Window */}
                    <div className={`min-w-0 min-h-0 flex flex-col bg-muted/5 dark:bg-card ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
                        {selectedConv ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="md:hidden h-8 w-8 rounded-full"
                                        onClick={() => setSelectedConv(null)}
                                    >
                                        <ArrowLeft size={16} />
                                    </Button>
                                    
                                    {(() => {
                                        const partner = getPartnerProfile(selectedConv);
                                        return (
                                            <>
                                                <Avatar className="h-9 w-9 border border-border">
                                                    <AvatarImage src={partner.photoURL || partner.photoUrl || undefined} />
                                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                                        {partner.displayName?.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-semibold text-sm text-foreground">
                                                        {partner.displayName}
                                                    </h3>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                                        {t("chatLabel")}
                                                    </p>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Messages History */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {loadingChat ? (
                                        <div className="flex justify-center py-12">
                                            <Loader2 className="animate-spin text-muted-foreground" size={24} />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-2">
                                            <MessageSquare size={32} className="stroke-[1.2] opacity-40" />
                                            <p className="text-sm">{t("emptyThread")}</p>
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isMe = msg.senderId === vestoUser?.uid;
                                            
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div
                                                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm space-y-1 ${
                                                            isMe
                                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                                : "bg-muted text-foreground rounded-tl-none border border-border"
                                                        }`}
                                                    >
                                                        {!isMe && (
                                                            <p className="text-[10px] font-bold opacity-80">
                                                                {msg.senderName}
                                                            </p>
                                                        )}
                                                        <p className="leading-relaxed">{msg.text}</p>
                                                        {msg.createdAt && (
                                                            <p className="text-[9px] text-right opacity-60">
                                                                {formatDistanceToNow(msg.createdAt.toDate(), {
                                                                    addSuffix: true,
                                                                    locale: dateLocale
                                                                })}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Send Input Form */}
                                <form onSubmit={handleSend} className="p-4 border-t border-border bg-card flex gap-2">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={t("inputPlaceholder")}
                                        disabled={sending}
                                        className="flex-1 rounded-xl text-sm"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={sending || !newMessage.trim()}
                                        size="icon"
                                        className="h-10 w-10 rounded-xl flex-shrink-0"
                                    >
                                        {sending ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <Send size={16} />
                                        )}
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                                <MessageSquare size={48} className="stroke-[1.2] opacity-30 mb-4" />
                                <h3 className="font-playfair text-lg font-medium text-foreground">{t("emptyTitle")}</h3>
                                <p className="text-sm mt-1 max-w-sm">
                                    {t("emptyDescription")}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
