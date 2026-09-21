import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { 
  Trophy, 
  Heart, 
  Shield, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  Layers,
  ChevronRight
} from 'lucide-react';

import { formatINR } from '../utils/currency';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentJackpot, setCurrentJackpot] = useState(1425000);
  const [userScoreCount, setUserScoreCount] = useState(0);

  useEffect(() => {
    // Fetch live jackpot pool
    api.draws.getCurrentPool()
      .then(res => {
        if (res.pool?.tier5Pool) {
          setCurrentJackpot(res.pool.tier5Pool);
        }
      })
      .catch(() => {});

    if (user && user.role !== 'admin') {
      api.scores.get()
        .then(res => {
          setUserScoreCount((res.scores || []).length);
        })
        .catch(() => {});
    }
  }, [location.pathname, user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-coral to-brand-amber p-0.5 shadow-glow-coral group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-coral group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-black text-lg tracking-wider text-white">
                  DIGITAL<span className="text-brand-coral">.HEROES</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-semibold tracking-widest uppercase">
                  2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight -mt-0.5">
                Feel, not fairway.
              </p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/mechanics"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/mechanics')
                  ? 'text-white bg-white/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              The Draw
            </Link>

            <Link
              to="/charities"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/charities')
                  ? 'text-white bg-white/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Charity Directory
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/dashboard')
                    ? 'text-white bg-white/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                  isActive('/admin')
                    ? 'bg-brand-coral/20 border-brand-coral text-brand-coral'
                    : 'border-brand-coral/40 text-brand-coral/90 hover:bg-brand-coral/10'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Hub</span>
              </Link>
            )}
          </nav>

          {/* Right Section: Live Jackpot Pill & Auth Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            
            {/* Live Jackpot Ticker */}
            <div className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-dark-850/80 border border-brand-coral/20 shadow-inner">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-coral opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-coral"></span>
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Jackpot:
              </span>
              <span className="text-sm font-display font-bold text-white tracking-wide">
                {formatINR(currentJackpot)}
              </span>
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3 pl-2">
                {/* Real-time Activity Status Chip for Subscriber */}
                {user.role !== 'admin' && (
                  <Link
                    to="/dashboard"
                    className={`hidden xl:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition ${
                      user.subscription_status === 'active' && userScoreCount >= 5
                        ? 'bg-brand-mint/10 border-brand-mint/30 text-brand-mint shadow-glow-mint'
                        : 'bg-brand-amber/10 border-brand-amber/30 text-brand-amber'
                    }`}
                    title={user.subscription_status === 'active' && userScoreCount >= 5 ? 'All activities done!' : 'Score logging required'}
                  >
                    <span className={`w-2 h-2 rounded-full ${user.subscription_status === 'active' && userScoreCount >= 5 ? 'bg-brand-mint animate-pulse' : 'bg-brand-amber'}`}></span>
                    <span>
                      {user.subscription_status === 'active' && userScoreCount >= 5 
                        ? 'Activity: Completed ✓' 
                        : `Activity: ${userScoreCount}/5 Scores`}
                    </span>
                  </Link>
                )}

                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-200 leading-none">
                      {user.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-brand-mint font-medium capitalize mt-0.5">
                      {user.subscription_status}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-coral to-brand-coral-hover shadow-glow-coral hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Join the Draw (₹499/mo)
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-dark-900/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between py-2 px-3 bg-dark-850 rounded-lg border border-white/5">
            <span className="text-xs text-slate-400 uppercase font-semibold">Active Jackpot</span>
            <span className="text-sm font-bold text-brand-coral">
              {formatINR(currentJackpot)}
            </span>
          </div>

          <Link
            to="/mechanics"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5"
          >
            The Draw
          </Link>
          <Link
            to="/charities"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5"
          >
            Charities
          </Link>

          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5"
            >
              My Dashboard
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-semibold text-brand-coral bg-brand-coral/10"
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Admin Dashboard</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}

          <div className="pt-4 border-t border-white/10">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  {user.role !== 'admin' && (
                    <span className={`text-[10px] font-bold ${user.subscription_status === 'active' && userScoreCount >= 5 ? 'text-brand-mint' : 'text-brand-amber'}`}>
                      {user.subscription_status === 'active' && userScoreCount >= 5 ? 'Activity: Completed ✓' : `Activity: ${userScoreCount}/5 scores logged`}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-slate-300 hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-white/5 text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-bold bg-brand-coral text-white"
                >
                  Join Draw
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
