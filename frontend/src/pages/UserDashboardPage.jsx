import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Heart, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp,
  FileCheck,
  CreditCard,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';

export const UserDashboardPage = () => {
  const { user, refreshUser, updateProfile, updateSubscription } = useAuth();
  
  // Data states
  const [scores, setScores] = useState([]);
  const [participation, setParticipation] = useState(null);
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Score Form state (PRD § 05)
  const [scoreInput, setScoreInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [editingScoreId, setEditingScoreId] = useState(null);
  const [scoreError, setScoreError] = useState('');
  const [scoreSuccess, setScoreSuccess] = useState('');

  // Charity Slider state (PRD § 08.1)
  const [charityPct, setCharityPct] = useState(user?.charity_percentage || 10);
  const [savingCharity, setSavingCharity] = useState(false);

  // Proof Upload Modal state (PRD § 09)
  const [uploadWinnerTicket, setUploadWinnerTicket] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [scoresRes, partRes, charitiesRes] = await Promise.all([
        api.scores.get().catch(() => ({ scores: [] })),
        api.draws.getMyParticipation().catch(() => null),
        api.charities.getAll().catch(() => ({ charities: [] }))
      ]);

      setScores(scoresRes.scores || []);
      setParticipation(partRes);
      setCharities(charitiesRes.charities || []);
      if (user?.charity_percentage) setCharityPct(user.charity_percentage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // SCORE MANAGEMENT (PRD § 05)
  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    setScoreError('');
    setScoreSuccess('');

    const numericScore = parseInt(scoreInput, 10);
    if (isNaN(numericScore) || numericScore < 1 || numericScore > 45) {
      setScoreError('Score must be a valid Stableford number between 1 and 45.');
      return;
    }

    if (!dateInput) {
      setScoreError('A valid score date is required.');
      return;
    }

    try {
      let res;
      if (editingScoreId) {
        res = await api.scores.update(editingScoreId, numericScore, dateInput);
        setScoreSuccess('Score updated successfully.');
        setEditingScoreId(null);
      } else {
        const wasFull = scores.length >= 5;
        res = await api.scores.add(numericScore, dateInput);
        setScoreSuccess(wasFull 
          ? 'Score recorded! Oldest score was automatically evicted (5 rolling limit).'
          : 'Score recorded successfully.');
      }
      setScores(res.scores || []);
      setScoreInput('');
      setDateInput(new Date().toISOString().split('T')[0]);
      
      // Refresh participation ticket
      const updatedPart = await api.draws.getMyParticipation().catch(() => null);
      if (updatedPart) setParticipation(updatedPart);
    } catch (err) {
      setScoreError(err.message || 'Failed to save score.');
    }
  };

  const handleEditScore = (item) => {
    setEditingScoreId(item.id);
    setScoreInput(item.score.toString());
    setDateInput(item.score_date);
    setScoreError('');
    setScoreSuccess('');
  };

  const handleDeleteScore = async (id) => {
    if (!window.confirm('Delete this score entry?')) return;
    try {
      const res = await api.scores.delete(id);
      setScores(res.scores || []);
      const updatedPart = await api.draws.getMyParticipation().catch(() => null);
      if (updatedPart) setParticipation(updatedPart);
    } catch (err) {
      alert(err.message || 'Failed to delete score');
    }
  };

  // CHARITY PERCENTAGE SLIDER (PRD § 08.1)
  const handleSaveCharityPercentage = async () => {
    setSavingCharity(true);
    try {
      await updateProfile({ charityPercentage: parseFloat(charityPct) });
      await refreshUser();
      alert('Charity contribution percentage updated!');
    } catch (err) {
      alert(err.message || 'Failed to save percentage');
    } finally {
      setSavingCharity(false);
    }
  };

  const handleChangeCharity = async (newCharityId) => {
    try {
      await updateProfile({ charityId: newCharityId });
      await refreshUser();
    } catch (err) {
      alert(err.message || 'Failed to change charity');
    }
  };

  // WINNER PROOF UPLOAD (PRD § 09)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProof = async (e) => {
    e.preventDefault();
    if (!uploadWinnerTicket || !proofFile) return;

    setUploadingProof(true);
    setUploadSuccess('');
    try {
      const formData = new FormData();
      formData.append('proofImage', proofFile);

      await api.winners.uploadProof(uploadWinnerTicket.id, formData);
      setUploadSuccess('Proof submitted! The admin team is reviewing your scorecard.');
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });

      // Refresh winnings list
      const updatedPart = await api.draws.getMyParticipation();
      setParticipation(updatedPart);

      setTimeout(() => {
        setUploadWinnerTicket(null);
        setProofFile(null);
        setProofPreview('');
        setUploadSuccess('');
        setUploadingProof(false);
      }, 2500);
    } catch (err) {
      alert(err.message || 'Failed to upload proof');
      setUploadingProof(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-slate-400">Loading your golfer dashboard...</div>;
  }

  const selectedCharityObj = charities.find(c => c.id === user?.charity_id) || charities[0];
  const monthlySplitAmount = ((user?.subscription_price || 499) * (charityPct / 100)).toFixed(2);

  // Automatic Person Activity Completion Logic (User Request)
  const isSubActive = user?.subscription_status === 'active';
  const isCharityConfigured = !!user?.charity_id && Number(user?.charity_percentage || charityPct) >= 10;
  const isScoresReady = scores.length === 5;
  const activityCompleted = isSubActive && isCharityConfigured && isScoresReady;
  const completedTasksCount = (isSubActive ? 1 : 0) + (isCharityConfigured ? 1 : 0) + (isScoresReady ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. DASHBOARD HEADER & PROFILE OVERVIEW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              Welcome, {user?.name}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-coral/10 text-brand-coral border border-brand-coral/20">
              Subscriber Level 1
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Logged in as <span className="text-slate-300 font-mono">{user?.email}</span> · Manage your 5 scores, monthly draw participation, and charity impact.
          </p>
        </div>

        {/* Quick Win Counter in INR */}
        <div className="flex items-center space-x-4 bg-dark-900/80 border border-white/10 p-3 rounded-2xl">
          <div className="p-3 rounded-xl bg-brand-coral/10 text-brand-coral">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Winnings Paid</div>
            <div className="text-xl font-bold font-display text-white">
              {formatINR(participation?.totalWon || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* AUTOMATIC ACTIVITY COMPLETION TRACKER (USER REQUEST) */}
      <div className={`p-6 sm:p-7 rounded-3xl border transition-all duration-500 shadow-xl ${
        activityCompleted
          ? 'bg-gradient-to-br from-brand-mint/15 via-dark-900 to-dark-900 border-brand-mint/40 ring-1 ring-brand-mint/30 shadow-glow-mint'
          : 'bg-dark-900/80 border-brand-amber/30'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                activityCompleted 
                  ? 'bg-brand-mint text-dark-950 shadow-md' 
                  : 'bg-brand-amber/20 text-brand-amber border border-brand-amber/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${activityCompleted ? 'bg-dark-950 animate-ping' : 'bg-brand-amber'}`}></span>
                <span>{activityCompleted ? 'ACTIVITY STATUS: COMPLETED ✓' : `ACTIVITY STATUS: IN PROGRESS (${completedTasksCount}/3 DONE)`}</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">March 2026 Monthly Cycle</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white pt-1">
              {activityCompleted 
                ? '🎉 All Monthly Activities Done — You are officially in the draw!' 
                : 'Complete your monthly golfer requirements to enter the upcoming draw'}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {activityCompleted
                ? 'Your active subscription, charity allocation, and 5 rolling Stableford scores are verified. No further action needed until draw publishing on 31 March 2026.'
                : 'Follow the 3-step checklist below. Once all items are checked, your status will automatically switch to COMPLETED.'}
            </p>
          </div>

          {/* Completion Percentage Badge */}
          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-dark-950/70 border border-white/5 whitespace-nowrap self-start md:self-auto">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Activity Progress</div>
              <div className={`text-2xl font-black font-display ${activityCompleted ? 'text-brand-mint' : 'text-brand-amber'}`}>
                {Math.round((completedTasksCount / 3) * 100)}%
              </div>
            </div>
            <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 font-black text-xs ${
              activityCompleted 
                ? 'border-brand-mint text-brand-mint bg-brand-mint/10' 
                : 'border-brand-amber text-brand-amber bg-brand-amber/10'
            }`}>
              {completedTasksCount}/3
            </div>
          </div>
        </div>

        {/* 3 Step Interactive Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-5 mt-5 border-t border-white/10">
          <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
            isSubActive ? 'bg-brand-mint/10 border-brand-mint/30 text-slate-200' : 'bg-dark-950 border-white/5 text-slate-400'
          }`}>
            <div>
              <div className="font-bold text-white flex items-center space-x-1.5">
                <span>1. Subscription</span>
                {isSubActive && <CheckCircle2 className="w-3.5 h-3.5 text-brand-mint" />}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{isSubActive ? `${user.subscription_plan} plan active` : 'Plan inactive'}</div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${isSubActive ? 'bg-brand-mint/20 text-brand-mint' : 'bg-white/10 text-slate-400'}`}>
              {isSubActive ? 'Done ✓' : 'Incomplete'}
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
            isCharityConfigured ? 'bg-brand-mint/10 border-brand-mint/30 text-slate-200' : 'bg-dark-950 border-white/5 text-slate-400'
          }`}>
            <div>
              <div className="font-bold text-white flex items-center space-x-1.5">
                <span>2. Charity Set</span>
                {isCharityConfigured && <CheckCircle2 className="w-3.5 h-3.5 text-brand-mint" />}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{selectedCharityObj ? `${selectedCharityObj.name.slice(0, 16)}... (${charityPct}%)` : 'Select charity'}</div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${isCharityConfigured ? 'bg-brand-mint/20 text-brand-mint' : 'bg-white/10 text-slate-400'}`}>
              {isCharityConfigured ? 'Done ✓' : 'Incomplete'}
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
            isScoresReady ? 'bg-brand-mint/10 border-brand-mint/30 text-slate-200' : 'bg-dark-950 border-white/5 text-slate-400'
          }`}>
            <div>
              <div className="font-bold text-white flex items-center space-x-1.5">
                <span>3. 5 Rolling Scores</span>
                {isScoresReady && <CheckCircle2 className="w-3.5 h-3.5 text-brand-mint" />}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{isScoresReady ? '5/5 scores ready for draw' : `${scores.length}/5 scores logged (${5 - scores.length} more needed)`}</div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${isScoresReady ? 'bg-brand-mint/20 text-brand-mint' : 'bg-brand-amber/20 text-brand-amber'}`}>
              {isScoresReady ? 'Done ✓' : `${scores.length}/5`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. TOP GRID: SUBSCRIPTION STATUS & PARTICIPATION TICKET */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Module 1: Subscription Status (PRD § 10) */}
        <div className="lg:col-span-6 rounded-3xl bg-dark-900/70 border border-white/10 p-7 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <CreditCard className="w-5 h-5 text-brand-coral" />
              <h2 className="text-lg font-display font-bold text-white">Subscription Status</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
              user?.subscription_status === 'active' 
                ? 'bg-brand-mint/10 text-brand-mint border border-brand-mint/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>{user?.subscription_status || 'Inactive'}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-dark-950/60 border border-white/5 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Plan Type</div>
              <div className="text-white font-bold capitalize mt-0.5 text-sm">
                {user?.subscription_plan === 'yearly' ? 'Yearly Plan (Discounted)' : 'Monthly Plan'}
              </div>
              <div className="text-slate-500 text-[11px]">
                {formatINR(user?.subscription_price || 499)} / billing cycle
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Renewal Date</div>
              <div className="text-white font-bold mt-0.5 text-sm font-mono">
                {user?.renewal_date || '2026-10-21'}
              </div>
              <div className="text-slate-500 text-[11px]">Automatic PCI renewal</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-1">
            {user?.subscription_status === 'active' ? (
              <button
                onClick={async () => {
                  if (window.confirm('Cancel your monthly draw subscription? Your scores will stop participating in upcoming draws.')) {
                    await updateSubscription('cancel');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-400 hover:text-red-400 transition font-semibold"
              >
                Cancel Subscription
              </button>
            ) : (
              <button
                onClick={async () => {
                  await updateSubscription('reactivate', 'monthly');
                }}
                className="px-5 py-2.5 rounded-xl bg-brand-coral hover:bg-brand-coral-hover text-white text-xs font-bold transition shadow-glow-coral"
              >
                Reactivate Subscription (₹499/mo)
              </button>
            )}

            <button
              onClick={async () => {
                const newPlan = user?.subscription_plan === 'yearly' ? 'monthly' : 'yearly';
                await updateSubscription('change_plan', newPlan);
              }}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition font-semibold"
            >
              Switch to {user?.subscription_plan === 'yearly' ? 'Monthly (₹499/mo)' : 'Yearly (₹4,990/yr - Save ₹998)'}
            </button>
          </div>
        </div>

        {/* Module 4: Upcoming Draw Participation Ticket (PRD § 10) */}
        <div className="lg:col-span-6 rounded-3xl bg-dark-900/70 border border-white/10 p-7 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-5 h-5 text-brand-mint" />
              <h2 className="text-lg font-display font-bold text-white">Upcoming Draw Participation</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">March 2026 Pool</span>
          </div>

          <div className="space-y-3">
            <div className="text-xs text-slate-300 flex justify-between">
              <span>Your Active 5-Number Ticket:</span>
              <span className={`font-semibold ${scores.length === 5 ? 'text-brand-mint' : 'text-brand-amber'}`}>
                {scores.length === 5 ? '✓ 5/5 Eligible' : `⚠️ ${scores.length}/5 Scores (Need 5 to Enter)`}
              </span>
            </div>

            {/* 5 Rolling Numbers Display */}
            <div className="flex items-center space-x-3">
              {[0, 1, 2, 3, 4].map((slotIdx) => {
                const item = scores[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    className={`flex-1 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-bold border transition ${
                      item
                        ? 'bg-brand-coral/15 border-brand-coral/40 text-brand-coral shadow-inner'
                        : 'bg-dark-950/60 border-dashed border-white/15 text-slate-600'
                    }`}
                  >
                    <span className="text-lg leading-none">{item ? item.score : '-'}</span>
                    <span className="text-[9px] uppercase tracking-tight text-slate-500 mt-1">
                      {item ? item.score_date.slice(5) : `Slot ${slotIdx + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              These 5 numbers are derived from your latest golf rounds. Whenever you log a new score, it pushes into this ticket and rolls the oldest score out.
            </p>
          </div>
        </div>

      </div>

      {/* 3. MODULE 2: SCORE MANAGEMENT SYSTEM (PRD § 05 & § 10) */}
      <div className="rounded-3xl bg-dark-900/70 border border-white/10 p-7 sm:p-9 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-coral">
              PRD § 05 Specification
            </span>
            <h2 className="text-2xl font-display font-bold text-white mt-1">
              Golf Scorecard Management (Stableford 1–45)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Only the latest 5 scores are retained. Only 1 score is allowed per date.
            </p>
          </div>

          <div className="text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-300">
            Current buffer: <strong className="text-white">{scores.length} / 5</strong> scores active
          </div>
        </div>

        {/* Score Entry / Edit Form */}
        <form onSubmit={handleScoreSubmit} className="p-5 rounded-2xl bg-dark-950/80 border border-white/5 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>{editingScoreId ? '✏️ Edit Existing Score Entry' : '➕ Enter New Golf Score'}</span>
            {editingScoreId && (
              <button
                type="button"
                onClick={() => {
                  setEditingScoreId(null);
                  setScoreInput('');
                  setDateInput(new Date().toISOString().split('T')[0]);
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            
            <div className="sm:col-span-4 space-y-1">
              <label className="text-xs text-slate-400 font-medium">Stableford Score (1–45)</label>
              <input
                type="number"
                min="1"
                max="45"
                placeholder="e.g. 38"
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white font-mono font-bold text-base focus:border-brand-coral focus:outline-none"
                required
              />
            </div>

            <div className="sm:col-span-5 space-y-1">
              <label className="text-xs text-slate-400 font-medium">Play Date (1 Entry Per Date)</label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-sm focus:border-brand-coral focus:outline-none"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-coral hover:bg-brand-coral-hover text-white font-bold text-sm shadow-glow-coral transition"
              >
                {editingScoreId ? 'Update Score' : 'Record Score'}
              </button>
            </div>

          </div>

          {scoreError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{scoreError}</span>
            </div>
          )}

          {scoreSuccess && (
            <div className="p-3 rounded-xl bg-brand-mint/10 border border-brand-mint/20 text-brand-mint text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{scoreSuccess}</span>
            </div>
          )}
        </form>

        {/* 5 Rolling Scores Table (Reverse Chronological, PRD § 05) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase font-bold text-slate-400">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Play Date</th>
                <th className="py-3 px-4">Stableford Score</th>
                <th className="py-3 px-4">Retention Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 text-xs">
              {scores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No scores recorded yet. Enter your first round above to start participating!
                  </td>
                </tr>
              ) : (
                scores.map((s, index) => (
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      #{index + 1} {index === 0 && <span className="text-[10px] text-brand-mint uppercase ml-1">(Latest)</span>}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-white flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-brand-coral" />
                      <span>{s.score_date}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-3 py-1 rounded-lg bg-brand-coral/20 text-brand-coral font-bold font-mono text-sm">
                        {s.score} pts
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-mint/10 text-brand-mint text-[10px] font-bold">
                        Active in Current Draw Ticket
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditScore(s)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                        title="Edit score"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteScore(s.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                        title="Delete score"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 4. MODULE 3: CHARITY SELECTION & CONTRIBUTION SLIDER (PRD § 08 & § 10) */}
      <div className="rounded-3xl bg-dark-900/70 border border-white/10 p-7 sm:p-9 space-y-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand-coral">
            PRD § 08 Giving Model
          </span>
          <h2 className="text-2xl font-display font-bold text-white mt-1">
            Charity Allocation & Impact Slider
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            A minimum of 10% of your subscription fee is guaranteed to your chosen charity. You can voluntarily increase this anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Selected Charity Card */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-dark-950 border border-white/5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-dark-900 border border-white/10 overflow-hidden">
                <img src={selectedCharityObj?.logo_url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">{selectedCharityObj?.category}</span>
                <h3 className="text-base font-bold text-white">{selectedCharityObj?.name}</h3>
              </div>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2">
              {selectedCharityObj?.mission}
            </p>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <label className="text-xs text-slate-400">Change Recipient:</label>
              <select
                value={user?.charity_id || ''}
                onChange={(e) => handleChangeCharity(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 rounded-lg bg-dark-900 border border-white/10 text-xs text-white focus:outline-none"
              >
                {charities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Interactive Slider */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  Your Contribution Percentage
                </label>
                <div className="text-4xl font-display font-black text-brand-coral mt-1">
                  {charityPct}%
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium">Monthly Allocation:</div>
                <div className="text-xl font-bold font-display text-white">
                  {formatINR(monthlySplitAmount)} / month
                </div>
              </div>
            </div>

            {/* Range input (min 10%, max 75%) */}
            <div className="space-y-2">
              <input
                type="range"
                min="10"
                max="75"
                step="5"
                value={charityPct}
                onChange={(e) => setCharityPct(parseInt(e.target.value, 10))}
                className="w-full accent-brand-coral cursor-pointer h-2 bg-dark-950 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>10% (Required Minimum)</span>
                <span>25%</span>
                <span>50%</span>
                <span>75% (Maximum Support)</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveCharityPercentage}
                disabled={savingCharity}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition border border-white/10"
              >
                {savingCharity ? 'Saving...' : 'Save Contribution Percentage'}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 5. MODULE 5: WINNINGS OVERVIEW & VERIFICATION PROOF UPLOAD (PRD § 09 & § 10) */}
      <div className="rounded-3xl bg-dark-900/70 border border-white/10 p-7 sm:p-9 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-coral">
              PRD § 09 & § 10 Winnings & Verification
            </span>
            <h2 className="text-2xl font-display font-bold text-white mt-1">
              Prize History & Verification Claims
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Winners submit an official screenshot of their scorecard from their golf platform (Golf Genius, Golfshot, HowDidiDo, etc.) to trigger payout.
            </p>
          </div>

          <div className="text-xs text-right">
            <span className="text-slate-400">Pending Claims: </span>
            <strong className="text-brand-coral">{formatINR(participation?.pendingWon || 0)}</strong>
          </div>
        </div>

        {/* Winnings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase font-bold text-slate-400">
                <th className="py-3 px-4">Draw</th>
                <th className="py-3 px-4">Match Tier</th>
                <th className="py-3 px-4">Matched Numbers</th>
                <th className="py-3 px-4">Prize Amount</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 text-xs">
              {(!participation?.winnings || participation.winnings.length === 0) ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No winning tickets recorded yet. Keep your 5 scores updated for the next monthly draw!
                  </td>
                </tr>
              ) : (
                participation.winnings.map((w) => (
                  <tr key={w.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{w.draw_code}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-coral/10 text-brand-coral font-bold uppercase text-[10px]">
                        {w.match_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-brand-mint font-bold">
                      [{w.matched_numbers.join(', ')}]
                    </td>
                    <td className="py-3.5 px-4 font-display font-bold text-white text-sm">
                      {formatINR(w.prize_amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                        w.verification_status === 'approved'
                          ? 'bg-brand-mint/10 text-brand-mint'
                          : w.verification_status === 'rejected'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-brand-amber/10 text-brand-amber'
                      }`}>
                        {w.verification_status === 'approved' ? '✓ Verified' : w.verification_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        w.payment_status === 'paid' ? 'bg-brand-mint/20 text-brand-mint' : 'bg-white/10 text-slate-400'
                      }`}>
                        {w.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {w.payment_status === 'paid' ? (
                        <span className="text-[10px] text-slate-500 font-mono">Paid {w.paid_at?.slice(0, 10)}</span>
                      ) : (
                        <button
                          onClick={() => {
                            setUploadWinnerTicket(w);
                            setProofFile(null);
                            setProofPreview('');
                            setUploadSuccess('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral text-xs font-bold transition flex items-center space-x-1 ml-auto"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{w.proof_url ? 'Re-upload Proof' : 'Upload Proof'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROOF UPLOAD MODAL (PRD § 09) */}
      {uploadWinnerTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-dark-900 border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-coral">
                  Winner Verification (PRD § 09)
                </span>
                <h3 className="text-xl font-display font-bold text-white mt-1">
                  Claim Prize of {formatINR(uploadWinnerTicket.prize_amount)}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Draw: {uploadWinnerTicket.draw_code} ({uploadWinnerTicket.match_type})
                </p>
              </div>
              <button
                onClick={() => setUploadWinnerTicket(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {uploadSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-brand-mint/20 text-brand-mint flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Scorecard Proof Received!</h4>
                <p className="text-xs text-slate-400">{uploadSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleUploadProof} className="space-y-4">
                
                <div className="p-4 rounded-2xl bg-dark-950 border border-white/5 text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-white">Verification Instructions:</div>
                  <p className="text-slate-400 leading-relaxed">
                    Upload a clean screenshot of your verified rounds from your golf application (Golfshot, HowDidiDo, Golf Genius, etc.) showing the dates and scores corresponding to this winning draw.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-medium block">Select Screenshot Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/15 cursor-pointer"
                    required
                  />
                </div>

                {proofPreview && (
                  <div className="rounded-xl overflow-hidden border border-white/10 max-h-48">
                    <img src={proofPreview} alt="Scorecard Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={uploadingProof || !proofFile}
                    className="w-full py-3 rounded-xl bg-brand-coral hover:bg-brand-coral-hover text-white font-bold text-sm shadow-glow-coral transition disabled:opacity-50"
                  >
                    {uploadingProof ? 'Uploading Scorecard...' : 'Submit Scorecard for Verification'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
