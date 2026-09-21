import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  User, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Zap,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, user } = useAuth();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register State
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPlan, setRegisterPlan] = useState('monthly');
  const [registerCharityId, setRegisterCharityId] = useState('');
  const [registerCharityPct, setRegisterCharityPct] = useState(15);
  
  const [charities, setCharities] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }

    api.charities.getAll().then(res => {
      if (res.charities && res.charities.length > 0) {
        setCharities(res.charities);
        setRegisterCharityId(res.charities[0].id);
      }
    }).catch(() => {});
  }, [user]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(loginEmail, loginPassword);
      navigate(u.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await register({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        plan: registerPlan,
        charityId: registerCharityId ? parseInt(registerCharityId, 10) : null,
        charityPercentage: parseFloat(registerCharityPct)
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (email, pass) => {
    setActiveTab('login');
    setLoginEmail(email);
    setLoginPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-coral to-brand-amber flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-black text-xl text-white tracking-wider">
              DIGITAL<span className="text-brand-coral">.HEROES</span>
            </span>
          </Link>
          <h2 className="text-2xl font-display font-extrabold text-white">
            {activeTab === 'login' ? 'Sign In to Your Account' : 'Join the Draw & Give Back'}
          </h2>
          <p className="text-xs text-slate-400">
            {activeTab === 'login' 
              ? 'Access your 5-score scorecard, draw tickets, and winnings.' 
              : 'Start your subscription to enter monthly cash prize pools.'}
          </p>
        </div>

        {/* Demo Quick Fills Card */}
        <div className="p-3.5 rounded-2xl bg-dark-900/80 border border-white/10 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>⚡ Evaluator Quick-Fill Credentials</span>
            <span className="text-[10px] text-brand-mint font-semibold">PRD § 15 Deliverable</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillQuickLogin('golfer@digitalheroes.com', 'golfer123')}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-left border border-white/5 transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-brand-coral">Golfer: Callum Vance</div>
              <div className="text-[10px] text-slate-400 font-mono">golfer@digitalheroes.com</div>
            </button>
            <button
              type="button"
              onClick={() => fillQuickLogin('admin@digitalheroes.com', 'admin123')}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-left border border-white/5 transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-brand-coral">Admin: Platform Lead</div>
              <div className="text-[10px] text-slate-400 font-mono">admin@digitalheroes.com</div>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="p-1 rounded-2xl bg-dark-900 border border-white/10 grid grid-cols-2">
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'login' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Member Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'register' ? 'bg-brand-coral text-white shadow-glow-coral' : 'text-slate-400 hover:text-white'
            }`}
          >
            Subscribe & Play
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-7 rounded-3xl bg-dark-900/80 border border-white/10 space-y-4 shadow-xl">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-sm focus:border-brand-coral focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-sm focus:border-brand-coral focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-coral hover:bg-brand-coral-hover text-white font-bold text-sm shadow-glow-coral transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* REGISTER & SUBSCRIPTION FORM (PRD § 04 & § 08) */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-7 rounded-3xl bg-dark-900/80 border border-white/10 space-y-4 shadow-xl">
            
            {/* Plan Choice (PRD § 04: Monthly and yearly plan with discounted rate) */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium block">Select Subscription Plan</label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setRegisterPlan('monthly')}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    registerPlan === 'monthly'
                      ? 'bg-brand-coral/10 border-brand-coral'
                      : 'bg-dark-950 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="text-xs font-bold text-white">Monthly Plan</div>
                  <div className="text-lg font-black font-display text-white mt-0.5">₹499<span className="text-xs font-normal text-slate-400">/mo</span></div>
                  <div className="text-[10px] text-slate-500">Billed monthly</div>
                </div>

                <div
                  onClick={() => setRegisterPlan('yearly')}
                  className={`p-3 rounded-2xl border cursor-pointer transition relative ${
                    registerPlan === 'yearly'
                      ? 'bg-brand-coral/10 border-brand-coral'
                      : 'bg-dark-950 border-white/5 hover:border-white/10'
                  }`}
                >
                  <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded bg-brand-mint text-[9px] font-bold text-dark-950">
                    SAVE ₹998
                  </span>
                  <div className="text-xs font-bold text-white">Yearly Plan</div>
                  <div className="text-lg font-black font-display text-brand-mint mt-0.5">₹4,990<span className="text-xs font-normal text-slate-400">/yr</span></div>
                  <div className="text-[10px] text-slate-500">2 months free rate</div>
                </div>
              </div>
            </div>

            {/* Charity Selection (PRD § 08.1: Users select a charity at signup, min 10%) */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs text-slate-400 font-medium block">
                Choose Charity Recipient (PRD § 08.1)
              </label>
              <select
                value={registerCharityId}
                onChange={(e) => setRegisterCharityId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-xs focus:border-brand-coral focus:outline-none"
              >
                {charities.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.category})</option>
                ))}
              </select>
            </div>

            {/* Charity Percentage Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Charity Contribution:</span>
                <span className="font-bold text-brand-coral">{registerCharityPct}% of your fee</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={registerCharityPct}
                onChange={(e) => setRegisterCharityPct(e.target.value)}
                className="w-full accent-brand-coral h-1.5 bg-dark-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>10% (Required Min)</span>
                <span>50%</span>
              </div>
            </div>

            {/* Profile Fields */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Your Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Jordan Spieth"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-sm focus:border-brand-coral focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-sm focus:border-brand-coral focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Create Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-sm focus:border-brand-coral focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand-coral hover:bg-brand-coral-hover text-white font-bold text-sm shadow-glow-coral transition disabled:opacity-50"
              >
                {loading ? 'Setting up Membership...' : `Activate Subscription & Join Draw`}
              </button>
            </div>

            <div className="text-[11px] text-slate-500 text-center flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-mint" />
              <span>Instant activation · PCI simulated gateway</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
