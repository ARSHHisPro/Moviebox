import React, { useState } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../services/auth';
import { Film, Lock, Mail, User, Sparkles, LogIn, Chrome } from 'lucide-react';
import { toast } from '../services/toast';
import { OwnerNoticeBanner } from '../components/OwnerNoticeBanner';

interface AuthPageProps {
  onNavigate: (route: string) => void;
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      if (onSuccess) {
        onSuccess();
      } else {
        onNavigate('home');
      }
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
      if (onSuccess) {
        onSuccess();
      } else {
        onNavigate('home');
      }
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
    <div className="space-y-6">
      {/* Notice Banner */}
      <OwnerNoticeBanner />

      <div className="max-w-md mx-auto my-8 px-4">
        <div className="glass-panel p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6 bg-black/90">
          
          {/* Logo Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--color-secondary)] to-[#00d2ff] p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-[#00d2ff]/30">
              <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                <Film className="w-6 h-6 text-[#00d2ff]" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white">MovieBox Authentication</h1>
            <p className="text-xs text-white/60">
              {isSignUp ? 'Create your free account to unlock 4K streaming' : 'Sign in with Firebase to access movies & TV streams'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 bg-white/5 rounded-2xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
                !isSignUp ? 'bg-[#00d2ff] text-black shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
                isSignUp ? 'bg-[#00d2ff] text-black shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <Chrome className="w-4 h-4 text-[#00d2ff]" />
            Continue with Google
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-[10px] text-white/40 font-bold uppercase tracking-wider">or email</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isSignUp && (
              <div>
                <label className="font-bold text-white/80 block mb-1">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cinema Enthusiast"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="font-bold text-white/80 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#00d2ff]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-white/80 block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#00d2ff]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--color-secondary)] to-[#00d2ff] text-white font-bold text-xs shadow-lg shadow-[#00d2ff]/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'Processing...' : (isSignUp ? 'Create Firebase Account' : 'Sign In')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

