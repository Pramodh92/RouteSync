/**
 * src/pages/ai/TravelBuddies.jsx
 * AI Travel Buddy Matcher — /travel-buddies
 */
import React, { useState } from 'react';
import { Users, Sparkles, Loader, Heart, AlertCircle, UserPlus, MapPin } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const DESTINATIONS = ['Goa', 'Kerala', 'Rajasthan', 'Manali', 'Shimla', 'Andaman', 'Ooty', 'Jaipur', 'Udaipur', 'Varanasi', 'Rishikesh', 'Leh', 'Darjeeling'];
const INTERESTS = ['Adventure Sports', 'Photography', 'Food Tourism', 'History & Culture', 'Beach & Water', 'Trekking', 'Wildlife', 'Budget Travel', 'Luxury Travel', 'Backpacking'];
const AGE_GROUPS = ['18-25', '26-35', '36-45', '46-60', '60+'];

export default function TravelBuddies() {
    const { user } = useAuth();
    const [form, setForm] = useState({ destination: '', dates: '', interests: [], ageGroup: '', bio: '' });
    const [registered, setRegistered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [matching, setMatching] = useState(false);
    const [matches, setMatches] = useState(null);
    const [error, setError] = useState('');

    const toggleInterest = (interest) => {
        setForm(f => ({ ...f, interests: f.interests.includes(interest) ? f.interests.filter(i => i !== interest) : [...f.interests, interest] }));
    };

    const handleRegister = async () => {
        if (!form.destination || !form.ageGroup) { setError('Please fill destination and age group'); return; }
        setError(''); setLoading(true);
        try {
            await api.ai.buddyRegister({ userId: user?.id || 'guest_' + Date.now(), ...form });
            setRegistered(true);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    const findMatches = async () => {
        setMatching(true);
        try {
            const res = await api.ai.buddyMatch({ userId: user?.id || 'guest', ...form });
            setMatches(res.data);
        } catch (e) { setError(e.message); }
        finally { setMatching(false); }
    };

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="bg-gradient-to-br from-charcoal to-charcoal/90 text-white py-14 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-orange flex items-center justify-center"><Users className="w-5 h-5" /></div>
                        <span className="text-orange font-medium">AI-Powered</span>
                    </div>
                    <h1 className="text-4xl font-display font-bold text-ivory mb-3">Travel Buddy Matcher</h1>
                    <p className="text-sand/70 text-lg">Solo traveler? Find like-minded people going to the same destination.</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-10">
                <div className="card p-6 mb-6">
                    <h2 className="font-bold text-charcoal mb-5 flex items-center gap-2"><UserPlus className="w-5 h-5 text-orange" /> Your Travel Profile</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-2 block">Where are you going? *</label>
                            <select className="input-field" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}>
                                <option value="">Select destination…</option>
                                {DESTINATIONS.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-2 block">Approximate Dates</label>
                            <input className="input-field" placeholder="e.g. March 15-20"
                                value={form.dates} onChange={e => setForm(f => ({ ...f, dates: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-2 block">Age Group *</label>
                            <div className="flex flex-wrap gap-2">
                                {AGE_GROUPS.map(g => <button key={g} onClick={() => setForm(f => ({ ...f, ageGroup: g }))}
                                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${form.ageGroup === g ? 'bg-orange text-white' : 'bg-sand/40 text-charcoal hover:bg-sand'}`}>{g}</button>)}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-2 block">About yourself</label>
                            <textarea className="input-field resize-none" rows={2} placeholder="e.g. Photographer, love street food…"
                                value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-warmgray mb-2 block">Your Interests</label>
                            <div className="flex flex-wrap gap-2">
                                {INTERESTS.map(i => <button key={i} onClick={() => toggleInterest(i)}
                                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${form.interests.includes(i) ? 'bg-orange text-white' : 'bg-sand/40 text-charcoal hover:bg-sand'}`}>{i}</button>)}
                            </div>
                        </div>
                    </div>
                    {error && <div className="mt-4 flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl px-3 py-2"><AlertCircle className="w-4 h-4" />{error}</div>}
                    <div className="flex gap-3 mt-6">
                        <button onClick={handleRegister} disabled={loading || registered} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                            {loading ? <Loader className="w-4 h-4 animate-spin" /> : registered ? '✅ Registered!' : <><UserPlus className="w-4 h-4" />List Me</>}
                        </button>
                        <button onClick={findMatches} disabled={matching || !form.destination} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {matching ? <><Loader className="w-4 h-4 animate-spin" />Finding…</> : <><Sparkles className="w-4 h-4" />Find Matches</>}
                        </button>
                    </div>
                </div>

                {matches && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="font-bold text-charcoal text-lg flex items-center gap-2"><Heart className="w-5 h-5 text-orange" /> AI Match Results</h3>
                        {matches.matches?.length === 0 ? (
                            <div className="card p-8 text-center text-warmgray">
                                <p className="text-lg mb-2">No matches yet for {form.destination}</p>
                                <p className="text-sm">Be the first! Share RouteSync with fellow travelers going to {form.destination}.</p>
                            </div>
                        ) : matches.matches?.map((m, i) => (
                            <div key={i} className="card p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange/20 flex items-center justify-center text-xl font-bold text-orange">{m.userId?.charAt(0)?.toUpperCase() || '?'}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-charcoal">Traveler {i + 1}</p>
                                        <span className="tag-orange text-xs">{m.compatibilityScore}% match</span>
                                    </div>
                                    <p className="text-xs text-warmgray mt-0.5">{m.reason}</p>
                                    {m.sharedInterests?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {m.sharedInterests.map(s => <span key={s} className="tag text-xs">{s}</span>)}
                                        </div>
                                    )}
                                </div>
                                <button className="btn-secondary text-xs px-3 py-2">Connect</button>
                            </div>
                        ))}
                        {matches.tips?.length > 0 && (
                            <div className="card p-4">
                                <p className="font-semibold text-charcoal text-sm mb-2">💡 Safety Tips for Meeting Travel Buddies</p>
                                {matches.tips.map((t, i) => <p key={i} className="text-xs text-charcoal/70 mb-1">• {t}</p>)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
