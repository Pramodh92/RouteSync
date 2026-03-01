/**
 * src/components/ai/AISearchBar.jsx
 * Natural Language Search — replaces raw text field on homepage.
 * Parses conversational queries and navigates to the right results page.
 */
import React, { useState, useRef } from 'react';
import { Search, Sparkles, Mic, MicOff, Loader, ArrowRight } from 'lucide-react';
import { api } from '../../services/api.js';
import { useNavigate } from 'react-router-dom';

const EXAMPLES = [
    'Non-stop flight from Mumbai to Goa this Saturday under ₹4,000',
    'Best hotels in Jaipur under ₹3,000/night',
    '3-day Manali trip for 2 people under ₹20,000',
    'Train from Delhi to Varanasi next Friday AC class',
];

const TYPE_ROUTES = { flight: '/flights/results', hotel: '/hotels/listing', train: '/trains/results', bus: '/buses/results', cab: '/cabs/results', holiday: '/holidays' };

export default function AISearchBar({ onParsed }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [listening, setListening] = useState(false);
    const recRef = useRef(null);

    const startVoice = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
        const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
        recRef.current = new SR(); recRef.current.lang = 'en-IN';
        recRef.current.onresult = (e) => { setQuery(e.results[0][0].transcript); setListening(false); };
        recRef.current.onend = () => setListening(false);
        recRef.current.start(); setListening(true);
    };

    const handleSearch = async (q = query) => {
        if (!q.trim()) return;
        setLoading(true); setResult(null);
        try {
            const res = await api.ai.parseSearch(q);
            const parsed = res.data;
            setResult(parsed);
            onParsed?.(parsed);
            // Auto-navigate after short delay
            setTimeout(() => {
                const route = TYPE_ROUTES[parsed.type] || '/flights/results';
                navigate(route, { state: { aiSearch: parsed } });
            }, 1200);
        } catch {
            setResult({ summary: 'Could not parse query — searching all flights.', type: 'flight' });
            setTimeout(() => navigate('/flights/results'), 1000);
        } finally { setLoading(false); }
    };

    return (
        <div className="w-full">
            <div className="relative">
                <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg border border-sand/50 px-4 py-3 focus-within:border-orange/50 focus-within:shadow-orange/10 focus-within:shadow-xl transition-all">
                    <Sparkles className="w-5 h-5 text-orange flex-shrink-0" />
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder='Try: "Non-stop flight Mumbai to Goa under ₹4,000"'
                        className="flex-1 bg-transparent outline-none text-charcoal placeholder-warmgray text-sm"
                    />
                    <button onClick={listening ? () => { recRef.current?.stop(); setListening(false); } : startVoice}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${listening ? 'bg-red-100 text-red-500 animate-pulse' : 'text-warmgray hover:text-orange'}`}>
                        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleSearch()} disabled={!query.trim() || loading}
                        className="h-9 px-4 rounded-xl bg-orange text-white text-sm font-medium flex items-center gap-1.5 disabled:opacity-40 hover:bg-orange/90 transition-all">
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Search</>}
                    </button>
                </div>

                {/* Parsed result preview */}
                {result && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-orange/20 px-4 py-3 z-20 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-orange" />
                            <p className="text-sm text-charcoal">{result.summary}</p>
                            <span className="ml-auto tag-orange text-xs capitalize">{result.type}</span>
                        </div>
                        <p className="text-xs text-warmgray mt-1 flex items-center gap-1">
                            <ArrowRight className="w-3 h-3" /> Redirecting you to results…
                        </p>
                    </div>
                )}
            </div>

            {/* Example chips */}
            <div className="flex flex-wrap gap-2 mt-3">
                {EXAMPLES.map(ex => (
                    <button key={ex} onClick={() => { setQuery(ex); handleSearch(ex); }}
                        className="text-xs text-sand/80 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-1.5 transition-all text-left">
                        {ex}
                    </button>
                ))}
            </div>
        </div>
    );
}
