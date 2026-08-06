import React, { useState, useEffect } from 'react';
import { Star, X, ThumbsUp, MessageSquare, Send, Sparkles } from 'lucide-react';
import { toast } from '../services/toast';
import { addMediaReview, subscribeToMediaReviews, CommunityReview } from '../services/firestoreSync';
import { getCurrentUser } from '../services/auth';

interface CommunityReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  mediaTitle: string;
}

export const CommunityReviewsModal: React.FC<CommunityReviewsModalProps> = ({
  isOpen,
  onClose,
  mediaId,
  mediaType,
  mediaTitle
}) => {
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [rating, setRating] = useState<number>(9);
  const [reviewText, setReviewText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !mediaId) return;
    setIsLoading(true);
    const unsubscribe = subscribeToMediaReviews(mediaId, (list) => {
      setReviews(list);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [isOpen, mediaId]);

  if (!isOpen) return null;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const currentUser = getCurrentUser();
    const userId = currentUser ? currentUser.uid : 'guest-' + Date.now();
    const username = currentUser ? currentUser.displayName : 'Guest Cinephile';
    const userAvatar = currentUser ? currentUser.avatar : '';

    try {
      await addMediaReview({
        mediaId,
        mediaType,
        mediaTitle,
        userId,
        username,
        userAvatar,
        rating,
        reviewText: reviewText.trim(),
        upvotes: 0,
        createdAt: Date.now()
      });
      toast.success('Review posted to Firestore community hub!');
      setReviewText('');
    } catch (e) {
      toast.error('Failed posting review');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel border border-[var(--color-primary)]/40 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg">
                Community Reviews
              </h2>
              <p className="text-xs text-slate-400">Audience ratings & reviews for <span className="text-white font-bold">{mediaTitle}</span></p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Post Review Form */}
          <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[var(--color-primary)]" /> Write Your Review
            </h3>

            {/* Rating Stars */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Your Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-0.5 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-extrabold text-amber-400 ml-1">{rating}/10</span>
            </div>

            <textarea
              rows={3}
              placeholder="What did you think of the plot, direction, acting, or visual effects?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full bg-black/50 border border-white/10 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[var(--color-primary)] resize-none"
            />

            <button
              type="submit"
              disabled={!reviewText.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Submit Review
            </button>
          </form>

          {/* Reviews List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Recent Reviews ({reviews.length})
            </h4>

            {reviews.length > 0 ? (
              reviews.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{r.username}</span>
                    <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" /> {r.rating}/10
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{r.reviewText}</p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-white/5 rounded-2xl border border-white/5">
                No community reviews yet for this title. Be the first cinephile to share your thoughts!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
