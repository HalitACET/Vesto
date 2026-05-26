"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { shareOutfit } from "@/lib/firebase/forumService";
import { useTranslations } from "next-intl";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreatePostDialog({ open, onOpenChange, onSuccess }: Props) {
    const t = useTranslations("forum");
    const [caption, setCaption] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!caption.trim()) return;
        setLoading(true);
        try {
            await shareOutfit(null, caption);
            setCaption("");
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Error creating post:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-lg">
                <DialogHeader className="mb-4">
                    <DialogTitle className="font-playfair text-2xl text-card-foreground">
                        {t("newPost")}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                        Topluluğa sormak istediğiniz bir soruyu veya düşüncelerinizi paylaşın.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder={t("writeCaption")}
                        maxLength={280}
                        rows={4}
                        className="w-full p-4 rounded-xl border border-border text-sm outline-none resize-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 bg-muted/30 font-inter text-foreground placeholder:text-muted-foreground/40"
                    />
                    <div className="flex justify-end text-xs text-muted-foreground/50 pr-1">
                        {caption.length} / 280
                    </div>
                </div>

                <DialogFooter className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-md transition-all active:scale-95 h-10 px-5"
                    >
                        Vazgeç
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !caption.trim()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-all active:scale-95 h-10 px-5"
                    >
                        {loading ? "Paylaşılıyor..." : t("publish")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
