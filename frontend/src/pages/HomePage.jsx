import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Heart, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  Users, 
  DollarSign, 
  ChevronRight, 
  CheckCircle2, 
  TrendingUp,
  Target,
  Gift
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const { user } = useAuth();
  const [poolData, setPoolData] = useState({
    totalPool: 14991,
    tier5Pool: 14546,
    tier4Pool: 259,
    tier3Pool: 185,
    activeSubscribersCount: 15,
    currentRollover: 14250
  });
  const [featuredCharity, setFeaturedCharity] = useState(null);
  const [latestDraw, setLatestDraw] = useState(null);
  const [countdown, setCountdown] = useState({ days: 10, hours: 14, minutes: 22, seconds: 40 });

  useEffect(() => {
    // Load live pool data
    api.draws.getCurrentPool()
      .then(res => {
        if (res.pool) setPoolData(res.pool);
      })
      .catch(() => {});

    // Load featured charity
    api.charities.getAll({ featured: 'true' })
      .then(res => {
        if (res.charities && res.charities.length > 0) {
          setFeaturedCharity(res.charities[0]);
        }
      })
      .catch(() => {});

    // Load latest official draw
    api.draws.getLatest()
      .then(res => {
        if (res.draw) setLatestDraw(res.draw);
      })
      .catch(() => {});

    // Countdown simulation
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { ...prev, days: Math.max(0, prev.days - 1), hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-24">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 lg:pt-20 overflow-hidden">
        {/* Glow ambient spots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-coral/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-brand-mint/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Mission & Pitch */}
            <div className="lg:col-span-7 space-y-8 text-left">
              
              {/* Pill badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
                <span className="w-2 h-2 rounded-full bg-brand-coral animate-pulse"></span>
                <span>March 2026 Monthly Prize Draw Open</span>
                <span className="text-slate-500">|</span>
                <span className="text-brand-mint">Rollover Active</span>
              </div>

              {/* Editorial Title */}
              <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight leading-[1.1]">
                Turn your scores into <br className="hidden sm:block" />
                <span className="coral-gradient-text">life-changing draws</span> & purposeful giving.
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
                Log your last 5 Stableford scores. Every month, your numbers automatically enter high-stakes cash prize pools — while directing a minimum of 10% of your subscription straight to vetted charities.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to={user ? "/dashboard" : "/auth?tab=register"}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-coral to-brand-coral-hover text-white font-bold text-base shadow-glow-coral hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-center flex items-center justify-center space-x-2.5"
                >
                  <span>{user ? "View My Dashboard" : "Join the Draw — From $19/mo"}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/charities"
                  className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-base transition-all text-center flex items-center justify-center space-x-2"
                >
                  <Heart className="w-4 h-4 text-brand-coral" />
                  <span>Explore 6 Vetted Causes</span>
                </Link>
              </div>

              {/* Micro proof indicators */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-lg">
                <div>
                  <div className="text-2xl font-bold font-display text-white">40% / 35% / 25%</div>
                  <div className="text-xs text-slate-400">Enforced Tier Split</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-brand-mint">100%</div>
                  <div className="text-xs text-slate-400">Rollover Protection</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-brand-coral">10% Min</div>
                  <div className="text-xs text-slate-400">Charity Guarantee</div>
                </div>
              </div>

            </div>

            {/* Right Column: Live Draw Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl p-1 bg-gradient-to-b from-white/15 via-white/5 to-white/0 shadow-2xl">
                <div className="rounded-[22px] bg-dark-900/90 backdrop-blur-2xl p-7 border border-white/10 space-y-6">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-brand-mint animate-pulse"></div>
                      <span className="text-xs uppercase font-bold tracking-widest text-slate-300">
                        Live Jackpot Pool
                      </span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-brand-coral/10 text-brand-coral font-bold">
                      Edition 2026
                    </span>
                  </div>

                  {/* Main Amount */}
                  <div className="space-y-1">
                    <div className="text-xs text-slate-400 font-medium">Grand 5-Match Pool</div>
                    <div className="text-5xl sm:text-6xl font-black font-display text-white tracking-tight flex items-baseline">
                      <span className="text-brand-coral text-3xl sm:text-4xl mr-1">$</span>
                      {Number(poolData.tier5Pool || 14546).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-xs text-brand-mint flex items-center space-x-1 pt-1 font-medium">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Includes ${Number(poolData.currentRollover || 14250).toLocaleString()} rollover from previous unclaimed draws!</span>
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div className="p-4 rounded-2xl bg-dark-950/60 border border-white/5 space-y-2">
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-brand-coral" />
                        <span>Next Monthly Draw Closes In:</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">31-MAR-2026</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center pt-1">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-lg font-bold font-mono text-white">{countdown.days}</div>
                        <div className="text-[10px] uppercase text-slate-400">Days</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-lg font-bold font-mono text-white">{countdown.hours}</div>
                        <div className="text-[10px] uppercase text-slate-400">Hours</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-lg font-bold font-mono text-white">{countdown.minutes}</div>
                        <div className="text-[10px] uppercase text-slate-400">Mins</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-lg font-bold font-mono text-brand-coral">{countdown.seconds}</div>
                        <div className="text-[10px] uppercase text-slate-400">Secs</div>
                      </div>
                    </div>
                  </div>

                  {/* Tier Pools Breakdown */}
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-brand-coral"></span>
                        <span className="text-slate-300 font-medium">4-Number Match (35%)</span>
                      </div>
                      <span className="font-bold text-white">${Number(poolData.tier4Pool || 259).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-brand-amber"></span>
                        <span className="text-slate-300 font-medium">3-Number Match (25%)</span>
                      </div>
                      <span className="font-bold text-white">${Number(poolData.tier3Pool || 185).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Quick Card Action */}
                  <Link
                    to={user ? "/dashboard" : "/auth?tab=register"}
                    className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition text-center block border border-white/10"
                  >
                    {user ? "View My 5 Rolling Numbers" : "Subscribe to Enter Next Draw"}
                  </Link>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (PRD § 01.1 & § 02) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand-coral">
            Simplicity by Design
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Three Steps. One Seamless Engine.
          </h2>
          <p className="text-slate-400 text-base">
            No complicated lotteries, no clunky handicap forms. Just your genuine golf game powering monthly wins and social causes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="p-8 rounded-3xl bg-dark-900/60 border border-white/5 relative overflow-hidden group hover:border-brand-coral/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-brand-coral/10 border border-brand-coral/20 flex items-center justify-center text-brand-coral font-bold text-lg mb-6">
              01
            </div>
            <h3 className="text-xl font-bold font-display text-white mb-3">
              Subscribe & Direct
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Choose a monthly plan ($19) or yearly discounted plan ($190). Select any accredited charity to receive a minimum 10% of your fee automatically.
            </p>
            <div className="pt-4 border-t border-white/5 flex items-center space-x-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-brand-mint" />
              <span>Real-time PCI validation</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-3xl bg-dark-900/60 border border-white/5 relative overflow-hidden group hover:border-brand-coral/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber font-bold text-lg mb-6">
              02
            </div>
            <h3 className="text-xl font-bold font-display text-white mb-3">
              Log 5 Stableford Scores
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Enter your latest scores between 1 and 45. Our automated 5-score rolling buffer keeps your newest rounds active, dropping older scores seamlessly.
            </p>
            <div className="pt-4 border-t border-white/5 flex items-center space-x-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-brand-mint" />
              <span>1 score/day unique date enforcement</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-3xl bg-dark-900/60 border border-white/5 relative overflow-hidden group hover:border-brand-coral/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-brand-mint/10 border border-brand-mint/20 flex items-center justify-center text-brand-mint font-bold text-lg mb-6">
              03
            </div>
            <h3 className="text-xl font-bold font-display text-white mb-3">
              Draw, Match & Win
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Every month, 5 winning numbers are generated. Match 3, 4, or 5 to take home equal shares of the tier pool. Unclaimed 5-matches roll straight into next month's jackpot!
            </p>
            <div className="pt-4 border-t border-white/5 flex items-center space-x-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-brand-mint" />
              <span>Verified scorecard payout</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FEATURED CHARITY SPOTLIGHT (PRD § 08.2) */}
      {featuredCharity && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-dark-900 via-dark-850 to-dark-900 border border-brand-coral/20 p-8 sm:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-full bg-brand-coral/20 text-brand-coral text-xs font-bold uppercase tracking-wider">
                    Homepage Spotlight (PRD § 08.2)
                  </span>
                  <span className="text-xs text-slate-400">{featuredCharity.category}</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
                  {featuredCharity.name}
                </h2>

                <p className="text-slate-300 text-base leading-relaxed">
                  {featuredCharity.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-brand-coral">
                      ${Number(featuredCharity.raised_amount).toLocaleString()} raised so far
                    </span>
                    <span className="text-slate-400">
                      Goal: ${Number(featuredCharity.target_amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-dark-950 overflow-hidden border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-coral to-brand-amber rounded-full"
                      style={{ width: `${Math.min(100, Math.round((featuredCharity.raised_amount / featuredCharity.target_amount) * 100))}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link
                    to={`/charities/${featuredCharity.slug}`}
                    className="px-6 py-3 rounded-xl bg-brand-coral text-white font-bold text-sm hover:bg-brand-coral-hover transition flex items-center space-x-2"
                  >
                    <span>View Charity Profile & Events</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/charities"
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm transition"
                  >
                    Browse All Causes
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative aspect-[4/3]">
                  <img
                    src={featuredCharity.cover_image}
                    alt={featuredCharity.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-dark-900/80 backdrop-blur-md border border-white/10 text-xs text-slate-200">
                    <div className="font-bold text-white text-sm mb-0.5">Upcoming Charity Golf Days</div>
                    <p className="text-slate-400 text-[11px]">Subscribers receive invitation priority to regional pro-ams and volunteer days.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 4. TRANSPARENT PRIZE POOL MATRIX (PRD § 07) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-dark-900/70 border border-white/10 p-8 sm:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
                Enforced Mathematical Rules (PRD § 07)
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
                Automated Prize Pool Allocation
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              A fixed portion of each subscription contributes to the prize pool. If 5 numbers remain unmatched, the entire 40% pool carries forward into next month's jackpot.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase font-bold text-slate-400">
                  <th className="py-3 px-4">Match Tier</th>
                  <th className="py-3 px-4">Pool Share</th>
                  <th className="py-3 px-4">Jackpot Rollover?</th>
                  <th className="py-3 px-4">Distribution Logic</th>
                  <th className="py-3 px-4 text-right">Estimated Prize</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-4 font-bold text-white flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-brand-coral" />
                    <span>5-Number Match</span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-brand-coral">40%</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-brand-mint/10 text-brand-mint text-xs font-bold">
                      Yes — Jackpot Rollover
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-400">
                    Split equally among all 5-match winners; carries over if unclaimed
                  </td>
                  <td className="py-4 px-4 text-right font-display font-bold text-white">
                    ${Number(poolData.tier5Pool || 14546).toLocaleString()}
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-4 font-bold text-white flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-brand-amber" />
                    <span>4-Number Match</span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-brand-amber">35%</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
                      No
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-400">
                    Split equally among all 4-match winners
                  </td>
                  <td className="py-4 px-4 text-right font-display font-bold text-white">
                    ${Number(poolData.tier4Pool || 259).toLocaleString()}
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-4 font-bold text-white flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-slate-300" />
                    <span>3-Number Match</span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-300">25%</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
                      No
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-400">
                    Split equally among all 3-match winners
                  </td>
                  <td className="py-4 px-4 text-right font-display font-bold text-white">
                    ${Number(poolData.tier3Pool || 185).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. LATEST DRAW RESULTS TICKER (PRD § 06 & § 09) */}
      {latestDraw && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-2xl bg-dark-900/50 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-brand-mint/10 text-brand-mint">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs uppercase font-bold text-slate-400">Recent Official Draw</div>
                <div className="font-display font-bold text-white text-lg">{latestDraw.draw_code} · {latestDraw.draw_date}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-400 mr-2 font-medium">Winning Numbers:</span>
              {latestDraw.winning_numbers.map((n, i) => (
                <span key={i} className="w-10 h-10 rounded-xl bg-brand-coral/20 border border-brand-coral/40 text-brand-coral font-display font-black text-sm flex items-center justify-center shadow-sm">
                  {n}
                </span>
              ))}
            </div>

            <Link
              to="/mechanics"
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1"
            >
              <span>View Past Draw Archives</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-coral/20 via-brand-amber/10 to-transparent border border-brand-coral/30 p-10 sm:p-14 text-center space-y-6 relative overflow-hidden">
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white max-w-2xl mx-auto">
            Ready to give every round on the course real purpose?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-base">
            Join hundreds of golfers turning their Stableford scorecards into monthly cash thrills and meaningful community donations.
          </p>
          <div className="pt-2">
            <Link
              to={user ? "/dashboard" : "/auth?tab=register"}
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-brand-coral hover:bg-brand-coral-hover text-white font-bold text-base shadow-glow-coral transition transform hover:-translate-y-0.5"
            >
              <span>{user ? "Manage My Scores & Draw" : "Join Now — Instant Access"}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
