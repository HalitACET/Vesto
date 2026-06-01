"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeRecommendationsByStatus,
         acceptRecommendation,
         rejectRecommendation,
         rateRecommendation } from '@/lib/firebase/stylistService';
import { OutfitRecommendation } from '@/types/stylist';
import { toast } from 'sonner';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from '@/lib/utils';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Inbox } from 'lucide-react';
import { RatingDialog } from '@/components/recommendations/RatingDialog';
import Image from "next/image";

type TabType = 'pending' | 'accepted' | 'rejected';

export default function RecommendationsPage() {
  const { vestoUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingRec, setRatingRec] = useState<OutfitRecommendation | null>(null);

  useEffect(() => {
    if (!vestoUser) return;
    setLoading(true);
    const unsubscribe = subscribeRecommendationsByStatus(
      activeTab,
      (recs) => {
        setRecommendations(recs);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [activeTab, vestoUser]);

  const handleAccept = async (rec: OutfitRecommendation) => {
    try {
      await acceptRecommendation(rec);
      setRatingRec(rec);
    } catch {
      toast.error('Bir hata oluştu');
    }
  };

  const handleRate = async (rating: number) => {
    if (!ratingRec) return;
    await rateRecommendation(ratingRec.id, rating);
    toast.success(`${rating} yıldız verildi! Kombin eklendi.`);
    setRatingRec(null);
  };

  const handleReject = async (recId: string) => {
    if (!confirm('Bu öneriyi reddetmek istediğinden emin misin?')) return;
    try {
      await rejectRecommendation(recId);
      toast.success('Öneri reddedildi');
    } catch {
      toast.error('Bir hata oluştu');
    }
  };

  if (!vestoUser) return null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-playfair text-3xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Inbox className="text-foreground" />
          Kombin Önerileri
        </h1>

        {/* Tab Bar */}
        <div className="flex border-b border-border mb-6">
          {(['pending', 'accepted', 'rejected'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 pb-3 font-inter text-xs font-semibold uppercase tracking-widest transition-colors',
                activeTab === tab
                  ? 'text-foreground border-b-2 border-foreground -mb-px'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab === 'pending' ? 'Bekleyen'
                : tab === 'accepted' ? 'Kabul'
                : 'Red'}
            </button>
          ))}
        </div>

        {/* İçerik */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-16">
            <Inbox size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="font-inter text-sm text-muted-foreground">
              {activeTab === 'pending' ? 'Bekleyen öneri yok'
                : activeTab === 'accepted' ? 'Kabul edilen öneri yok'
                : 'Reddedilen öneri yok'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.map(rec => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                showActions={activeTab === 'pending'}
                onAccept={() => handleAccept(rec)}
                onReject={() => handleReject(rec.id)}
              />
            ))}
          </div>
        )}
      </div>

      {ratingRec && (
        <RatingDialog
          stylistName={ratingRec.stylistDisplayName}
          onRate={handleRate}
          onSkip={() => {
            setRatingRec(null);
            toast.success('🎉 Kombin kabul edildi ve dolabına eklendi!');
          }}
        />
      )}
    </DashboardLayout>
  );
}

function RecommendationCard({
  recommendation, showActions, onAccept, onReject
}: {
  recommendation: OutfitRecommendation;
  showActions: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Stilist */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center border border-border">
          {recommendation.stylistPhotoUrl ? (
            <Image width={800} height={800} src={recommendation.stylistPhotoUrl} className="w-full h-full object-cover" alt="Stylist" />
          ) : (
            <span className="font-inter text-sm font-semibold text-foreground">
              {recommendation.stylistDisplayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <p className="font-inter text-sm font-semibold text-foreground">
            {recommendation.stylistDisplayName}
          </p>
          <p className="font-inter text-xs text-muted-foreground">
            kombin önerdi
          </p>
        </div>
        {/* Status badge */}
        {!showActions && (
          <span className={cn(
            'px-3 py-1 rounded-full font-inter text-xs font-semibold',
            recommendation.status === 'accepted'
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          )}>
            {recommendation.status === 'accepted'
              ? 'Kabul Edildi'
              : 'Reddedildi'}
          </span>
        )}
      </div>

      {/* Outfit 2x2 preview */}
      <div className="grid grid-cols-2 gap-1 w-48 aspect-square rounded-lg overflow-hidden mb-4 bg-muted/20 border border-border">
        {[
          recommendation.items.topId,
          recommendation.items.bottomId,
          recommendation.items.shoesId,
          recommendation.items.accessoryId,
        ].map((itemId, i) => (
          <ItemThumb key={i} itemId={itemId} />
        ))}
      </div>

      {/* Not */}
      {recommendation.note && (
        <p className="font-inter text-sm text-foreground italic mb-4 border-l-2 border-accent pl-3 py-1">
          "{recommendation.note}"
        </p>
      )}

      {/* Kabul/Red */}
      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setAccepting(true);
              await onAccept();
              setAccepting(false);
            }}
            disabled={accepting || rejecting}
            className="flex-1 py-2 bg-primary text-primary-foreground rounded-md font-inter text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50"
          >
            {accepting ? 'Kabul ediliyor...' : 'Kabul Et'}
          </button>
          <button
            onClick={async () => {
              setRejecting(true);
              await onReject();
              setRejecting(false);
            }}
            disabled={accepting || rejecting}
            className="flex-1 py-2 border border-input text-foreground rounded-md font-inter text-sm font-medium hover:bg-accent hover:text-accent-foreground transition disabled:opacity-50"
          >
            {rejecting ? 'Reddediliyor...' : 'Reddet'}
          </button>
        </div>
      )}
    </div>
  );
}

function ItemThumb({ itemId }: { itemId?: string | null }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) return;
    getDoc(doc(db, 'wardrobeItems', itemId)).then(snap => {
      const data = snap.data();
      if (data) setImageUrl(data.bgRemovedUrl ?? data.imageUrl);
    });
  }, [itemId]);

  if (!itemId || !imageUrl) {
    return <div className="bg-muted w-full h-full" />;
  }

  return (
    <Image width={800} height={800}
      src={imageUrl}
      className="w-full h-full object-cover"
      alt="Kıyafet"
    />
  );
}
