'use client';

import { useState } from 'react';

export function RatingDialog({
  stylistName, onRate, onSkip
}: {
  stylistName: string;
  onRate: (rating: number) => void;
  onSkip: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center
                    justify-center z-50 p-4">
      <div className="bg-pearl rounded-lg p-6 max-w-sm w-full">
        <h3 className="font-playfair text-lg text-onyx mb-2">
          {stylistName} için puan ver
        </h3>
        <p className="font-inter text-sm text-stone mb-6">
          Bu öneriden ne kadar memnun kaldın?
        </p>

        {/* Yıldızlar */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="text-3xl transition-transform hover:scale-110"
            >
              <span className={
                star <= (hover || rating)
                  ? 'text-amber-400'
                  : 'text-stone/40'
              }>
                ★
              </span>
            </button>
          ))}
        </div>

        {/* Butonlar */}
        <div className="flex gap-2">
          <button
            onClick={onSkip}
            className="flex-1 py-2 text-stone font-inter text-sm"
          >
            Geç
          </button>
          <button
            onClick={() => rating > 0 && onRate(rating)}
            disabled={rating === 0}
            className="flex-1 py-2 bg-onyx text-pearl rounded
                       font-inter text-sm font-semibold
                       disabled:opacity-50"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
