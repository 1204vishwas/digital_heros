import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  Heart, 
  ShieldCheck, 
  BarChart3, 
  Play, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Upload, 
  Eye, 
  RefreshCw,
  TrendingUp,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'draws' | 'charities' | 'winners' | 'reports'

  // Surface 1: User Management state
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [editingUserScores, setEditingUserScores] = useState(null);
  const [userScoresForm, setUserScoresForm] = useState([]);

  // Surface 2: Draw Management state
  const [drawMode, setDrawMode] = useState('algorithmic'); // 'algorithmic' | 'random'
  const [simulationData, setSimulationData] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState('');

  // Surface 3: Charity Management state
  const [charitiesList, setCharitiesList] = useState([]);
  const [editingCharity, setEditingCharity] = useState(null);
  const [charityFormData, setCharityFormData] = useState({
    name: '',
    category: 'Youth & Education',
    mission: '',
    description: '',
    logoUrl: '',
    coverImage: '',
    targetAmount: 500000,
    isFeatured: false
  });
  const [newEventCharityId, setNewEventCharityId] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    eventDate: new Date().toISOString().split('T')[0],
    location: '',
    description: ''
  });

  // Surface 4: Winners Management state
  const [winnersList, setWinnersList] = useState([]);
  const [winnerFilterStatus, setWinnerFilterStatus] = useState('');
  const [reviewingWinner, setReviewingWinner] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Surface 5: Reports & Analytics state
  const [reportMetrics, setReportMetrics] = useState(null);
  const [scoreDistribution, setScoreDistribution] = useState([]);

  useEffect(() => {
    loadUsers();
    loadCharities();
    loadWinners();
    loadReports();
  }, []);

  // LOADERS
  const loadUsers = async () => {
    try {
      const params = {};
      if (userSearch) params.search = userSearch;
      if (userStatusFilter !== 'all') params.status = userStatusFilter;
      const res = await api.admin.getUsers(params);
      setUsersList(res.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCharities = async () => {
    try {
      const res = await api.charities.getAll();
      setCharitiesList(res.charities || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadWinners = async () => {
    try {
      const params = {};
      if (winnerFilterStatus) params.status = winnerFilterStatus;
      const res = await api.winners.getAll(params);
      setWinnersList(res.winners || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReports = async () => {
    try {
      const [repRes, distRes] = await Promise.all([
        api.admin.getReports(),
        api.admin.getScoreDistribution()
      ]);
      setReportMetrics(repRes);
      setScoreDistribution(distRes.distribution || []);
    } catch (err) {
      console.error(err);
    }
  };

  // SURFACE 1: USER HANDLERS
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.admin.updateUser(editingUser.id, {
        name: editingUser.name,
        role: editingUser.role,
        subscriptionPlan: editingUser.subscription_plan,
        subscriptionStatus: editingUser.subscription_status,
        charityPercentage: parseFloat(editingUser.charity_percentage)
      });
      alert('User profile updated');
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      alert(err.message || 'Update failed');
    }
  };

  const handleOpenScoreEditor = (u) => {
    setEditingUserScores(u);
    // Clone scores or provide empty slots
    const rawScores = (u.scores || []).map(s => ({ score: s.score, score_date: s.score_date }));
    while (rawScores.length < 5) {
      rawScores.push({ score: 36, score_date: `2026-03-${(rawScores.length * 2 + 10).toString().padStart(2, '0')}` });
    }
    setUserScoresForm(rawScores);
  };

  const handleSaveUserScores = async (e) => {
    e.preventDefault();
    if (!editingUserScores) return;
    try {
      await api.admin.updateUserScores(editingUserScores.id, userScoresForm);
      alert('Scores updated for user');
      setEditingUserScores(null);
      loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to update scores');
    }
  };

  // SURFACE 2: DRAW SIMULATION & PUBLISHING HANDLERS (PRD § 06 & § 07)
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setPublishedSuccess('');
    try {
      const res = await api.draws.simulate(drawMode);
      setSimulationData(res.simulation);
    } catch (err) {
      alert(err.message || 'Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePublishDraw = async () => {
    if (!simulationData) return;
    if (!window.confirm(`Publish official draw with winning numbers [${simulationData.winningNumbers.join(', ')}]? This will record winner tickets and update the prize pool.`)) return;

    setIsPublishing(true);
    try {
      const res = await api.draws.publish(simulationData.mode, simulationData.winningNumbers);
      setPublishedSuccess(`Official Draw ${res.draw.drawCode} published successfully! Winners notified.`);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setSimulationData(null);
      loadWinners();
      loadReports();
    } catch (err) {
      alert(err.message || 'Failed to publish draw');
    } finally {
      setIsPublishing(false);
    }
  };

  // SURFACE 3: CHARITY HANDLERS
  const handleSaveCharity = async (e) => {
    e.preventDefault();
    try {
      if (editingCharity && editingCharity.id) {
        await api.charities.update(editingCharity.id, charityFormData);
      } else {
        await api.charities.create(charityFormData);
      }
      setEditingCharity(null);
      loadCharities();
    } catch (err) {
      alert(err.message || 'Failed to save charity');
    }
  };

  const handleDeleteCharity = async (id) => {
    if (!window.confirm('Delete this charity?')) return;
    try {
      await api.charities.delete(id);
      loadCharities();
    } catch (err) {
      alert(err.message || 'Failed to delete charity');
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEventCharityId) return;
    try {
      await api.charities.addEvent(newEventCharityId, eventFormData);
      alert('Event added');
      setNewEventCharityId(null);
      setEventFormData({
        title: '',
        eventDate: new Date().toISOString().split('T')[0],
        location: '',
        description: ''
      });
      loadCharities();
    } catch (err) {
      alert(err.message || 'Failed to add event');
    }
  };

  // SURFACE 4: WINNER VERIFICATION & PAYOUT HANDLERS (PRD § 09)
  const handleVerifyWinner = async (winnerId, status) => {
    try {
      await api.winners.verify(winnerId, { status, reason: rejectionReason });
      alert(`Winner marked as ${status}`);
      setReviewingWinner(null);
      setRejectionReason('');
      loadWinners();
      loadReports();
    } catch (err) {
      alert(err.message || 'Verification update failed');
    }
  };

  const handlePayoutWinner = async (winnerId) => {
    if (!window.confirm('Process payout for this approved winner?')) return;
    try {
      await api.winners.payout(winnerId);
      alert('Payout completed and transaction marked as Paid');
      loadWinners();
      loadReports();
    } catch (err) {
      alert(err.message || 'Payout failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-display font-extrabold text-white">Administrator Hub</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-coral/20 text-brand-coral border border-brand-coral/30">
              PRD § 11 Full Control
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Five control surfaces covering every operational need — from user management through reporting.
          </p>
        </div>

        {/* Quick Switch Tabs */}
        <div className="flex flex-wrap gap-1 p-1 rounded-2xl bg-dark-900 border border-white/10">
          {[
            { id: 'users', label: '01 Users', icon: Users },
            { id: 'draws', label: '02 Draws', icon: Trophy },
            { id: 'charities', label: '03 Charities', icon: Heart },
            { id: 'winners', label: '04 Winners', icon: ShieldCheck },
            { id: 'reports', label: '05 Reports', icon: BarChart3 },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-coral text-white shadow-glow-coral'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SURFACE 01: USER MANAGEMENT (PRD § 11) */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-display font-bold text-white">User & Score Management</h2>
              <p className="text-xs text-slate-400">View/edit subscriber profiles, adjust scores, and manage subscriptions.</p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                className="px-3.5 py-2 rounded-xl bg-dark-900 border border-white/10 text-xs text-white focus:border-brand-coral focus:outline-none"
              />
              <select
                value={userStatusFilter}
                onChange={(e) => {
                  setUserStatusFilter(e.target.value);
                  setTimeout(loadUsers, 10);
                }}
                className="px-3 py-2 rounded-xl bg-dark-900 border border-white/10 text-xs text-white focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="lapsed">Lapsed</option>
              </select>
            </div>
          </div>

          <div className="rounded-3xl bg-dark-900/70 border border-white/10 overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase font-bold text-slate-400 bg-white/[0.02]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Subscription</th>
                  <th className="py-3 px-4">Charity Split</th>
                  <th className="py-3 px-4">Active 5 Scores</th>
                  <th className="py-3 px-4">Activity Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 text-xs">
                {usersList.map((u) => {
                  const isSubActive = u.subscription_status === 'active';
                  const isCharityConfigured = !!u.charity_id || !!u.charity_name;
                  const hasFiveScores = (u.scores || []).length === 5;
                  const isComplete = isSubActive && isCharityConfigured && hasFiveScores;
                  const completedCount = (isSubActive ? 1 : 0) + (isCharityConfigured ? 1 : 0) + (hasFiveScores ? 1 : 0);

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.01]">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          u.role === 'admin' ? 'bg-brand-coral/20 text-brand-coral' : 'bg-white/10 text-slate-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className={`w-2 h-2 rounded-full ${u.subscription_status === 'active' ? 'bg-brand-mint' : 'bg-red-400'}`}></span>
                          <span className="capitalize font-semibold text-white">{u.subscription_status}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 capitalize">{u.subscription_plan} plan</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{u.charity_percentage || 10}%</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{u.charity_name || 'Not set'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex space-x-1">
                          {(u.scores || []).map((s, idx) => (
                            <span key={idx} className="w-6 h-6 rounded bg-dark-950 border border-white/10 text-brand-coral font-bold font-mono text-[11px] flex items-center justify-center">
                              {s.score}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isComplete ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-brand-mint/15 border border-brand-mint/30 text-brand-mint text-[11px] font-bold">
                            <span>Completed ✓</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-800/80 border border-white/10 text-slate-400 text-[11px] font-medium">
                            <span>Incomplete ({completedCount}/3)</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition font-medium text-[11px]"
                        >
                          Edit Profile
                        </button>
                        <button
                          onClick={() => handleOpenScoreEditor(u)}
                          className="px-2.5 py-1.5 rounded-lg bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral transition font-bold text-[11px]"
                        >
                          Edit Scores
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SURFACE 02: DRAW MANAGEMENT (PRD § 06 & § 07 & § 11) */}
      {activeTab === 'draws' && (
        <div className="space-y-8">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-coral">
              Surface 02 · Draw & Reward Engine
            </span>
            <h2 className="text-2xl font-display font-bold text-white mt-1">
              Configure, Simulate & Publish Monthly Draws
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Admin controls publishing with simulation before commit. Choose between Random lottery mode and Algorithmic frequency weighting.
            </p>
          </div>

          {/* Config Card */}
          <div className="p-7 rounded-3xl bg-dark-900/70 border border-white/10 space-y-6">
            <h3 className="text-base font-display font-bold text-white">Draw Engine Configuration</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Mode 1: Algorithmic */}
              <div
                onClick={() => setDrawMode('algorithmic')}
                className={`p-5 rounded-2xl border cursor-pointer transition ${
                  drawMode === 'algorithmic'
                    ? 'bg-brand-coral/10 border-brand-coral ring-1 ring-brand-coral'
                    : 'bg-dark-950/60 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Algorithmic Mode (Weighted)</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-brand-coral/20 text-brand-coral font-bold">PRD § 06</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Winning numbers are weighted proportionally according to the score frequencies entered by all active subscribers.
                </p>
              </div>

              {/* Mode 2: Random */}
              <div
                onClick={() => setDrawMode('random')}
                className={`p-5 rounded-2xl border cursor-pointer transition ${
                  drawMode === 'random'
                    ? 'bg-brand-coral/10 border-brand-coral ring-1 ring-brand-coral'
                    : 'bg-dark-950/60 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Random Lottery Mode</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-300 font-bold">PRD § 06</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Standard uniform lottery distribution across 1 to 45 without weighting.
                </p>
              </div>

            </div>

            <div className="flex items-center space-x-4 pt-2">
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? 'Simulating...' : 'Run Simulation Before Publish'}</span>
              </button>
            </div>

            {publishedSuccess && (
              <div className="p-4 rounded-xl bg-brand-mint/10 border border-brand-mint/30 text-brand-mint text-xs font-bold flex items-center space-x-2">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>{publishedSuccess}</span>
              </div>
            )}
          </div>

          {/* Simulation Results Preview (PRD § 06 "Simulation before publish") */}
          {simulationData && (
            <div className="p-8 rounded-3xl bg-dark-900 border border-brand-coral/40 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-coral">Simulation Results Preview</span>
                  <h3 className="text-2xl font-display font-bold text-white mt-0.5">
                    Generated Winning Numbers & Match Breakdown
                  </h3>
                </div>

                <button
                  onClick={handlePublishDraw}
                  disabled={isPublishing}
                  className="px-6 py-3 rounded-xl bg-brand-coral hover:bg-brand-coral-hover text-white font-bold text-sm shadow-glow-coral transition flex items-center space-x-2"
                >
                  <Trophy className="w-4 h-4" />
                  <span>{isPublishing ? 'Publishing...' : 'Commit & Publish Official Draw'}</span>
                </button>
              </div>

              {/* Numbers Bar */}
              <div className="p-5 rounded-2xl bg-dark-950 border border-white/10 flex items-center space-x-4">
                <span className="text-xs text-slate-400 font-semibold uppercase">Simulated 5 Numbers:</span>
                <div className="flex space-x-3">
                  {simulationData.winningNumbers.map(n => (
                    <span key={n} className="w-12 h-12 rounded-xl bg-brand-coral/20 border border-brand-coral text-brand-coral font-display font-black text-lg flex items-center justify-center shadow-glow-coral">
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-dark-950 border border-white/5">
                  <div className="text-slate-400">Total Active Subscribers</div>
                  <div className="text-xl font-bold font-display text-white mt-1">
                    {simulationData.summary.totalSubscribers}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-dark-950 border border-white/5">
                  <div className="text-slate-400">Total Prize Pool</div>
                  <div className="text-xl font-bold font-display text-white mt-1">
                    {formatINR(simulationData.pool.totalPool)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-dark-950 border border-white/5">
                  <div className="text-slate-400">Total Winners Found</div>
                  <div className="text-xl font-bold font-display text-brand-mint mt-1">
                    {simulationData.summary.totalWinners}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-dark-950 border border-white/5">
                  <div className="text-slate-400">Unclaimed 5-Match Rollover</div>
                  <div className="text-xl font-bold font-display text-brand-coral mt-1">
                    {formatINR(simulationData.nextRollover)}
                  </div>
                </div>
              </div>

              {/* Winners Table */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-slate-300">Simulated Winners Ledger</h4>
                <div className="rounded-2xl bg-dark-950 border border-white/5 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 uppercase">
                        <th className="p-3">Subscriber</th>
                        <th className="p-3">Match Tier</th>
                        <th className="p-3">Matched Numbers</th>
                        <th className="p-3 text-right">Prize Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {[
                        ...simulationData.winners.tier5,
                        ...simulationData.winners.tier4,
                        ...simulationData.winners.tier3
                      ].length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-500">
                            No subscribers matched 3, 4, or 5 numbers in this simulated draw. Full 5-match jackpot rolls over!
                          </td>
                        </tr>
                      ) : (
                        [
                          ...simulationData.winners.tier5,
                          ...simulationData.winners.tier4,
                          ...simulationData.winners.tier3
                        ].map((w, i) => (
                          <tr key={i}>
                            <td className="p-3 font-semibold text-white">{w.name} ({w.email})</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded uppercase font-bold bg-brand-coral/20 text-brand-coral">
                                {w.matchType}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-brand-mint">[{w.matchedNumbers.join(', ')}]</td>
                            <td className="p-3 text-right font-display font-bold text-white">
                              {formatINR(w.prizeAmount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* SURFACE 03: CHARITY MANAGEMENT (PRD § 11) */}
      {activeTab === 'charities' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-display font-bold text-white">Charity Listings & Media</h2>
              <p className="text-xs text-slate-400">Add, edit, delete charities, manage target funding goals and golf days.</p>
            </div>

            <button
              onClick={() => {
                setEditingCharity({});
                setCharityFormData({
                  name: '',
                  category: 'Youth & Education',
                  mission: '',
                  description: '',
                  logoUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=200',
                  coverImage: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200',
                  targetAmount: 500000,
                  isFeatured: false
                });
              }}
              className="px-4 py-2 rounded-xl bg-brand-coral hover:bg-brand-coral-hover text-white font-bold text-xs shadow-glow-coral transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Charity</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charitiesList.map(c => (
              <div key={c.id} className="rounded-2xl bg-dark-900/70 border border-white/10 p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300 font-semibold">{c.category}</span>
                    {c.is_featured ? <span className="text-[10px] text-brand-coral font-bold">★ Spotlight</span> : null}
                  </div>
                  <h3 className="text-base font-bold text-white">{c.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{c.mission}</p>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Raised:</span>
                    <span className="font-bold text-white">{formatINR(c.raised_amount)}</span>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => {
                        setEditingCharity(c);
                        setCharityFormData({
                          name: c.name,
                          category: c.category,
                          mission: c.mission,
                          description: c.description,
                          logoUrl: c.logo_url,
                          coverImage: c.cover_image,
                          targetAmount: c.target_amount,
                          isFeatured: !!c.is_featured
                        });
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setNewEventCharityId(c.id)}
                      className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-brand-coral"
                      title="Add Golf Day Event"
                    >
                      + Event
                    </button>
                    <button
                      onClick={() => handleDeleteCharity(c.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SURFACE 04: WINNERS MANAGEMENT (PRD § 09 & § 11) */}
      {activeTab === 'winners' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-display font-bold text-white">Winner Verification & Payouts</h2>
              <p className="text-xs text-slate-400">Inspect golfer scorecard screenshots, approve/reject submissions, and record payouts.</p>
            </div>

            <select
              value={winnerFilterStatus}
              onChange={(e) => {
                setWinnerFilterStatus(e.target.value);
                setTimeout(loadWinners, 10);
              }}
              className="px-3 py-2 rounded-xl bg-dark-900 border border-white/10 text-xs text-white focus:outline-none"
            >
              <option value="">All Verification States</option>
              <option value="pending">Pending Verification</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="rounded-3xl bg-dark-900/70 border border-white/10 overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase font-bold text-slate-400 bg-white/[0.02]">
                  <th className="py-3 px-4">Winner</th>
                  <th className="py-3 px-4">Draw</th>
                  <th className="py-3 px-4">Match Tier</th>
                  <th className="py-3 px-4">Prize</th>
                  <th className="py-3 px-4">Scorecard Proof</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Payout</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 text-xs">
                {winnersList.map(w => (
                  <tr key={w.id} className="hover:bg-white/[0.01]">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{w.user_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{w.user_email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">{w.draw_code}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded uppercase font-bold bg-brand-coral/20 text-brand-coral">
                        {w.match_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-display font-bold text-white">
                      {formatINR(w.prize_amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      {w.proof_url ? (
                        <button
                          onClick={() => setReviewingWinner(w)}
                          className="flex items-center space-x-1 text-xs text-brand-mint hover:underline font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Proof Screenshot</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 italic">No proof uploaded</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded capitalize font-bold text-[10px] ${
                        w.verification_status === 'approved'
                          ? 'bg-brand-mint/10 text-brand-mint'
                          : w.verification_status === 'rejected'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-brand-amber/10 text-brand-amber'
                      }`}>
                        {w.verification_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] ${
                        w.payment_status === 'paid' ? 'bg-brand-mint/20 text-brand-mint' : 'bg-white/10 text-slate-400'
                      }`}>
                        {w.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setReviewingWinner(w)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold"
                      >
                        Review
                      </button>

                      {w.verification_status === 'approved' && w.payment_status !== 'paid' && (
                        <button
                          onClick={() => handlePayoutWinner(w.id)}
                          className="px-3 py-1.5 rounded-lg bg-brand-mint/20 hover:bg-brand-mint/30 text-brand-mint text-[11px] font-bold"
                        >
                          Payout ₹
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SURFACE 05: REPORTS & ANALYTICS (PRD § 11) */}
      {activeTab === 'reports' && reportMetrics && (
        <div className="space-y-8">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-coral">
              Surface 05 · Executive Intelligence
            </span>
            <h2 className="text-2xl font-display font-bold text-white mt-1">
              Platform Performance & Charitable Distribution
            </h2>
          </div>

          {/* 4 KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <div className="p-6 rounded-3xl bg-dark-900/80 border border-white/10 space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Total Registered Users</div>
              <div className="text-3xl font-display font-black text-white">
                {reportMetrics.users.total_users}
              </div>
              <div className="text-[11px] text-brand-mint font-medium">
                {reportMetrics.users.active_subscribers} active paying subscribers
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-dark-900/80 border border-white/10 space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Current Jackpot Rollover</div>
              <div className="text-3xl font-display font-black text-brand-coral">
                {formatINR(reportMetrics.prizePool.currentRollover)}
              </div>
              <div className="text-[11px] text-slate-400">
                100% carried forward to next draw
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-dark-900/80 border border-white/10 space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Total Payouts Distributed</div>
              <div className="text-3xl font-display font-black text-brand-mint">
                {formatINR(reportMetrics.prizePool.totalPayoutsPaid)}
              </div>
              <div className="text-[11px] text-slate-400">
                Across {reportMetrics.prizePool.totalWinnersCount} verified winners
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-dark-900/80 border border-white/10 space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Charity Contributions</div>
              <div className="text-3xl font-display font-black text-white">
                {formatINR(reportMetrics.charity.total_charity_contributions)}
              </div>
              <div className="text-[11px] text-brand-mint font-medium">
                Split: {formatINR(reportMetrics.charity.subscription_charity_split)} | Direct: {formatINR(reportMetrics.charity.direct_donations_total)}
              </div>
            </div>
          </div>

          {/* Score Frequency Distribution (1-45 Stableford Chart) */}
          <div className="p-7 rounded-3xl bg-dark-900/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Active Score Frequency Distribution (1–45)</h3>
                <p className="text-xs text-slate-400">Directly powers the Algorithmic Draw weighting algorithm.</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Laplace Smoothed</span>
            </div>

            <div className="h-44 flex items-end space-x-1 pt-6 px-2 overflow-x-auto">
              {scoreDistribution.map(item => {
                const maxCount = Math.max(...scoreDistribution.map(d => d.count), 1);
                const heightPct = Math.max(8, Math.round((item.count / maxCount) * 100));
                return (
                  <div key={item.score} className="flex-1 min-w-[14px] flex flex-col items-center group relative">
                    <div
                      className="w-full rounded-t bg-brand-coral/40 group-hover:bg-brand-coral transition-all"
                      style={{ height: `${heightPct}%` }}
                    ></div>
                    <span className="text-[9px] font-mono text-slate-500 mt-1">{item.score}</span>
                    <div className="absolute -top-7 hidden group-hover:block bg-dark-950 px-1.5 py-0.5 rounded text-[10px] text-white border border-white/10 z-10">
                      {item.count}x
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charity Breakdown Table */}
          <div className="p-7 rounded-3xl bg-dark-900/80 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white">Charity Fund Distribution by Foundation</h3>
            <div className="rounded-2xl overflow-hidden border border-white/5">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase">
                    <th className="p-3">Charity Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Platform Raised</th>
                    <th className="p-3">Annual Goal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {reportMetrics.charity.breakdown.map(c => (
                    <tr key={c.id}>
                      <td className="p-3 font-semibold text-white">{c.name}</td>
                      <td className="p-3 text-slate-400">{c.category}</td>
                      <td className="p-3 font-bold text-brand-mint">{formatINR(c.raised_amount)}</td>
                      <td className="p-3 text-slate-400">{formatINR(c.target_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROOF REVIEW (PRD § 09) */}
      {reviewingWinner && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-dark-900 border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-coral">Scorecard Review</span>
                <h3 className="text-xl font-display font-bold text-white mt-0.5">
                  Verification for {reviewingWinner.user_name}
                </h3>
                <p className="text-xs text-slate-400">
                  Prize: {formatINR(reviewingWinner.prize_amount)} ({reviewingWinner.match_type})
                </p>
              </div>
              <button
                onClick={() => setReviewingWinner(null)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Proof Image display */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-dark-950 p-2 text-center">
              {reviewingWinner.proof_url ? (
                <img
                  src={reviewingWinner.proof_url}
                  alt="Scorecard Proof"
                  className="max-h-80 mx-auto rounded-xl object-contain"
                />
              ) : (
                <div className="py-12 text-slate-500 text-xs">No screenshot uploaded yet by the winner.</div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleVerifyWinner(reviewingWinner.id, 'approved')}
                  className="flex-1 py-2.5 rounded-xl bg-brand-mint text-dark-950 font-bold text-xs hover:opacity-90 transition"
                >
                  ✓ Approve Scorecard Proof
                </button>
                <button
                  onClick={() => handleVerifyWinner(reviewingWinner.id, 'rejected')}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 font-bold text-xs hover:bg-red-500/30 transition"
                >
                  ✕ Reject Submission
                </button>
              </div>

              <input
                type="text"
                placeholder="Reason for rejection (if rejecting)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleUpdateUser} className="w-full max-w-md rounded-3xl bg-dark-900 border border-white/10 p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Edit User Profile</h3>
              <button type="button" onClick={() => setEditingUser(null)} className="text-slate-400">✕</button>
            </div>

            <div>
              <label className="text-xs text-slate-400">Name</label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">Role</label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white"
              >
                <option value="subscriber">Subscriber</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400">Subscription Status</label>
              <select
                value={editingUser.subscription_status}
                onChange={(e) => setEditingUser({ ...editingUser, subscription_status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white"
              >
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="lapsed">Lapsed</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400">Subscription Plan</label>
              <select
                value={editingUser.subscription_plan}
                onChange={(e) => setEditingUser({ ...editingUser, subscription_plan: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white"
              >
                <option value="monthly">Monthly (₹499)</option>
                <option value="yearly">Yearly (₹4,990)</option>
                <option value="none">None</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400">Charity Percentage (%)</label>
              <input
                type="number"
                min="10"
                max="100"
                value={editingUser.charity_percentage}
                onChange={(e) => setEditingUser({ ...editingUser, charity_percentage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-brand-coral hover:bg-brand-coral-hover text-white font-bold text-xs mt-2"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* MODAL: EDIT USER SCORES (PRD § 11 Surface 01) */}
      {editingUserScores && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveUserScores} className="w-full max-w-lg rounded-3xl bg-dark-900 border border-white/10 p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Direct Score Editor</h3>
                <p className="text-xs text-slate-400">Golfer: {editingUserScores.name}</p>
              </div>
              <button type="button" onClick={() => setEditingUserScores(null)} className="text-slate-400">✕</button>
            </div>

            <div className="space-y-3">
              {userScoresForm.map((s, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-slate-500 w-6">#{idx + 1}</span>
                  <input
                    type="number"
                    min="1"
                    max="45"
                    value={s.score}
                    onChange={(e) => {
                      const updated = [...userScoresForm];
                      updated[idx].score = e.target.value;
                      setUserScoresForm(updated);
                    }}
                    className="w-20 px-3 py-1.5 rounded-xl bg-dark-950 border border-white/10 text-xs font-mono font-bold text-white text-center"
                    required
                  />
                  <input
                    type="date"
                    value={s.score_date}
                    onChange={(e) => {
                      const updated = [...userScoresForm];
                      updated[idx].score_date = e.target.value;
                      setUserScoresForm(updated);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-dark-950 border border-white/10 text-xs text-white"
                    required
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-brand-coral hover:bg-brand-coral-hover text-white font-bold text-xs mt-2"
            >
              Update Golfer Scores
            </button>
          </form>
        </div>
      )}

      {/* MODAL: ADD/EDIT CHARITY (PRD § 11 Surface 03) */}
      {editingCharity && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveCharity} className="w-full max-w-lg rounded-3xl bg-dark-900 border border-white/10 p-6 sm:p-8 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{editingCharity.id ? 'Edit Charity' : 'Add New Charity'}</h3>
              <button type="button" onClick={() => setEditingCharity(null)} className="text-slate-400">✕</button>
            </div>

            <div>
              <label className="text-xs text-slate-400">Charity Name</label>
              <input
                type="text"
                value={charityFormData.name}
                onChange={(e) => setCharityFormData({ ...charityFormData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">Category</label>
              <input
                type="text"
                value={charityFormData.category}
                onChange={(e) => setCharityFormData({ ...charityFormData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">Mission Statement</label>
              <textarea
                rows={2}
                value={charityFormData.mission}
                onChange={(e) => setCharityFormData({ ...charityFormData, mission: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white resize-none"
                required
              ></textarea>
            </div>

            <div>
              <label className="text-xs text-slate-400">Description</label>
              <textarea
                rows={3}
                value={charityFormData.description}
                onChange={(e) => setCharityFormData({ ...charityFormData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white resize-none"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Logo Image URL</label>
                <input
                  type="text"
                  value={charityFormData.logoUrl}
                  onChange={(e) => setCharityFormData({ ...charityFormData, logoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Cover Image URL</label>
                <input
                  type="text"
                  value={charityFormData.coverImage}
                  onChange={(e) => setCharityFormData({ ...charityFormData, coverImage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="text-xs text-slate-400">Target Goal (₹)</label>
                <input
                  type="number"
                  value={charityFormData.targetAmount}
                  onChange={(e) => setCharityFormData({ ...charityFormData, targetAmount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white"
                />
              </div>

              <div className="pt-4 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={charityFormData.isFeatured}
                  onChange={(e) => setCharityFormData({ ...charityFormData, isFeatured: e.target.checked })}
                  className="accent-brand-coral"
                />
                <label htmlFor="featuredCheck" className="text-xs text-white font-semibold cursor-pointer">
                  Feature in Homepage Spotlight
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-brand-coral hover:bg-brand-coral-hover text-white font-bold text-xs mt-2"
            >
              Save Charity Listing
            </button>
          </form>
        </div>
      )}

      {/* MODAL: ADD CHARITY EVENT */}
      {newEventCharityId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddEvent} className="w-full max-w-md rounded-3xl bg-dark-900 border border-white/10 p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Add Golf Day / Event</h3>
              <button type="button" onClick={() => setNewEventCharityId(null)} className="text-slate-400">✕</button>
            </div>

            <div>
              <label className="text-xs text-slate-400">Event Title</label>
              <input
                type="text"
                placeholder="e.g. 2026 Spring Invitational"
                value={eventFormData.title}
                onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">Event Date</label>
              <input
                type="date"
                value={eventFormData.eventDate}
                onChange={(e) => setEventFormData({ ...eventFormData, eventDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">Location</label>
              <input
                type="text"
                placeholder="e.g. Pebble Creek Championship Course"
                value={eventFormData.location}
                onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">Description</label>
              <textarea
                rows={2}
                value={eventFormData.description}
                onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-brand-coral hover:bg-brand-coral-hover text-white font-bold text-xs mt-2"
            >
              Add Event to Charity
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
