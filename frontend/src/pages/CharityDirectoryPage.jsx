import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  Filter, 
  ArrowRight, 
  Calendar, 
  Gift, 
  Check, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const CharityDirectoryPage = () => {
  const { user, updateProfile } = useAuth();
  const [charities, setCharities] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Direct Donation Modal state (PRD § 08.1)
  const [donateModalCharity, setDonateModalCharity] = useState(null);
  const [donationAmount, setDonationAmount] = useState('25');
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donationNote, setDonationNote] = useState('');
  const [donateSuccess, setDonateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
    loadCharities();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const res = await api.charities.getCategories();
      if (res.categories) setCategories(res.categories);
    } catch (e) {}
  };

  const loadCharities = async (search = searchQuery) => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (search) params.search = search;
      const res = await api.charities.getAll(params);
      setCharities(res.charities || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    loadCharities(e.target.value);
  };

  const handleMakePrimaryCharity = async (charityId) => {
    if (!user) return;
    try {
      await updateProfile({ charityId });
      alert('Your subscription charity recipient has been updated!');
    } catch (err) {
      alert(err.message || 'Failed to update charity');
    }
  };

  const handleDirectDonate = async (e) => {
    e.preventDefault();
    if (!donateModalCharity) return;
    setIsSubmitting(true);
    try {
      await api.charities.donate(donateModalCharity.id, {
        amount: parseFloat(donationAmount),
        donorName: donorName || 'Anonymous Hero',
        note: donationNote
      });
      setDonateSuccess(true);
      // Reload charities to reflect updated raised totals
      loadCharities();
      setTimeout(() => {
        setDonateModalCharity(null);
        setDonateSuccess(false);
        setIsSubmitting(false);
        setDonationNote('');
      }, 2000);
    } catch (err) {
      alert(err.message || 'Donation failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-coral">
          PRD § 08 · Social Impact Directory
        </span>
        <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-white">
          Direct Your Play Toward Real Causes
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">
          Every active subscription automatically allocates a minimum of 10% (up to your chosen %) to an accredited charity. You can also make direct contributions anytime, completely independent of gameplay.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Search box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search charities by mission or name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-dark-900/90 border border-white/10 text-white text-sm focus:border-brand-coral focus:outline-none placeholder-slate-500"
            />
          </div>

          {/* Quick stats indicator */}
          <div className="text-xs text-slate-400">
            Showing <strong className="text-white">{charities.length}</strong> accredited non-profit partners
          </div>

        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-coral text-white shadow-glow-coral'
                  : 'bg-dark-900/60 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Charities Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading accredited charities...</div>
      ) : charities.length === 0 ? (
        <div className="py-20 text-center text-slate-400">No charities match your search criteria.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {charities.map((c) => {
            const isSelected = user?.charity_id === c.id;
            const pctRaised = Math.min(100, Math.round((c.raised_amount / c.target_amount) * 100));

            return (
              <div
                key={c.id}
                className={`rounded-3xl bg-dark-900/70 border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-brand-coral/40 ${
                  isSelected ? 'border-brand-coral ring-1 ring-brand-coral/50' : 'border-white/5'
                }`}
              >
                {/* Image Header */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={c.cover_image}
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent"></div>
                  
                  {/* Category Pill */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-dark-950/80 backdrop-blur-md text-[11px] font-semibold text-slate-200 border border-white/10">
                      {c.category}
                    </span>
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full bg-brand-coral text-white text-[11px] font-bold shadow-md flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>My Choice</span>
                      </span>
                    </div>
                  )}

                  {/* Logo thumbnail */}
                  <div className="absolute -bottom-4 left-6 w-12 h-12 rounded-xl bg-dark-950 border border-white/10 overflow-hidden shadow-lg">
                    <img src={c.logo_url} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 pt-8 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold font-display text-white">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {c.mission}
                    </p>
                  </div>

                  {/* Goal Progress */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-brand-coral font-bold">${Number(c.raised_amount).toLocaleString()}</span>
                      <span className="text-slate-400">Target: ${Number(c.target_amount).toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-dark-950 overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-brand-coral to-brand-amber rounded-full"
                        style={{ width: `${pctRaised}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/charities/${c.slug}`}
                        className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 text-center transition flex items-center justify-center space-x-1"
                      >
                        <span>Profile & Events</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={() => {
                          setDonateModalCharity(c);
                          setDonationAmount('25');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-brand-coral/10 hover:bg-brand-coral/20 text-xs font-bold text-brand-coral text-center transition flex items-center justify-center space-x-1"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>Direct Donate</span>
                      </button>
                    </div>

                    {user && !isSelected && (
                      <button
                        onClick={() => handleMakePrimaryCharity(c.id)}
                        className="w-full py-2 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition"
                      >
                        Set as my subscription recipient ({user.charity_percentage || 10}%)
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DIRECT DONATION MODAL (PRD § 08.1 Independent Donation Option) */}
      {donateModalCharity && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-dark-900 border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-coral">Direct Donation</span>
                <h3 className="text-xl font-display font-bold text-white mt-1">
                  Support {donateModalCharity.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  100% of this independent donation goes directly to the foundation.
                </p>
              </div>
              <button
                onClick={() => setDonateModalCharity(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {donateSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-brand-mint/20 text-brand-mint flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Thank You For Your Generosity!</h4>
                <p className="text-xs text-slate-400">Your direct contribution has been recorded and allocated.</p>
              </div>
            ) : (
              <form onSubmit={handleDirectDonate} className="space-y-4">
                
                {/* Preset amounts */}
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-2">Select Donation Amount</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['10', '25', '50', '100'].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setDonationAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          donationAmount === amt
                            ? 'bg-brand-coral text-white border-brand-coral'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Or Custom Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white font-bold text-sm focus:border-brand-coral focus:outline-none"
                    required
                  />
                </div>

                {/* Donor Name */}
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Donor Name</label>
                  <input
                    type="text"
                    placeholder="Anonymous Hero"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-sm focus:border-brand-coral focus:outline-none"
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Message of Encouragement (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Keep up the inspiring work on the course..."
                    value={donationNote}
                    onChange={(e) => setDonationNote(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-dark-950 border border-white/10 text-white text-xs focus:border-brand-coral focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-brand-coral hover:bg-brand-coral-hover text-white font-bold text-sm shadow-glow-coral transition"
                  >
                    {isSubmitting ? 'Processing Donation...' : `Confirm Direct Gift of $${donationAmount}`}
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
