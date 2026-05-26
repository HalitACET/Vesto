"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { deletePost } from "@/lib/firebase/forumService";

interface Props {
    postId: string;
    onDelete: () => void;
}

export function PostDeleteButton({ postId, onDelete }: Props) {
    const [confirming, setConfirming] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!confirming) {
            setConfirming(true);
            return;
        }

        try {
            await deletePost(postId);
            onDelete();
        } catch (err) {
            console.error("Error deleting post:", err);
        }
    };

    useEffect(() => {
        if (confirming) {
            const timer = setTimeout(() => setConfirming(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [confirming]);

    return (
        <button
            onClick={handleDelete}
            className={`p-1.5 rounded-full transition-all duration-200 ml-auto active:scale-95 ${
                confirming
                    ? "bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30 scale-105"
                    : "text-muted-foreground hover:text-red-600 hover:bg-red-500/10"
            }`}
            title={confirming ? "Silmek için tekrar tıklayın" : "Paylaşımı Sil"}
        >
            <Trash2 size={16} />
        </button>
    );
}
