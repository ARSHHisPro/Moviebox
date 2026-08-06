import React, { useState, useEffect } from 'react';
import { Award, X, Sparkles, CheckCircle, HelpCircle, Trophy, RefreshCw } from 'lucide-react';
import { toast } from '../services/toast';
import { getLeaderboardTop, submitTriviaScore, LeaderboardEntry } from '../services/firestoreSync';

interface TriviaGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRIVIA_QUESTIONS = [
  {
    question: "Which movie won the Best Picture Oscar in 2024?",
    options: ["Oppenheimer", "Barbie", "Poor Things", "Killers of the Flower Moon"],
    correct: 0
  },
  {
    question: "Who directed the mind-bending sci-fi film 'Inception' (2010)?",
    options: ["Denis Villeneuve", "Christopher Nolan", "Quentin Tarantino", "Steven Spielberg"],
    correct: 1
  },
  {
    question: "In 'Interstellar', what is the name of the main astronaut played by Matthew McConaughey?",
    options: ["Cooper", "Murph", "Brand", "TARS"],
    correct: 0
  },
  {
    question: "Which fictional kingdom is the setting for Marvel's 'Black Panther'?",
    options: ["Genovia", "Wakanda", "Sokovia", "Latveria"],
    correct: 1
  },
  {
    question: "What is the highest-grossing movie of all time (unadjusted for inflation)?",
    options: ["Avengers: Endgame", "Titanic", "Avatar", "Star Wars: The Force Awakens"],
    correct: 2
  }
];

export const TriviaGameModal: React.FC<TriviaGameModalProps> = ({ isOpen, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLb, setLoadingLb] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen]);

  const loadLeaderboard = async () => {
    setLoadingLb(true);
    const top = await getLeaderboardTop();
    setLeaderboard(top);
    setLoadingLb(false);
  };

  if (!isOpen) return null;

  const handleSelectOption = (idx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);

    if (idx === TRIVIA_QUESTIONS[currentIdx].correct) {
      setScore((prev) => prev + 100);
      toast.success('+100 PTS! Correct Answer!');
    } else {
      toast.error('Incorrect option!');
    }

    setTimeout(() => {
      if (currentIdx + 1 < TRIVIA_QUESTIONS.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOpt(null);
      } else {
        setIsFinished(true);
        // Submit score to Firestore
        submitTriviaScore({
          userId: 'ctrlquest18',
          username: 'ctrlquest18',
          avatar: '',
          score: score + (idx === TRIVIA_QUESTIONS[currentIdx].correct ? 100 : 0),
          streak: 5,
          rankTitle: 'Master Cinephile',
          updatedAt: Date.now()
        });
        loadLeaderboard();
      }
    }, 1200);
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setScore(0);
    setIsFinished(false);
  };

  const q = TRIVIA_QUESTIONS[currentIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel border border-amber-500/40 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                MovieBox Cinephile Quiz
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                  {score} PTS
                </span>
              </h2>
              <p className="text-xs text-slate-400">Test your film knowledge & climb the Firestore leaderboard</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quiz Body */}
        {!isFinished ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Question {currentIdx + 1} of {TRIVIA_QUESTIONS.length}</span>
              <span className="text-amber-400">{score} Points</span>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-base font-bold text-white leading-relaxed">
              {q.question}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt, idx) => {
                let btnStyle = "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200";
                if (selectedOpt !== null) {
                  if (idx === q.correct) {
                    btnStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold";
                  } else if (idx === selectedOpt) {
                    btnStyle = "bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={selectedOpt !== null}
                    className={`p-4 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {selectedOpt !== null && idx === q.correct && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">Challenge Completed!</h3>
              <p className="text-xs text-slate-400 mt-1">Final Score: <span className="font-bold text-amber-400 text-lg">{score} PTS</span></p>
            </div>

            {/* Leaderboard Table */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-left space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Firestore Hall of Fame
              </h4>
              <div className="space-y-2">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white/5">
                      <span className="font-bold text-white">#{idx + 1} {entry.username}</span>
                      <span className="font-mono text-amber-400 font-bold">{entry.score} PTS</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 text-center py-2">Rank #1 — ctrlquest18 ({score} PTS)</div>
                )}
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
