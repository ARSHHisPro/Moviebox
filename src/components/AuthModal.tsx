import React, { useState } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../services/auth';
import { Film, Lock, Mail, User, Sparkles, LogIn, Chrome, X } from 'lucide-react';
import { toast } from '../services/toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          toast.error('Please enter a display name');
          setIsLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
        toast.success(`Account created! Welcome ${displayName}`);
      } else {
        await signInWithEmail(email, password);
        toast.success('Signed in successfully!');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Authentication failed. Please check credentials.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        toast.error('Invalid email or password');
      } else if (msg.includes('auth/email-already-in-use')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else if (msg.includes('auth/weak-password')) {
        toast.error('Password should be at least 6 characters');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      toast.success(`Welcome ${user.username}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(err.message || 'Google Sign-In failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl bg-slate-950/95 text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          title="Continue as Guest"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7b2cbf] to-[#00d2ff] p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-[#00d2ff]/30">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <Film className="w-6 h-6 text-[#00d2ff]" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Welcome to MovieBox+</h2>
          <p className="text-xs text-white/60">
            {isSignUp ? 'Create your personal account to sync favorites & watchlists' : 'Sign in to access 4K movies & TV streams'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-white/5 rounded-2xl border border-white/10 text-xs mb-6">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              !isSignUp ? 'bg-[#00d2ff] text-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              isSignUp ? 'bg-[#00d2ff] text-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Google Quick Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md mb-4 disabled:opacity-50"
        >
          <Chrome className="w-4 h-4 text-blue-600" />
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center mb-4">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-slate-950 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-bold absolute">
            Or with Email
          </span>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Cinema"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7b2cbf] to-[#00d2ff] hover:brightness-110 font-bold text-xs text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00d2ff]/20 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition-colors underline font-medium cursor-pointer"
          >
            Continue as Guest
          </button>
        </div>

      </div>
    </div>
  );
};
