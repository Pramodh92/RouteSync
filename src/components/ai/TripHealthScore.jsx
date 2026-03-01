/**
 * src/components/ai/TripHealthScore.jsx
 * Pre-checkout booking audit — shows a health score in the booking sidebar.
 */
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../services/api.js';

const gradeColors = { A: 'text-green-600 bg-green-50', B: 'text-blue-600 bg-blue-50', C: 'text-yellow-600 bg-yellow-50', D: 'text-red-600 bg-red-50' };

export default function TripHealthScore({ type, item, totalAmount, date, destination, passengers = 1 }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(true);
    const [fetched, setFetched] = useState(false);

    useEffect(() => {
        if (!type || fetched) return;
        setFetched(true); setLoading(true);
        api.ai.healthCheck({ type, item, totalAmount, date, destination, passengers })
            .then(res => { setData(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [type, totalAmount]);

    if (loading) return (
        <div className="card p-4 flex items-center gap-3 text-sm text-warmgray">
            <Loader className="w-4 h-4 animate-spin text-orange" />
            <span>AI auditing your booking…</span>
        </div>
    );
    if (!data) return null;

    return (
        <div className="card p-4 border border-sand/70">
            <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-orange" />
                    <span className="font-semibold text-charcoal text-sm">Trip Health Score</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold px-2 py-0.5 rounded-lg ${gradeColors[data.grade] || gradeColors.B}`}>{data.grade}</span>
                    <span className="text-charcoal font-bold">{data.score}/100</span>
                    {open ? <ChevronUp className="w-4 h-4 text-warmgray" /> : <ChevronDown className="w-4 h-4 text-warmgray" />}
                </div>
            </button>

            {open && (
                <div className="mt-3 space-y-2">
                    <p className="text-xs text-charcoal/70 italic">{data.verdict}</p>
                    {data.checks?.map((check, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                            <span className="text-base leading-none flex-shrink-0">{check.icon}</span>
                            <div>
                                <span className="font-medium text-charcoal">{check.label}</span>
                                <span className="text-warmgray"> — {check.message}</span>
                            </div>
                        </div>
                    ))}
                    {data.recommendation && (
                        <p className="text-xs text-orange font-medium bg-orange/5 rounded-xl px-3 py-2 mt-2">
                            💡 {data.recommendation}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
