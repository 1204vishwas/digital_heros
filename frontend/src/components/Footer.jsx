import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, ShieldCheck, Trophy, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-dark-950/80 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-coral to-brand-amber flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-black text-xl text-white tracking-wider">
                DIGITAL<span className="text-brand-coral">.HEROES</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              A high-impact subscription platform transforming your regular golf scores into monthly life-changing prize draws and philanthropic momentum. Built on transparency, sport, and purpose.
            </p>
            <div className="flex items-center space-x-6 text-xs text-slate-500 pt-2">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-mint" />
                <span>PCI Compliant & Verified</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Heart className="w-4 h-4 text-brand-coral" />
                <span>10% Min Guaranteed Giving</span>
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/mechanics" className="hover:text-white transition">Draw Mechanics & Rules</Link>
              </li>
              <li>
                <Link to="/charities" className="hover:text-white transition">Charity Directory</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">Golfer Dashboard</Link>
              </li>
              <li>
                <Link to="/auth?tab=register" className="hover:text-white transition">Join Subscription</Link>
              </li>
            </ul>
          </div>

          {/* Mission & Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-4">Philosophy</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Feel, not fairway." Designed to lead with charitable impact rather than traditional sport clichés. Trainee Full-Stack Selection Edition 2026.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400">
              <span>Admin portal access available with pre-configured demo credentials.</span>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Digital Heroes. All rights reserved. PRD Level 1 Specification.</p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Fair Play Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Charity Direct Fund</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
