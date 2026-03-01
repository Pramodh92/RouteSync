/**
 * src/components/ai/FarePredictor.jsx
 * "Book now or wait?" widget — shown on FlightResults.
 */
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Zap, Loader } from 'lucide-react';
import { api } from '../../services/api.js';

const icons = { rising: TrendingUp, falling: TrendingDown, stable: Minus };
const colors = {
    book_now: 'bg-red-50 border-red-200 text-red-700',
    wait: 'bg-green-50 border-green-200 text-green-700',
    flexible: 'bg-yellow-50 border-yellow-200 text-yellow-700',
};
const labels = { book_now: '🔥 Book Now!', wait: '⏳ Wait a bit', flexible: '🤷 Flexible' };

export default function FarePredictor({ from, to, date, currentPrice, className = '' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const fetch = async () => {
        if (!from || !to) return;
        setLoading(true);
        try {
            const res = await api.ai.farePredict({ from, to, date, currentPrice });
            setData(res.data);
        } catch { } finally { setLoading(false); }
    };

    if (!from || !to) return null;

    const Icon = data ? icons[data.priceDirection] || Minus : Zap;

    return (
        <div className={`card p-4 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-orange/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-orange" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-charcoal">AI Fare Predictor</p>
                        <p className="text-xs text-warmgray">{from} → {to}</p>
                    </div>
                </div>
                {!data && !loading && (
                    <button onClick={fetch} className="text-xs text-orange font-medium hover:underline"
                        id="fare-predictor-btn">
                        Analyze →
                    </button>
                )}
                {data && <button onClick={() => setOpen(o => !o)} className="text-xs text-warmgray hover:text-charcoal">{open ? 'Less' : 'More'}</button>}
            </div>

            {loading && (
                <div className="mt-3 flex items-center gap-2 text-sm text-warmgray">
                    <Loader className="w-4 h-4 animate-spin text-orange" />
                    Analyzing price trends…
                </div>
            )}

            {data && (
                <div className="mt-3 space-y-2">
                    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${colors[data.recommendation]}`}>
                        <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="font-bold text-sm">{labels[data.recommendation]}</span>
                        </div>
                        <span className="text-xs font-medium">{data.confidence}% confident</span>
                    </div>
                    {open && (
                        <>
                            <p className="text-xs text-charcoal/70 leading-relaxed">{data.reasoning}</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[['Current', `₹${data.currentPrice?.toLocaleString()}`], ['Avg Route', `₹${data.avgPrice?.toLocaleString()}`], ['Potential', data.savingsEstimate]].map(([label, val]) => (
                                    <div key={label} className="bg-ivory rounded-xl p-2 text-center">
                                        <p className="text-xs text-warmgray">{label}</p>
                                        <p className="text-xs font-bold text-charcoal">{val}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
