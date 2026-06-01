'use client';

import { useState, useEffect } from 'react';
import {
  collection, query, orderBy, limit, getDocs, where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { removeComment } from '@/lib/firebase/moderationService';
import { toast } from 'sonner';

export function CommentsTab() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadComments(); }, []);

  const loadComments = async () => {
    setLoading(true);
    const snap = await getDocs(query(
      collection(db, 'forumComments'),
      where('isArchived', '==', false),
      orderBy('createdAt', 'desc'),
      limit(50),
    ));
    setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  return (
    <div>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i}
                 className="h-16 bg-mist rounded animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-inter text-sm text-stone">
            Kayıt bulunamadı
          </p>
        </div>
      ) : (
        <div className="divide-y divide-mist bg-white
                        border border-mist rounded-lg shadow-sm">
          {comments.map((comment: any) => (
            <div key={comment.id}
                 className="flex items-center gap-4 p-4 hover:bg-mist/10 transition">
              <div className="flex-1">
                <p className="font-inter text-sm font-semibold text-onyx">
                  {comment.authorDisplayName}
                </p>
                <p className="font-inter text-sm text-stone mt-0.5">
                  {comment.text}
                </p>
              </div>
              <button
                onClick={async () => {
                  if (!confirm('Bu yorumu kaldırmak istiyor musun?'))
                    return;
                  await removeComment(comment.id);
                  toast.success('Yorum kaldırıldı');
                  loadComments();
                }}
                className="px-3 py-1 bg-red-600 text-white rounded
                           font-inter text-xs font-medium hover:bg-red-700
                           whitespace-nowrap transition"
              >
                Kaldır
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
