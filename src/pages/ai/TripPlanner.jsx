/**
 * src/pages/ai/TripPlanner.jsx
 * AI Trip Planner — generates full day-by-day itineraries.
 * Also includes Group Trip Coordinator tab.
 */
import React, { useState } from 'react';
import { Map, Sparkles, Plus, Minus, Users, Mic, MicOff, ChevronDown, ChevronUp, Download, Share2, Loader, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.js';
import { useNavigate } from 'react-router-dom';

const DESTINATIONS = ['Goa', 'Kerala', 'Rajasthan', 'Manali', 'Shimla', 'Andaman', 'Ooty', 'Coorg', 'Jaipur', 'Udaipur', 'Varanasi', 'Rishikesh', 'Leh', 'Darjeeling', 'Mysore'];
const STYLES = [
    { id: 'Adventure', emoji: '🏔️' }, { id: 'Relaxing', emoji: '🏖️' },
    { id: 'Heritage', emoji: '🏛️' }, { id: 'Family', emoji: '👨‍👩‍👧' },
    { id: 'Romantic', emoji: '💑' }, { id: 'Budget', emoji: '💰' },
    { id: 'Luxury', emoji: '👑' }, { id: 'Backpacking', emoji: '🎒' },
];

export default function TripPlanner() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('solo'); // 'solo' | 'group'
    const [form, setForm] = useState({ destination: '', days: 3, budget: '', style: 'Adventure', travelers: 1 });
    const [groupMembers, setGroupMembers] = useState([{ name: '', budget: '' }]);
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState(null);
    const [error, setError] = useState('');
    const [openDay, setOpenDay] = useState(0);
    const [listening, setListening] = useState(false);

    // Voice input
    const startVoice = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
        const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
        const rec = new SR(); rec.lang = 'en-IN'; rec.continuous = false;
        rec.onresult = async (e) => {
            const transcript = e.results[0][0].transcript;
            setListening(false);
            try {
                const res = await api.ai.parseSearch(transcript);
                if (res.data.to) setForm(f => ({ ...f, destination: res.data.to }));
                if (res.data.passengers) setForm(f => ({ ...f, travelers: res.data.passengers }));
            } catch { }
        };
        rec.onend = () => setListening(false);
        rec.start(); setListening(true);
    };

    const generatePlan = async () => {
        if (!form.destination || !form.budget) { setError('Please fill destination and budget'); return; }
        setError(''); setLoading(true); setPlan(null);
        try {
            const payload = tab === 'group'
                ? { ...form, groupDetails: groupMembers.map(m => `${m.name}: ₹${m.budget}`).join(', '), travelers: groupMembers.length }
                : form;
            const res = await api.ai.tripPlan(payload);
            setPlan(res.data); setOpenDay(0);
        } catch (e) {
            setError(e.message || 'Could not generate plan. Please check your Groq API key.');
        } finally { setLoading(false); }
    };

    const handlePrint = () => window.print();

    return (
        <div className="min-h-screen bg-ivory pt-20">
            {/* Hero */}
            <div className="bg-gradient-to-br from-charcoal via-charcoal/95 to-orange/20 text-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-orange flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="text-orange font-medium">AI-Powered</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-display font-bold text-ivory mb-4">
                        Plan Your Perfect Trip
                    </h1>
                    <p className="text-sand/70 text-lg max-w-xl mx-auto">
                        Tell our AI where you want to go — it'll build a complete day-by-day itinerary, budget breakdown, and packing list instantly.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-10">
                {/* Tabs */}
                <div className="flex gap-2 mb-8">
                    {[['solo', '👤 Solo / Couple'], ['group', '👥 Group Trip']].map(([id, label]) => (
                        <button key={id} onClick={() => setTab(id)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === id ? 'bg-orange text-white' : 'bg-white border border-sand text-charcoal hover:border-orange/40'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <div className="card p-6 mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Destination */}
                        <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-warmgray mb-2 block">Destination *</label>
                            <div className="flex gap-2">
                                <select value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                                    className="input-field flex-1">
                                    <option value="">Select destination…</option>
                                    {DESTINATIONS.map(d => <option key={d}>{d}</option>)}
                                </select>
                                <button onClick={startVoice}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${listening ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-sand/40 text-warmgray hover:bg-orange/10 hover:text-orange'}`}>
                                    {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-warmgray mt-1">Or speak: "3 days in Goa under ₹20,000"</p>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-2 block">Duration (Days)</label>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setForm(f => ({ ...f, days: Math.max(1, f.days - 1) }))}
                                    className="w-10 h-10 rounded-xl border-2 border-sand hover:border-orange font-bold text-orange transition-all">−</button>
                                <span className="flex-1 text-center font-bold text-charcoal text-xl">{form.days}</span>
                                <button onClick={() => setForm(f => ({ ...f, days: Math.min(14, f.days + 1) }))}
                                    className="w-10 h-10 rounded-xl border-2 border-sand hover:border-orange font-bold text-orange transition-all">+</button>
                            </div>
                        </div>

                        {/* Budget */}
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-2 block">Total Budget (₹) *</label>
                            <input type="number" className="input-field" placeholder="e.g. 25000"
                                value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
                        </div>

                        {/* Travelers (solo mode) */}
                        {tab === 'solo' && (
                            <div>
                                <label className="text-xs font-medium text-warmgray mb-2 block">Travelers</label>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setForm(f => ({ ...f, travelers: Math.max(1, f.travelers - 1) }))}
                                        className="w-10 h-10 rounded-xl border-2 border-sand hover:border-orange font-bold text-orange transition-all">−</button>
                                    <span className="flex-1 text-center font-bold text-charcoal text-xl">{form.travelers}</span>
                                    <button onClick={() => setForm(f => ({ ...f, travelers: Math.min(20, f.travelers + 1) }))}
                                        className="w-10 h-10 rounded-xl border-2 border-sand hover:border-orange font-bold text-orange transition-all">+</button>
                                </div>
                            </div>
                        )}

                        {/* Travel Style */}
                        <div className={tab === 'solo' ? '' : 'sm:col-span-2'}>
                            <label className="text-xs font-medium text-warmgray mb-2 block">Travel Style</label>
                            <div className="flex flex-wrap gap-2">
                                {STYLES.map(s => (
                                    <button key={s.id} onClick={() => setForm(f => ({ ...f, style: s.id }))}
                                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${form.style === s.id ? 'bg-orange text-white' : 'bg-sand/40 text-charcoal hover:bg-sand'}`}>
                                        {s.emoji} {s.id}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Group Members */}
                    {tab === 'group' && (
                        <div className="mt-5 pt-5 border-t border-sand">
                            <p className="text-sm font-medium text-charcoal mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-orange" /> Group Members</p>
                            <div className="space-y-3">
                                {groupMembers.map((m, i) => (
                                    <div key={i} className="flex gap-3 items-center">
                                        <input className="input-field flex-1" placeholder={`Member ${i + 1} name`}
                                            value={m.name} onChange={e => { const g = [...groupMembers]; g[i].name = e.target.value; setGroupMembers(g); }} />
                                        <input type="number" className="input-field w-32" placeholder="Budget ₹"
                                            value={m.budget} onChange={e => { const g = [...groupMembers]; g[i].budget = e.target.value; setGroupMembers(g); }} />
                                        {groupMembers.length > 1 && (
                                            <button onClick={() => setGroupMembers(prev => prev.filter((_, j) => j !== i))} className="text-warmgray hover:text-red-500 transition-colors">
                                                <Minus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button onClick={() => setGroupMembers(prev => [...prev, { name: '', budget: '' }])}
                                    className="flex items-center gap-2 text-sm text-orange hover:underline">
                                    <Plus className="w-4 h-4" /> Add member
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                        </div>
                    )}

                    <button onClick={generatePlan} disabled={loading}
                        className="btn-primary w-full mt-6 flex items-center justify-center gap-2 py-3.5 text-base">
                        {loading ? <><Loader className="w-5 h-5 animate-spin" /> Generating your plan…</> : <><Sparkles className="w-5 h-5" /> Generate AI Trip Plan</>}
                    </button>
                </div>

                {/* Generated Plan */}
                {plan && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Header */}
                        <div className="card p-6 bg-gradient-to-br from-charcoal to-charcoal/90 text-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-display font-bold text-ivory">{plan.title}</h2>
                                    <p className="text-sand/70 mt-1">{plan.duration} · {plan.destination}</p>
                                    <p className="text-sand/60 text-sm mt-1">Best time: {plan.bestTimeToVisit}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-orange">₹{plan.totalBudget?.toLocaleString()}</p>
                                    <p className="text-sand/60 text-xs">Total Budget</p>
                                </div>
                            </div>
                            {plan.weatherNote && (
                                <p className="mt-4 text-sand/70 text-sm bg-white/5 rounded-xl px-4 py-3">🌤️ {plan.weatherNote}</p>
                            )}
                            <div className="flex gap-2 mt-4">
                                <button onClick={handlePrint} className="flex items-center gap-2 text-xs text-sand border border-sand/30 rounded-xl px-3 py-2 hover:bg-white/10 transition-all">
                                    <Download className="w-3.5 h-3.5" /> Save as PDF
                                </button>
                            </div>
                        </div>

                        {/* Budget Breakdown */}
                        {plan.budgetBreakdown && (
                            <div className="card p-5">
                                <h3 className="font-semibold text-charcoal mb-4">💰 Budget Breakdown</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {Object.entries(plan.budgetBreakdown).map(([key, val]) => (
                                        <div key={key} className="bg-ivory rounded-xl p-3">
                                            <p className="text-xs text-warmgray capitalize">{key}</p>
                                            <p className="font-bold text-orange">₹{val?.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Highlights */}
                        {plan.highlights?.length > 0 && (
                            <div className="card p-5">
                                <h3 className="font-semibold text-charcoal mb-3">✨ Trip Highlights</h3>
                                <div className="flex flex-wrap gap-2">
                                    {plan.highlights.map((h, i) => (
                                        <span key={i} className="tag-orange text-sm">{h}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Day-by-day Itinerary */}
                        <div className="card p-5">
                            <h3 className="font-semibold text-charcoal mb-4">📅 Day-by-Day Itinerary</h3>
                            <div className="space-y-3">
                                {plan.itinerary?.map((day, i) => (
                                    <div key={i} className={`rounded-2xl border-2 transition-all ${openDay === i ? 'border-orange' : 'border-sand'}`}>
                                        <button onClick={() => setOpenDay(openDay === i ? -1 : i)}
                                            className="w-full flex items-center justify-between p-4 text-left">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 bg-orange text-white rounded-full flex items-center justify-center text-sm font-bold">{day.day}</span>
                                                <div>
                                                    <p className="font-semibold text-charcoal">{day.title}</p>
                                                    {day.estimatedCost > 0 && <p className="text-xs text-warmgray">~₹{day.estimatedCost?.toLocaleString()}</p>}
                                                </div>
                                            </div>
                                            {openDay === i ? <ChevronUp className="w-4 h-4 text-orange" /> : <ChevronDown className="w-4 h-4 text-warmgray" />}
                                        </button>
                                        {openDay === i && (
                                            <div className="px-4 pb-4 border-t border-sand/50 pt-3 space-y-3">
                                                <p className="text-sm text-charcoal/80 leading-relaxed">{day.description}</p>
                                                {day.activities?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {day.activities.map((a, j) => <span key={j} className="tag-olive text-xs">{a}</span>)}
                                                    </div>
                                                )}
                                                {day.meals && <p className="text-xs text-warmgray">🍽️ {day.meals}</p>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Packing Tips */}
                        {plan.packingTips?.length > 0 && (
                            <div className="card p-5">
                                <h3 className="font-semibold text-charcoal mb-3">🧳 Packing Tips</h3>
                                <ul className="space-y-2">
                                    {plan.packingTips.map((t, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-charcoal/80">
                                            <span className="text-orange mt-0.5">✓</span> {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Travel Tips */}
                        {plan.travelTips?.length > 0 && (
                            <div className="card p-5">
                                <h3 className="font-semibold text-charcoal mb-3">💡 Travel Tips</h3>
                                <ul className="space-y-2">
                                    {plan.travelTips.map((t, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-charcoal/80">
                                            <span className="text-gold mt-0.5">•</span> {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* CTA */}
                        <div className="flex gap-3">
                            <button onClick={() => navigate('/flights')} className="btn-primary flex-1">✈️ Book Flights</button>
                            <button onClick={() => navigate('/hotels')} className="btn-secondary flex-1">🏨 Find Hotels</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
