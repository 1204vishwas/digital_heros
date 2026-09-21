import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  CreditCard,
  TrendingUp,
  Percent
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { formatINR } from '../utils/currency';
import { SocialAuthModal, GoogleIcon, FacebookIcon } from '../components/SocialAuthModal';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { register, socialLogin, user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('monthly'); // 'monthly' (₹499) | 'yearly' (₹4,990)
  const [charityId, setCharityId] = useState('');
  const [charityPct, setCharityPct] = useState(15);
  
  const [charities, setCharities] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialModal, setSocialModal] = useState({ isOpen: false, provider: 'google' });
  const [socialLoading, setSocialLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }

    api.charities.getAll()
      .then(res => {
        if (res.charities && res.charities.length > 0) {
          setCharities(res.charities);
          setCharityId(res.charities[0].id.toString());
        }
      })
      .catch(() => {});
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        plan,
        charityId: charityId ? parseInt(charityId, 10) : null,
        charityPercentage: parseFloat(charityPct)
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAccountSelected = async ({ name: socialName, email: socialEmail, provider }) => {
    setSocialLoading(true);
    setError('');
    try {
      await socialLogin({
        provider,
        name: socialName,
        email: socialEmail,
        plan,
        charityId: charityId ? parseInt(charityId, 10) : null,
        charityPercentage: parseFloat(charityPct)
      });
      setSocialModal({ isOpen: false, provider: 'google' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Social registration failed');
    } finally {
      setSocialLoading(false);
    }
  };

  const planBasePrice = plan === 'yearly' ? 4990 : 499;
  const calculatedCharityShare = ((planBasePrice * (charityPct / 100)) / (plan === 'yearly' ? 12 : 1)).toFixed(2);
  const selectedCharityObj = charities.find(c => c.id.toString() === charityId) || charities[0];

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative">
      {/* Glow ambient background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-coral/10 blur-[140px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-xl space-y-8 relative z-10">
        
        {/* Header */}
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
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white mt-1">
            Start Your Subscription
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Log your 5 Stableford scores, enter monthly cash draws, and power impactful charitable work.
          </p>
        </div>

        {/* Signup Form Card */}
        <div className="p-5 sm:p-8 md:p-10 rounded-3xl bg-dark-900/80 backdrop-blur-xl border border-white/10 shadow-2xl space-y-7">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. SELECT SUBSCRIPTION PLAN (PRD § 04) */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-wider text-slate-300 block flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-brand-coral" />
                <span>1. Select Subscription Plan</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Monthly Option */}
                <div
                  onClick={() => setPlan('monthly')}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    plan === 'monthly'
                      ? 'bg-brand-coral/10 border-brand-coral ring-1 ring-brand-coral shadow-inner'
                      : 'bg-dark-950/60 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white">Monthly Plan</span>
                    {plan === 'monthly' && <Check className="w-4 h-4 text-brand-coral" />}
                  </div>
                  <div className="text-2xl font-black font-display text-white mt-1">
                    ₹499<span className="text-xs font-normal text-slate-400">/mo</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Billed monthly · Cancel anytime</p>
                </div>

                {/* Yearly Option */}
                <div
                  onClick={() => setPlan('yearly')}
                  className={`p-4 rounded-2xl border cursor-pointer transition relative ${
                    plan === 'yearly'
                      ? 'bg-brand-coral/10 border-brand-coral ring-1 ring-brand-coral shadow-inner'
                      : 'bg-dark-950/60 border-white/5 hover:border-white/10'
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-brand-mint text-[9px] font-bold text-dark-950 uppercase tracking-wide">
                    Save ₹998 (2 Mo Free)
                  </span>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white">Yearly Plan</span>
                    {plan === 'yearly' && <Check className="w-4 h-4 text-brand-coral" />}
                  </div>
                  <div className="text-2xl font-black font-display text-brand-mint mt-1">
                    ₹4,990<span className="text-xs font-normal text-slate-400">/yr</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Discounted rate (₹415/mo equiv)</p>
                </div>

              </div>
            </div>

            {/* 2. CHOOSE CHARITY & PERCENTAGE (PRD § 08.1) */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <label className="text-xs uppercase font-bold tracking-wider text-slate-300 block flex items-center space-x-1.5">
                <Heart className="w-4 h-4 text-brand-coral" />
                <span>2. Choose Your Charity & Allocation (Min 10%)</span>
              </label>

              <select
                value={charityId}
                onChange={(e) => setCharityId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-xs focus:border-brand-coral focus:outline-none"
                required
              >
                {charities.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>

              {/* Slider */}
              <div className="p-3.5 rounded-2xl bg-dark-950 border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Contribution Rate:</span>
                  <span className="font-bold text-brand-coral text-sm">{charityPct}% of your fee</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={charityPct}
                  onChange={(e) => setCharityPct(parseInt(e.target.value, 10))}
                  className="w-full accent-brand-coral h-2 bg-dark-900 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>10% (Required Minimum)</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>

                <div className="text-[11px] text-brand-mint font-medium pt-1 flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>
                    Directing approx. <strong>₹{calculatedCharityShare} / month</strong> to {selectedCharityObj?.name || 'your cause'}.
                  </span>
                </div>
              </div>
            </div>

            {/* 3. ACCOUNT PROFILE DETAILS */}
            <div className="space-y-4 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase font-bold tracking-wider text-slate-300 block flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-brand-coral" />
                  <span>3. Golfer Account Information</span>
                </label>
                <span className="text-[10px] text-brand-mint font-semibold">1-Click Fast Sign Up</span>
              </div>

              {/* Social Auth Buttons (Google & Facebook) */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSocialModal({ isOpen: true, provider: 'google' })}
                    className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-semibold text-white flex items-center justify-center space-x-2 transition group shadow-sm hover:scale-[1.01]"
                  >
                    <GoogleIcon className="w-4 h-4" />
                    <span>Sign up with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocialModal({ isOpen: true, provider: 'facebook' })}
                    className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-semibold text-white flex items-center justify-center space-x-2 transition group shadow-sm hover:scale-[1.01]"
                  >
                    <FacebookIcon className="w-4 h-4" />
                    <span>Sign up with Facebook</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center py-2">
                  <div className="border-t border-white/10 w-full"></div>
                  <span className="bg-dark-900/90 px-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold absolute">
                    Or register with email
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Callum Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-sm focus:border-brand-coral focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-sm focus:border-brand-coral focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-sm focus:border-brand-coral focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-coral to-brand-coral-hover text-white font-bold text-sm shadow-glow-coral hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Activating Membership...' : `Activate Subscription & Join Next Draw (${formatINR(planBasePrice)})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-slate-500 text-center flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-mint" />
              <span>Simulated PCI compliant checkout · Instant activation</span>
            </div>

          </form>

          {/* Link to login */}
          <div className="pt-4 border-t border-white/5 text-center text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link to="/login" className="text-brand-coral font-bold hover:underline">
              Sign In here
            </Link>
          </div>
        </div>

      </div>

      {/* Social Auth Modal */}
      <SocialAuthModal
        isOpen={socialModal.isOpen}
        provider={socialModal.provider}
        mode="signup"
        isLoading={socialLoading}
        onClose={() => setSocialModal({ ...socialModal, isOpen: false })}
        onSelectAccount={handleSocialAccountSelected}
      />
    </div>
  );
};
