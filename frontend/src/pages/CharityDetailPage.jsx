import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Globe, 
  ArrowLeft, 
  Gift, 
  Check, 
  Sparkles,
  Users
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const CharityDetailPage = () => {
  const { slug } = useParams();
  const { user, updateProfile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Donation state
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('50');
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donationNote, setDonationNote] = useState('');
  const [donateSuccess, setDonateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCharity();
  }, [slug]);

  const loadCharity = async () => {
    setLoading(true);
    try {
      const res = await api.charities.getBySlug(slug);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMakePrimary = async () => {
    if (!user || !data?.charity) return;
    try {
      await updateProfile({ charityId: data.charity.id });
      alert(`Set ${data.charity.name} as your primary subscription charity!`);
    } catch (err) {
      alert(err.message || 'Failed to update charity');
    }
  };

  const handleDirectDonate = async (e) => {
    e.preventDefault();
    if (!data?.charity) return;
    setIsSubmitting(true);
    try {
      await api.charities.donate(data.charity.id, {
        amount: parseFloat(donationAmount),
        donorName: donorName || 'Anonymous Hero',
        note: donationNote
      });
      setDonateSuccess(true);
      loadCharity();
      setTimeout(() => {
        setShowDonateModal(false);
        setDonateSuccess(false);
        setIsSubmitting(false);
        setDonationNote('');
      }, 2000);
    } catch (err) {
      alert(err.message || 'Donation failed');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-slate-400">Loading charity profile...</div>;
  }

  if (!data || !data.charity) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Charity Not Found</h2>
        <Link to="/charities" className="text-brand-coral hover:underline text-sm">
          Return to Directory
        </Link>
      </div>
    );
  }

  const { charity, events = [], recentDonations = [] } = data;
  const isSelected = user?.charity_id === charity.id;
  const pctRaised = Math.min(100, Math.round((charity.raised_amount / charity.target_amount) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Back button */}
      <Link
        to="/charities"
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Charity Directory</span>
      </Link>

      {/* Hero Banner with Cover Image */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 h-72 sm:h-96">
        <img
          src={charity.cover_image}
          alt={charity.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent"></div>
        
        <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-end space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-dark-950 border-2 border-white/20 overflow-hidden shadow-2xl">
              <img src={charity.logo_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-brand-coral/20 text-brand-coral text-xs font-bold uppercase tracking-wider">
                {charity.category}
              </span>
              <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white mt-1">
                {charity.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowDonateModal(true)}
              className="px-6 py-3 rounded-xl bg-brand-coral hover:bg-brand-coral-hover text-white font-bold text-sm shadow-glow-coral transition flex items-center space-x-2"
            >
              <Gift className="w-4 h-4" />
              <span>Direct Donate</span>
            </button>

            {user && (
              <button
                onClick={handleMakePrimary}
                disabled={isSelected}
                className={`px-5 py-3 rounded-xl text-sm font-semibold border transition ${
                  isSelected
                    ? 'bg-brand-mint/10 border-brand-mint/30 text-brand-mint'
                    : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                }`}
              >
                {isSelected ? '✓ Current Recipient' : 'Make My Charity'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Mission & Events */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Mission Card */}
          <div className="p-8 rounded-3xl bg-dark-900/60 border border-white/5 space-y-4">
            <h2 className="text-xl font-display font-bold text-white">Our Mission</h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {charity.mission}
            </p>
            <div className="pt-2 border-t border-white/5">
              <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">Program Overview</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {charity.description}
              </p>
            </div>
            {charity.website_url && (
              <div className="pt-2">
                <a
                  href={charity.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-brand-coral hover:underline font-semibold"
                >
                  <span>Visit Official Non-profit Website</span>
                  <Globe className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Upcoming Events: Golf Days (PRD § 08.2) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-brand-amber">
                  PRD § 08.2 Event Calendar
                </span>
                <h2 className="text-2xl font-display font-bold text-white mt-0.5">
                  Upcoming Golf Days & Galas
                </h2>
              </div>
              <span className="text-xs text-slate-400">{events.length} Scheduled</span>
            </div>

            {events.length === 0 ? (
              <div className="p-8 rounded-3xl bg-dark-900/40 border border-white/5 text-center text-xs text-slate-400">
                No upcoming golf events currently scheduled for this foundation.
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-6 rounded-2xl bg-dark-900/60 border border-white/5 hover:border-white/15 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-3 text-xs text-brand-coral font-semibold">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{evt.event_date}</span>
                        </span>
                        <span className="text-slate-600">|</span>
                        <span className="flex items-center space-x-1 text-slate-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{evt.location}</span>
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">{evt.title}</h4>
                      <p className="text-xs text-slate-400 max-w-xl">{evt.description}</p>
                    </div>

                    <button
                      onClick={() => alert(`RSVP registered for ${evt.title}! Confirmation sent to your email.`)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 border border-white/10 whitespace-nowrap"
                    >
                      Member RSVP
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right: Funding Target Card & Recent Contributions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Target Progress Card */}
          <div className="p-6 rounded-3xl bg-dark-900/80 border border-white/10 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Community Impact Goal
            </h3>

            <div className="space-y-1.5">
              <div className="text-3xl font-display font-black text-white">
                ${Number(charity.raised_amount).toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">
                Pledged toward annual goal of ${Number(charity.target_amount).toLocaleString()}
              </div>
            </div>

            <div className="w-full h-3 rounded-full bg-dark-950 border border-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-coral to-brand-amber rounded-full"
                style={{ width: `${pctRaised}%` }}
              ></div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 leading-relaxed">
              Every month, active subscribers choose between 10% and 50%+ of their subscription fees to go directly to this charity pool.
            </div>

            <button
              onClick={() => setShowDonateModal(true)}
              className="w-full py-3 rounded-xl bg-brand-coral hover:bg-brand-coral-hover text-white font-bold text-sm shadow-glow-coral transition"
            >
              Make Direct Donation Now
            </button>
          </div>

          {/* Recent Donations Ledger */}
          <div className="p-6 rounded-3xl bg-dark-900/60 border border-white/5 space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Recent Supporter Ledger
            </h4>

            {recentDonations.length === 0 ? (
              <p className="text-xs text-slate-500">Be the first to donate directly!</p>
            ) : (
              <div className="space-y-3">
                {recentDonations.slice(0, 5).map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs pb-2 border-b border-white/5 last:border-0 last:pb-0">
                    <div>
                      <div className="font-semibold text-white">{d.donor_name || 'Anonymous Hero'}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{d.donation_type.replace('_', ' ')}</div>
                    </div>
                    <div className="font-bold text-brand-mint">+${Number(d.amount).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* DIRECT DONATION MODAL */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-dark-900 border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-coral">Independent Giving</span>
                <h3 className="text-xl font-display font-bold text-white mt-1">
                  Support {charity.name}
                </h3>
              </div>
              <button
                onClick={() => setShowDonateModal(false)}
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
                <h4 className="text-lg font-bold text-white">Donation Processed!</h4>
                <p className="text-xs text-slate-400">Thank you for powering positive change through sports philanthropy.</p>
              </div>
            ) : (
              <form onSubmit={handleDirectDonate} className="space-y-4">
                
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-2">Select Donation Amount</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['15', '25', '50', '100'].map((amt) => (
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

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Custom Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white font-bold text-sm focus:border-brand-coral focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-sm focus:border-brand-coral focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Personal Message</label>
                  <textarea
                    rows={2}
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
                    {isSubmitting ? 'Processing...' : `Donate $${donationAmount}`}
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
