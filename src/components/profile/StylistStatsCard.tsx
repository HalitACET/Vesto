'use client';

import { VestoUser } from '@/types';

export function StylistStatsCard({ user }: { user: VestoUser }) {
  const acceptRate = user.suggestionsSent > 0
    ? Math.round((user.suggestionsAccepted / user.suggestionsSent) * 100)
    : 0;

  const isTrusted = acceptRate >= 70 && user.suggestionsSent >= 5;

  return (
    <div className="bg-white border border-mist rounded-lg p-6 my-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span>✨</span>
          <h3 className="font-inter text-xs font-semibold uppercase
                         tracking-widest text-stone">
            Stilist İstatistikleri
          </h3>
        </div>
        {isTrusted && (
          <span className="flex items-center gap-1 px-2 py-1
                           bg-amber-50 text-amber-700 rounded-full
                           font-inter text-xs font-semibold">
            ✓ Güvenilir
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatItem value={`${user.suggestionsSent ?? 0}`} label="Öneri" />
        <StatItem value={`%${acceptRate}`} label="Kabul" />
        <StatItem
          value={(user.ratingCount ?? 0) > 0
            ? (user.averageRating ?? 0).toFixed(1)
            : '—'}
          label="Puan"
          showStar={(user.ratingCount ?? 0) > 0}
        />
      </div>
    </div>
  );
}

function StatItem({
  value, label, showStar
}: {
  value: string;
  label: string;
  showStar?: boolean;
}) {
  return (
    <div className="text-center">
      <div className="font-playfair text-2xl text-onyx flex items-center
                      justify-center gap-1">
        {showStar && <span className="text-amber-400 text-lg">★</span>}
        {value}
      </div>
      <div className="font-inter text-xs text-stone mt-1">{label}</div>
    </div>
  );
}
