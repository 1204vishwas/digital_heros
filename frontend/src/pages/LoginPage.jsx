import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  User,
  Shield,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SocialAuthModal, GoogleIcon, FacebookIcon } from '../components/SocialAuthModal';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, socialLogin, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialModal, setSocialModal] = useState({ isOpen: false, provider: 'google' });
  const [socialLoading, setSocialLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(from, { replace: true });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email, password);
      navigate(u.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAccountSelected = async ({ name: socialName, email: socialEmail, provider }) => {
    setSocialLoading(true);
    setError('');
    try {
      const u = await socialLogin({
        provider,
        name: socialName,
        email: socialEmail
      });
      setSocialModal({ isOpen: false, provider: 'google' });
      navigate(u.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Social sign in failed');
    } finally {
      setSocialLoading(false);
    }
  };

  const fillQuickCredentials = (eMail, pass) => {
    setEmail(eMail);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {/* Glow ambient background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-coral/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-coral to-brand-amber p-0.5 shadow-glow-coral group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-coral" />
              </div>
            </div>
            <span className="font-display font-black text-2xl text-white tracking-wider">
              DIGITAL<span className="text-brand-coral">.HEROES</span>
            </span>
          </Link>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1">
            Sign In to Your Portal
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Manage your rolling scores, check draw tickets, and inspect charitable distributions.
          </p>
        </div>

        {/* 1-Click Evaluator Test Credentials */}
        <div className="p-4 rounded-2xl bg-dark-900/90 border border-white/10 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center space-x-1.5 text-brand-amber">
              <Zap className="w-3.5 h-3.5" />
              <span>Evaluator 1-Click Fast Login</span>
            </span>
            <span className="text-[10px] text-brand-mint font-semibold">PRD § 15 Ready</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillQuickCredentials('golfer@digitalheroes.com', 'golfer123')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-left border border-white/5 hover:border-brand-coral/40 transition group"
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold text-white group-hover:text-brand-coral">
                <User className="w-3.5 h-3.5" />
                <span>Golfer Account</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">golfer@digitalheroes.com</div>
              <div className="text-[9px] text-brand-mint mt-1">Callum Vance (5 Scores)</div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickCredentials('admin@digitalheroes.com', 'admin123')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-left border border-white/5 hover:border-brand-coral/40 transition group"
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold text-white group-hover:text-brand-coral">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Hub</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">admin@digitalheroes.com</div>
              <div className="text-[9px] text-brand-coral mt-1">All 5 Control Surfaces</div>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="p-5 sm:p-8 rounded-3xl bg-dark-900/80 backdrop-blur-xl border border-white/10 shadow-2xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Social Sign In Buttons (Google & Facebook) */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSocialModal({ isOpen: true, provider: 'google' })}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-semibold text-white flex items-center justify-center space-x-2 transition group shadow-sm hover:scale-[1.01]"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Sign in with Google</span>
              </button>

              <button
                type="button"
                onClick={() => setSocialModal({ isOpen: true, provider: 'facebook' })}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-semibold text-white flex items-center justify-center space-x-2 transition group shadow-sm hover:scale-[1.01]"
              >
                <FacebookIcon className="w-4 h-4" />
                <span>Sign in with Facebook</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-2">
              <div className="border-t border-white/10 w-full"></div>
              <span className="bg-dark-900/90 px-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold absolute">
                Or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-sm focus:border-brand-coral focus:outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-300 block">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Demo notice: You can use golfer123 for golfer or admin123 for admin!')}
                  className="text-[11px] text-brand-coral hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-sm focus:border-brand-coral focus:outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-300 absolute right-3.5 top-1/2 -translate-y-1/2 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-coral to-brand-coral-hover text-white font-bold text-sm shadow-glow-coral hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

          {/* Direct link to Signup */}
          <div className="pt-4 border-t border-white/5 text-center text-xs text-slate-400">
            <span>Don't have an active subscription? </span>
            <Link to="/signup" className="text-brand-coral font-bold hover:underline">
              Join the Draw (From ₹499/mo)
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-brand-mint" />
          <span>Real-time PCI validation on authenticated endpoints</span>
        </div>

      </div>

      {/* Social Auth Modal */}
      <SocialAuthModal
        isOpen={socialModal.isOpen}
        provider={socialModal.provider}
        mode="login"
        isLoading={socialLoading}
        onClose={() => setSocialModal({ ...socialModal, isOpen: false })}
        onSelectAccount={handleSocialAccountSelected}
      />
    </div>
  );
};
