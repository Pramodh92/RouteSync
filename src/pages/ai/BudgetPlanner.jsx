/**
 * src/pages/ai/BudgetPlanner.jsx
 * AI Budget Optimizer — standalone page at /budget
 */
import React, { useState } from 'react';
import { PieChart, Sparkles, Loader, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.js';

const DESTINATIONS = ['Goa', 'Kerala', 'Rajasthan', 'Manali', 'Shimla', 'Andaman', 'Ooty', 'Jaipur', 'Udaipur', 'Varanasi', 'Rishikesh', 'Leh', 'Darjeeling', 'Mysore', 'Coorg'];
const STYLES = ['Budget', 'Balanced', 'Mid-range', 'Premium', 'Luxury'];

const COLORS = {
    flights: 'bg-blue-500', accommodation: 'bg-purple-500', food: 'bg-orange',
    activities: 'bg-green-500', transport: 'bg-yellow-500', miscellaneous: 'bg-warmgray'
};

export default function BudgetPlanner() {
    const [form, setForm] = useState({ destination: '', days: 3, totalBudget: '', travelers: 1, style: 'Balanced' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const optimize = async () => {
        if (!form.destination || !form.totalBudget) { setError('Please fill destination and budget'); return; }
        setError(''); setLoading(true); setResult(null);
        try {
            const res = await api.ai.budget(form);
            setResult(res.data);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="bg-gradient-to-br from-charcoal to-charcoal/90 text-white py-14 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-orange flex items-center justify-center"><PieChart className="w-5 h-5" /></div>
                        <span className="text-orange font-medium">AI-Powered</span>
                    </div>
                    <h1 className="text-4xl font-display font-bold text-ivory mb-3">Budget Optimizer</h1>
                    <p className="text-sand/70 text-lg">Enter your total budget — AI splits it optimally across flights, hotels, food, and more.</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-10">
                <div className="card p-6 mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-2 block">Destination *</label>
                            <select className="input-field" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}>
                                <option value="">Select destination…</option>
                                {DESTINATIONS.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-2 block">Total Budget (₹) *</label>
                            <input type="number" className="input-field" placeholder="e.g. 50000"
                                value={form.totalBudget} onChange={e => setForm(f => ({ ...f, totalBudget: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-2 block">Duration (Days)</label>
                            <select className="input-field" value={form.days} onChange={e => setForm(f => ({ ...f, days: +e.target.value }))}>
                                {[1, 2, 3, 4, 5, 6, 7, 10, 14].map(d => <option key={d} value={d}>{d} days</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-2 block">Travelers</label>
                            <select className="input-field" value={form.travelers} onChange={e => setForm(f => ({ ...f, travelers: +e.target.value }))}>
                                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-warmgray mb-2 block">Travel Style</label>
                            <div className="flex flex-wrap gap-2">
                                {STYLES.map(s => <button key={s} onClick={() => setForm(f => ({ ...f, style: s }))}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${form.style === s ? 'bg-orange text-white' : 'bg-sand/40 text-charcoal hover:bg-sand'}`}>{s}</button>)}
                            </div>
                        </div>
                    </div>
                    {error && <div className="mt-4 flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3"><AlertCircle className="w-4 h-4" /> {error}</div>}
                    <button onClick={optimize} disabled={loading} className="btn-primary w-full mt-6 flex items-center justify-center gap-2 py-3.5">
                        {loading ? <><Loader className="w-5 h-5 animate-spin" /> Optimizing…</> : <><Sparkles className="w-5 h-5" /> Optimize My Budget</>}
                    </button>
                </div>

                {result && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="card p-5">
                            <h2 className="font-bold text-charcoal text-lg mb-1">💰 Budget Breakdown</h2>
                            <p className="text-sm text-warmgray mb-4">{result.budgetRating} · {result.verdict}</p>
                            <div className="space-y-3">
                                {Object.entries(result.breakdown || {}).map(([key, val]) => (
                                    <div key={key}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-charcoal capitalize">{key}</span>
                                            <span className="text-sm font-bold text-orange">₹{val.amount?.toLocaleString()} <span className="text-warmgray font-normal text-xs">({val.percentage}%)</span></span>
                                        </div>
                                        <div className="h-2 bg-sand/40 rounded-full overflow-hidden mb-1">
                                            <div className={`h-full ${COLORS[key] || 'bg-orange'} rounded-full`} style={{ width: `${val.percentage}%` }} />
                                        </div>
                                        <p className="text-xs text-warmgray">{val.tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {result.savingsTips?.length > 0 && (
                            <div className="card p-5">
                                <h3 className="font-semibold text-charcoal mb-3">💡 Money-Saving Tips</h3>
                                <ul className="space-y-2">
                                    {result.savingsTips.map((t, i) => <li key={i} className="text-sm text-charcoal/80 flex gap-2"><span className="text-green-500">✓</span>{t}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
