import React, { useState } from 'react';
import { X, Check, ShieldCheck, ArrowRight, User } from 'lucide-react';

export const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
  </svg>
);

export const FacebookIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export const SocialAuthModal = ({
  isOpen,
  onClose,
  provider = 'google', // 'google' | 'facebook'
  mode = 'signup',     // 'signup' | 'login'
  onSelectAccount,
  isLoading = false
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const isGoogle = provider === 'google';

  const defaultAccounts = isGoogle ? [
    {
      name: 'Callum Vance',
      email: 'callum.vance.golf@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    },
    {
      name: 'Arjun Patel',
      email: 'arjun.patel.golf@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    }
  ] : [
    {
      name: 'Callum Vance',
      email: 'callum.vance@facebook.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@facebook.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    }
  ];

  const handleChoose = (account) => {
    onSelectAccount({
      name: account.name,
      email: account.email,
      provider
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) return;
    onSelectAccount({
      name: customName || customEmail.split('@')[0],
      email: customEmail,
      provider
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-dark-900 border border-white/10 p-6 sm:p-7 space-y-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              {isGoogle ? <GoogleIcon className="w-5 h-5" /> : <FacebookIcon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isGoogle ? 'Sign in with Google' : 'Log in with Facebook'}
              </h3>
              <p className="text-[11px] text-slate-400">
                to continue to <strong className="text-white">Digital Heroes</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Account Picker */}
        <div className="space-y-4">
          <div className="text-xs text-slate-300 font-medium">
            Choose an account to {mode === 'signup' ? 'create your subscription' : 'sign in'}:
          </div>

          <div className="space-y-2">
            {defaultAccounts.map((acc, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleChoose(acc)}
                className="w-full p-3 rounded-2xl bg-dark-950/80 hover:bg-white/5 border border-white/5 hover:border-brand-coral/40 transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-brand-coral transition">
                      {acc.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {acc.email}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-coral group-hover:translate-x-0.5 transition" />
              </button>
            ))}
          </div>

          {/* Toggle Custom Account */}
          {!showCustom ? (
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-white/10 hover:border-white/20 text-xs font-medium text-slate-400 hover:text-white transition flex items-center justify-center space-x-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Use another {isGoogle ? 'Google' : 'Facebook'} account</span>
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="p-3.5 rounded-2xl bg-dark-950 border border-white/10 space-y-3">
              <div className="text-xs font-semibold text-white">Enter Custom Account:</div>
              <div>
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-coral"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder={isGoogle ? "username@gmail.com" : "username@facebook.com"}
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-coral"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 rounded-xl bg-brand-coral hover:bg-brand-coral-hover text-white font-bold text-xs transition flex items-center justify-center space-x-1.5"
              >
                <span>Continue with {customEmail || 'this account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Security / Terms Notice */}
        <div className="pt-2 border-t border-white/5 flex items-start space-x-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-brand-mint flex-shrink-0 mt-0.5" />
          <span>
            To continue, {isGoogle ? 'Google' : 'Facebook'} will share your name, email address, and profile picture with Digital Heroes.
          </span>
        </div>

      </div>
    </div>
  );
};
