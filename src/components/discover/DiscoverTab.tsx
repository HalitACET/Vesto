'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  searchUsers,
  getTopStylists,
  getFeaturedUsers,
  getNewUsers
} from '@/lib/firebase/discoverService';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from "next/image";

export function DiscoverTab() {
  const { vestoUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [stylists, setStylists] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [newUsers, setNewUsers] = useState<any[]>([]);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Arama
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    searchUsers(debouncedQuery).then((results) => {
      setSearchResults(
        results.filter((u: any) => u.id !== vestoUser?.uid)
      );
      setSearchLoading(false);
    });
  }, [debouncedQuery, vestoUser?.uid]);

  // Keşfet verilerini yükle
  useEffect(() => {
    getTopStylists().then(setStylists);
    getFeaturedUsers().then(setFeatured);
    getNewUsers().then(setNewUsers);
  }, []);

  const isSearching = searchQuery.length >= 2;

  return (
    <div>
      {/* Arama Çubuğu */}
      <div className="border-b border-stone/30 focus-within:border-onyx transition-colors mb-6">
        <div className="flex items-center gap-3 py-2">
          <Search className="w-4 h-4 text-graphite flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kullanıcı ara..."
            className="flex-1 bg-transparent font-inter text-sm text-onyx placeholder:text-stone outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X className="w-4 h-4 text-graphite" />
            </button>
          )}
        </div>
      </div>

      {/* Arama Sonuçları */}
      {isSearching ? (
        <SearchResults
          results={searchResults}
          loading={searchLoading}
          query={searchQuery}
        />
      ) : (
        /* Keşfet İçeriği */
        <div className="space-y-8">
          <DiscoverSection
            title="Stilistler"
            icon="✨"
            users={stylists.filter(u => u.id !== vestoUser?.uid)}
          />
          <DiscoverSection
            title="Öne Çıkanlar"
            icon="🔥"
            users={featured.filter(u => u.id !== vestoUser?.uid)}
          />
          <DiscoverSection
            title="Yeni Katıldı"
            icon="🌟"
            users={newUsers.filter(u => u.id !== vestoUser?.uid)}
          />
        </div>
      )}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-mist" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-mist rounded w-1/3" />
            <div className="h-3 bg-mist rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchResults({
  results, loading, query
}: {
  results: any[];
  loading: boolean;
  query: string;
}) {
  if (loading) return <SearchSkeleton />;

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-inter text-sm text-stone">
          "{query}" için sonuç bulunamadı
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-mist">
      {results.map(user => (
        <UserListRow key={user.id} user={user} />
      ))}
    </div>
  );
}

function DiscoverSection({
  title, icon, users
}: {
  title: string;
  icon: string;
  users: any[];
}) {
  if (users.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span>{icon}</span>
        <h3 className="font-inter text-xs font-semibold uppercase tracking-widest text-stone">
          {title}
        </h3>
      </div>

      {/* Yatay scroll */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {users.map(user => (
          <UserAvatarCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}

function UserAvatarCard({ user }: { user: any }) {
  return (
    <Link href={`/u/${user.id}`}>
      <div className="flex flex-col items-center gap-2 w-[72px] flex-shrink-0 cursor-pointer">
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-mist flex items-center justify-center overflow-hidden">
            {user.photoURL ? (
              <Image width={800} height={800}
                src={user.photoURL}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-inter text-xl text-onyx">
                {user.displayName?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Stilist rozeti */}
          {user.isStylistModeActive && (
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-onyx rounded-full flex items-center justify-center">
              <span className="text-[8px]">✨</span>
            </div>
          )}
        </div>

        <span className="font-inter text-xs text-onyx text-center truncate w-full">
          {user.displayName?.split(' ')[0]}
        </span>
      </div>
    </Link>
  );
}

function UserListRow({ user }: { user: any }) {
  return (
    <Link href={`/u/${user.id}`}>
      <div className="flex items-center gap-3 py-3 hover:bg-mist/30 transition-colors cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-mist flex items-center justify-center overflow-hidden">
          {user.photoURL ? (
            <Image width={800} height={800} src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="font-inter text-sm text-onyx">
              {user.displayName?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-inter text-sm font-medium text-onyx truncate">
            {user.displayName}
          </p>
          {user.username && (
            <p className="font-inter text-xs text-stone">
              @{user.username}
            </p>
          )}
        </div>

        {user.isStylistModeActive && (
          <span className="px-2 py-1 bg-onyx text-pearl rounded-full font-inter text-[10px] font-semibold">
            Stilist
          </span>
        )}
      </div>
    </Link>
  );
}
