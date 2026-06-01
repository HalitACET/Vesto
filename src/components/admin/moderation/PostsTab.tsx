'use client';

import { useState, useEffect } from 'react';
import { getAllPosts, removePost,
         restorePost } from '@/lib/firebase/moderationService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function PostsTab() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'moderated'>('all');

  useEffect(() => { loadPosts(); }, [filter]);

  const loadPosts = async () => {
    setLoading(true);
    const data = await getAllPosts(filter);
    setPosts(data);
    setLoading(false);
  };

  return (
    <div>
      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {([
          { key: 'all', label: 'Tüm Postlar' },
          { key: 'moderated', label: 'Kaldırılanlar' },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-3 py-1.5 rounded font-inter text-xs font-medium transition',
              filter === f.key
                ? 'bg-onyx text-pearl'
                : 'bg-mist text-stone hover:bg-stone/20'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-12 bg-mist rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-mist rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-mist/50">
              <tr>
                <th className="text-left p-3 font-inter text-xs
                               font-semibold uppercase tracking-widest
                               text-stone">
                  Yazar
                </th>
                <th className="text-left p-3 font-inter text-xs
                               font-semibold uppercase tracking-widest
                               text-stone">
                  Açıklama
                </th>
                <th className="text-left p-3 font-inter text-xs
                               font-semibold uppercase tracking-widest
                               text-stone">
                  Beğeni
                </th>
                <th className="text-left p-3 font-inter text-xs
                               font-semibold uppercase tracking-widest
                               text-stone">
                  Durum
                </th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist">
              {posts.map((post: any) => (
                <tr key={post.id} className={cn(
                  'hover:bg-mist/20 transition',
                  post.isModerated && 'bg-red-50/30'
                )}>
                  <td className="p-3">
                    <span className="font-inter text-sm text-onyx font-medium">
                      {post.authorDisplayName}
                    </span>
                  </td>
                  <td className="p-3 max-w-xs">
                    <p className="font-inter text-sm text-stone truncate" title={post.caption}>
                      {post.caption || '—'}
                    </p>
                  </td>
                  <td className="p-3">
                    <span className="font-inter text-sm text-stone">
                      ♥ {post.likeCount ?? 0}
                    </span>
                  </td>
                  <td className="p-3">
                    {post.isModerated ? (
                      <span className="px-2 py-1 bg-red-50 text-red-700
                                       rounded-full font-inter text-xs font-semibold">
                        Kaldırıldı
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-50 text-green-700
                                       rounded-full font-inter text-xs font-semibold">
                        Aktif
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {post.isModerated ? (
                      <button
                        onClick={async () => {
                          await restorePost(post.id);
                          toast.success('Post geri yüklendi');
                          loadPosts();
                        }}
                        className="px-3 py-1 border border-mist text-stone
                                   rounded font-inter text-xs font-medium
                                   hover:border-onyx hover:text-onyx transition"
                      >
                        Geri Yükle
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          if (!confirm('Bu postu kaldırmak istiyor musun?'))
                            return;
                          await removePost(post.id, 'Admin kaldırdı');
                          toast.success('Post kaldırıldı');
                          loadPosts();
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded
                                   font-inter text-xs font-medium hover:bg-red-700 transition"
                      >
                        Kaldır
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone font-inter text-sm">
                    Kayıt bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
