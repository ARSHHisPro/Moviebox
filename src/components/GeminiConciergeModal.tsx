import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Bot, User, Film, Compass, RefreshCw } from 'lucide-react';
import { toast } from '../services/toast';

interface GeminiConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchQuery: (query: string) => void;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export const GeminiConciergeModal: React.FC<GeminiConciergeModalProps> = ({ isOpen, onClose, onSearchQuery }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Hello! I'm your **MovieBox AI Concierge**. What kind of movie or TV show are you in the mood for today? Tell me a mood, plot theme, or favorite director!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const promptText = customPrompt || input;
    if (!promptText.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: promptText }];
    setMessages(newMessages);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          history: newMessages.slice(0, -1)
        })
      });

      if (!res.ok) {
        throw new Error('AI service response error');
      }

      const data = await res.json();
      setMessages([...newMessages, { role: 'model', content: data.text || 'I could not generate recommendations right now.' }]);
    } catch (err: any) {
      console.error(err);
      toast.error('Could not connect to Gemini AI Assistant');
      setMessages([...newMessages, { role: 'model', content: 'Apologies, I encountered a connection issue. Please make sure your GEMINI_API_KEY is configured in secrets.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Mind-bending sci-fi movies with plot twists',
    'Feel-good cozy comedy TV shows',
    'Gripping crime drama mystery miniseries',
    'Visual masterpiece animated films like Ghibli',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel border border-[var(--color-primary)]/40 rounded-3xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] shadow-2xl shadow-[var(--color-primary-glow)]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-[var(--color-primary)] p-0.5 flex items-center justify-center shadow-lg shadow-[var(--color-primary-glow)]">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[var(--color-primary)] animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                MovieBox AI Concierge
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-bold border border-[var(--color-primary)]/30">
                  Gemini Powered
                </span>
              </h2>
              <p className="text-xs text-slate-400">Smart cinematic recommendations & plot insights</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-white rounded-tr-none font-medium'
                    : 'glass-panel border-white/10 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.content}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="glass-panel border-white/10 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--color-primary)]" />
                Analyzing film archives...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-black/20 border-t border-white/5 flex gap-2 overflow-x-auto scrollbar-none">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all flex-shrink-0"
            >
              ✨ {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 border-t border-white/10 bg-black/60 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask for recommendations, plot twists, actor filmography..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm rounded-2xl px-4 py-2.5 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-white hover:brightness-110 disabled:opacity-50 transition-all shadow-md shadow-[var(--color-primary-glow)]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
