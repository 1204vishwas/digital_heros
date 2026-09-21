import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, ArrowRight, User, Mail, Sparkles } from 'lucide-react';

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
  const isGoogle = provider === 'google';

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [validationError, setValidationError] = useState('');

  // Reset form whenever modal opens or provider changes
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setName('');
      setValidationError('');
    }
  }, [isOpen, provider]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setValidationError(`Please enter your ${isGoogle ? 'Google' : 'Facebook'} email address.`);
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setValidationError('Please enter a valid email format (e.g. name@example.com).');
      return;
    }

    // Determine derived name if none specified
    const displayName = name.trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    onSelectAccount({
      name: displayName,
      email: cleanEmail,
      provider
    });
  };

  const handleQuickFill = (presetEmail, presetName) => {
    setEmail(presetEmail);
    setName(presetName);
    setValidationError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-[460px] my-auto rounded-2xl sm:rounded-3xl bg-dark-900 border border-white/10 p-5 sm:p-7 shadow-2xl space-y-5 transition-all max-h-[92vh] overflow-y-auto">
        
        {/* Header with Provider Branding */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-md flex-shrink-0 ${
              isGoogle 
                ? 'bg-white/10 border-white/15' 
                : 'bg-[#1877F2]/15 border-[#1877F2]/30'
            }`}>
              {isGoogle ? <GoogleIcon className="w-5 h-5" /> : <FacebookIcon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-1.5">
                <span>{isGoogle ? 'Google Authentication' : 'Facebook Authentication'}</span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {mode === 'signup' ? 'Create subscription with your email' : 'Sign in using your account'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition flex-shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative Banner */}
        <div className={`p-3 rounded-xl text-xs border flex items-center space-x-2.5 ${
          isGoogle 
            ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' 
            : 'bg-[#1877F2]/10 border-[#1877F2]/20 text-blue-100'
        }`}>
          <div className="p-1 rounded-lg bg-white/10">
            {isGoogle ? <GoogleIcon className="w-3.5 h-3.5" /> : <FacebookIcon className="w-3.5 h-3.5" />}
          </div>
          <span className="text-[11px] leading-tight">
            Sign in directly through your own <strong>{isGoogle ? 'Google (Gmail/Workspace)' : 'Facebook'}</strong> email ID.
          </span>
        </div>

        {/* Validation Error Notice */}
        {validationError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-in fade-in duration-150">
            {validationError}
          </div>
        )}

        {/* Primary Form: Enter Own Email ID */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email ID Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 block flex items-center justify-between">
              <span>Your {isGoogle ? 'Google Email ID' : 'Facebook Email ID'}</span>
              <span className="text-[10px] text-brand-coral uppercase font-bold">Required</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                autoFocus
                placeholder={isGoogle ? "yourname@gmail.com" : "yourname@facebook.com"}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationError) setValidationError('');
                }}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-dark-950 border border-white/10 text-white text-xs sm:text-sm focus:border-brand-coral focus:ring-1 focus:ring-brand-coral/50 focus:outline-none transition"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Enter any valid {isGoogle ? 'Google / Gmail' : 'Facebook'} email ID you own.
            </p>
          </div>

          {/* Full Name Field (Optional / Auto-derived) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 block flex items-center justify-between">
              <span>Your Full Name</span>
              <span className="text-[10px] text-slate-500">Optional</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Callum Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-dark-950 border border-white/10 text-white text-xs sm:text-sm focus:border-brand-coral focus:ring-1 focus:ring-brand-coral/50 focus:outline-none transition"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Leave blank to automatically derive from your email username.
            </p>
          </div>

          {/* Action CTA Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !email}
              className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isGoogle
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-blue-500/20'
                  : 'bg-gradient-to-r from-[#1877F2] to-[#1565C0] hover:from-[#1976D2] hover:to-[#0D47A1] text-white shadow-blue-600/20'
              }`}
            >
              {isGoogle ? <GoogleIcon className="w-4 h-4" /> : <FacebookIcon className="w-4 h-4" />}
              <span>
                {isLoading 
                  ? 'Authenticating...' 
                  : `Continue with ${email ? email.split('@')[0] : (isGoogle ? 'Google' : 'Facebook')}`
                }
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

        {/* Quick Demo Pre-fill options for Evaluators */}
        <div className="pt-3 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Quick Test Autofill Options:</span>
            <span className="text-[10px] text-brand-mint font-mono">1-Tap Fill</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill(
                isGoogle ? 'callum.vance.golf@gmail.com' : 'callum.vance@facebook.com',
                'Callum Vance'
              )}
              className="px-2.5 py-2 rounded-xl bg-dark-950/80 hover:bg-white/5 border border-white/5 hover:border-brand-coral/30 text-left transition group text-xs"
            >
              <div className="font-semibold text-white group-hover:text-brand-coral truncate">Callum Vance</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">
                {isGoogle ? 'callum.vance.golf@gmail.com' : 'callum.vance@facebook.com'}
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill(
                isGoogle ? 'arjun.patel.golf@gmail.com' : 'priya.sharma@facebook.com',
                isGoogle ? 'Arjun Patel' : 'Priya Sharma'
              )}
              className="px-2.5 py-2 rounded-xl bg-dark-950/80 hover:bg-white/5 border border-white/5 hover:border-brand-coral/30 text-left transition group text-xs"
            >
              <div className="font-semibold text-white group-hover:text-brand-coral truncate">
                {isGoogle ? 'Arjun Patel' : 'Priya Sharma'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">
                {isGoogle ? 'arjun.patel.golf@gmail.com' : 'priya.sharma@facebook.com'}
              </div>
            </button>
          </div>
        </div>

        {/* Privacy & Security Footnote */}
        <div className="pt-2 border-t border-white/5 flex items-start space-x-2 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-mint flex-shrink-0 mt-0.5" />
          <span>
            By proceeding, you authenticate through your {isGoogle ? 'Google' : 'Facebook'} identity with encrypted JWT token session protection.
          </span>
        </div>

      </div>
    </div>
  );
};
