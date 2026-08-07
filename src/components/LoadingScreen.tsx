import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const QUOTES = [
  "Movies are dreams you never forget...",
  "Every frame tells a thousand stories.",
  "Cinema is a matter of what's in the frame and what's out.",
  "The best stories are the ones that stay with you.",
  "Lights, camera, escape reality.",
  "Your next favorite story is one click away.",
  "Great movies don't just entertain, they transform.",
  "Where stories come alive in 4K.",
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    const duration = 2200;
    const interval = 30;
    const steps = duration / interval;
    let current = 0;

    const timer = setInterval(() => {
      current += 100 / steps;
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
        setTimeout(onComplete, 400);
      }
      setProgress(Math.floor(current));
    }, interval);

    const quoteInterval = setInterval(() => {
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, 1800);

    return () => {
      clearInterval(timer);
      clearInterval(quoteInterval);
    };
  }, [onComplete]);

  return (
    <div className="loading-screen" id="loading-screen">
      <div className="loading-particles" id="loading-particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="loading-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${4 + Math.random() * 6}s`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5 + 0.1,
            }}
          />
        ))}
      </div>

      <div className="loading-content">
        <div className="loading-logo-container mb-8">
          <svg viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg" className="w-64 mx-auto">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#E50914' }} />
                <stop offset="50%" style={{ stopColor: '#7B2FBE' }} />
                <stop offset="100%" style={{ stopColor: '#00D4FF' }} />
              </linearGradient>
              <filter id="logoGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#logoGlow)">
              <text
                x="20"
                y="52"
                fontFamily="'Poppins', 'Inter', system-ui, sans-serif"
                fontSize="44"
                fontWeight="800"
                fill="url(#logoGradient)"
                letterSpacing="-1"
              >
                MovieBox
              </text>
              <rect x="18" y="58" width="264" height="3" fill="url(#logoGradient)" rx="1.5">
                <animate attributeName="width" values="0;264;264;0" dur="3s" repeatCount="indefinite" />
              </rect>
              <circle cx="275" cy="38" r="7" fill="#E50914">
                <animate attributeName="r" values="7;10;7" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          </svg>
        </div>

        <div className="loading-spinner">
          <div className="spinner-ring" />
          <div className="spinner-ring" />
          <div className="spinner-ring" />
        </div>

        <div className="loading-progress-container">
          <div className="loading-progress-bar">
            <div
              className="loading-progress-fill"
              id="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="loading-percentage" id="loading-percentage">
            {progress}%
          </span>
        </div>

        <p className="loading-quote" id="loading-quote">
          "{quote}"
        </p>
      </div>
    </div>
  );
};
