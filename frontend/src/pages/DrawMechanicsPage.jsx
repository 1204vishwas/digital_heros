import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  HelpCircle, 
  Zap, 
  ShieldAlert, 
  CheckCircle, 
  RefreshCw, 
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { api } from '../api/client';
import { formatINR } from '../utils/currency';

export const DrawMechanicsPage = () => {
  const [history, setHistory] = useState([]);
  const [testScores, setTestScores] = useState(['36', '41', '28', '39', '33']);
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    api.draws.getHistory(10)
      .then(res => {
        if (res.history) setHistory(res.history);
      })
      .catch(() => {});
  }, []);

  const handleSimulateCheck = () => {
    if (history.length === 0) return;
    const latestDraw = history[0];
    const winningSet = new Set(latestDraw.winning_numbers);
    const userNumbers = testScores.map(s => parseInt(s, 10)).filter(n => !isNaN(n) && n >= 1 && n <= 45);
    
    const matched = userNumbers.filter(n => winningSet.has(n));
    setMatchResult({
      drawCode: latestDraw.draw_code,
      winningNumbers: latestDraw.winning_numbers,
      userNumbers,
      matched,
      matchCount: matched.length
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-coral">
          System Rules & Transparency
        </span>
        <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-white">
          The Mechanics Behind the Draw
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">
          Full specification of the 5-score rolling logic, algorithmic weighting, prize pool share allocation, and verification protocol.
        </p>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 rounded-2xl bg-dark-900/60 border border-white/5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-coral/10 text-brand-coral flex items-center justify-center font-bold">
            1-45
          </div>
          <h3 className="font-bold text-white text-lg">Stableford Range</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All entered scores must fall strictly between 1 and 45. Each score is permanently stamped with its play date. Only 1 score per date is permitted.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-dark-900/60 border border-white/5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-amber/10 text-brand-amber flex items-center justify-center font-bold">
            5
          </div>
          <h3 className="font-bold text-white text-lg">Rolling 5-Score Retention</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Only your latest 5 rounds are active at any time. When you record a 6th score, the oldest score is automatically evicted from your active ticket.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-dark-900/60 border border-white/5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-mint/10 text-brand-mint flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-lg">Dual Draw Logic</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Admin can execute standard Random lottery draws or Algorithmic draws weighted by score frequency across active subscribers.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-dark-900/60 border border-white/5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-lg">Jackpot Rollover</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            If no subscriber matches all 5 numbers in a given month, 100% of the 40% Tier 5 pool rolls directly into the next month's grand jackpot!
          </p>
        </div>

      </div>

      {/* Interactive Match Checker */}
      <div className="p-8 sm:p-10 rounded-3xl bg-dark-900/80 border border-white/10 space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-coral">Interactive Checker</span>
          <h2 className="text-2xl font-display font-bold text-white mt-1">
            Test Your 5 Numbers Against Past Draws
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter 5 sample Stableford scores (1-45) to see how our matching engine evaluates tier payouts.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-xl">
          {testScores.map((score, idx) => (
            <div key={idx} className="space-y-1">
              <label className="text-[10px] text-slate-400 font-semibold">Score #{idx + 1}</label>
              <input
                type="number"
                min="1"
                max="45"
                value={score}
                onChange={(e) => {
                  const updated = [...testScores];
                  updated[idx] = e.target.value;
                  setTestScores(updated);
                }}
                className="w-full text-center py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white font-bold font-mono focus:border-brand-coral focus:outline-none"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSimulateCheck}
          className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Check Match Against Recent Draw</span>
        </button>

        {matchResult && (
          <div className="p-5 rounded-2xl bg-dark-950 border border-white/10 space-y-4 max-w-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Tested against draw: <strong className="text-white">{matchResult.drawCode}</strong></span>
              <span className={`px-2.5 py-1 rounded-full font-bold ${
                matchResult.matchCount >= 3 ? 'bg-brand-mint/20 text-brand-mint' : 'bg-white/5 text-slate-400'
              }`}>
                {matchResult.matchCount >= 3 ? `🎉 Winner (${matchResult.matchCount}-Match Tier)` : 'No Tier Match (<3)'}
              </span>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 mb-1.5">Winning Numbers:</div>
              <div className="flex space-x-2">
                {matchResult.winningNumbers.map(n => (
                  <span
                    key={n}
                    className={`w-9 h-9 rounded-lg font-mono font-bold text-xs flex items-center justify-center border ${
                      matchResult.matched.includes(n)
                        ? 'bg-brand-coral text-white border-brand-coral shadow-glow-coral'
                        : 'bg-white/5 border-white/5 text-slate-400'
                    }`}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-300">
              {matchResult.matchCount >= 3 
                ? `Matches ${matchResult.matchCount} numbers: [${matchResult.matched.join(', ')}]. In official draws, winners submit golf app screenshot verification to receive payouts.`
                : 'You matched fewer than 3 numbers. Better luck in the next monthly round!'}
            </p>
          </div>
        )}
      </div>

      {/* Historical Draws Table */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Official Draw Archives</h2>
          <p className="text-xs text-slate-400 mt-1">Verified record of winning numbers, pool sizes, and rollover amounts.</p>
        </div>

        <div className="rounded-3xl bg-dark-900/60 border border-white/10 overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase font-bold text-slate-400 bg-white/[0.02]">
                <th className="py-3 px-4">Draw Code</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Winning Numbers</th>
                <th className="py-3 px-4">Subscribers</th>
                <th className="py-3 px-4">Total Pool</th>
                <th className="py-3 px-4">Rollover Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 text-xs">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">No published draws found yet.</td>
                </tr>
              ) : (
                history.map((d) => (
                  <tr key={d.id} className="hover:bg-white/[0.01]">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{d.draw_code}</td>
                    <td className="py-3.5 px-4 text-slate-400">{d.draw_date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded capitalize ${d.mode === 'algorithmic' ? 'bg-brand-amber/10 text-brand-amber' : 'bg-brand-mint/10 text-brand-mint'}`}>
                        {d.mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex space-x-1.5">
                        {d.winning_numbers.map((n, i) => (
                          <span key={i} className="w-6 h-6 rounded bg-brand-coral/20 text-brand-coral font-bold font-mono flex items-center justify-center text-[11px]">
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{d.active_subscribers_count}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{formatINR(d.total_pool)}</td>
                    <td className="py-3.5 px-4 font-medium text-brand-mint">{formatINR(d.jackpot_rollover_out)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
