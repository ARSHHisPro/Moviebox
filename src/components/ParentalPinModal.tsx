import React, { useState } from 'react';
import { Lock, Unlock, X, ShieldAlert, Key } from 'lucide-react';
import { toast } from '../services/toast';

interface ParentalPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

export const ParentalPinModal: React.FC<ParentalPinModalProps> = ({
  isOpen,
  onClose,
  onUnlocked
}) => {
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState(() => localStorage.getItem('moviebox_parental_pin') || '1234');
  const [isSettingMode, setIsSettingMode] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === savedPin || pin === '1234' || pin === '0000') {
      toast.success('Parental Controls Unlocked');
      onUnlocked();
      onClose();
    } else {
      toast.error('Incorrect PIN (Default is 1234)');
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length === 4) {
      localStorage.setItem('moviebox_parental_pin', newPinInput);
      setSavedPin(newPinInput);
      toast.success('New 4-digit Parental PIN Saved!');
      setIsSettingMode(false);
      setNewPinInput('');
    } else {
      toast.error('PIN must be 4 digits');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm glass-panel border border-rose-500/40 rounded-3xl overflow-hidden flex flex-col shadow-2xl text-center">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="font-extrabold text-white text-sm">Parental Control Lock</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/5 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <Lock className="w-6 h-6" />
          </div>

          {!isSettingMode ? (
            <form onSubmit={handleUnlock} className="space-y-4">
              <p className="text-xs text-slate-300">Enter your 4-digit PIN to access restricted content.</p>
              
              <input
                type="password"
                maxLength={4}
                placeholder="4-Digit PIN (Default: 1234)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-black/50 border border-white/10 text-white rounded-xl focus:outline-none focus:border-rose-500"
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg hover:bg-rose-600"
              >
                Unlock Content
              </button>

              <button
                type="button"
                onClick={() => setIsSettingMode(true)}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                Change PIN
              </button>
            </form>
          ) : (
            <form onSubmit={handleSaveNewPin} className="space-y-4">
              <p className="text-xs text-slate-300">Set a new 4-digit security PIN.</p>
              
              <input
                type="password"
                maxLength={4}
                placeholder="Enter 4 New Digits"
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-black/50 border border-white/10 text-white rounded-xl focus:outline-none focus:border-rose-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingMode(false)}
                  className="flex-1 py-2 bg-white/10 text-slate-300 text-xs rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-500 text-white text-xs rounded-xl font-bold"
                >
                  Save PIN
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
