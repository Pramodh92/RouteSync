/**
 * src/components/ai/DestinationIntel.jsx  
 * Tabbed card for: Culture Briefing + Neighborhood + Phrasebook + Pulse
 * Shown on HotelDetail and HolidayDetail pages.
 */
import React, { useState } from 'react';
import { Globe, Map, MessageSquare, Radio, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../services/api.js';

const TABS = [
    { id: 'culture', label: '🥘 Culture', icon: Globe },
    { id: 'pulse', label: '📰 Pulse', icon: Radio },
    { id: 'phrasebook', label: '🗣️ Phrases', icon: MessageSquare },
];

export default function DestinationIntel({ destination, hotelId }) {
    const [activeTab, setActiveTab] = useState('culture');
    const [data, setData] = useState({});
    const [loading, setLoading] = useState({});
    const [open, setOpen] = useState(true);

    const fetchTab = async (tab) => {
        if (data[tab]) return;
        setLoading(l => ({ ...l, [tab]: true }));
        try {
            let res;
            if (tab === 'culture') res = await api.ai.culture(destination);
            else if (tab === 'pulse') res = await api.ai.pulse(destination);
            else if (tab === 'phrasebook') res = await api.ai.phrasebook(destination);
            setData(d => ({ ...d, [tab]: res.data }));
        } catch { } finally {
            setLoading(l => ({ ...l, [tab]: false }));
        }
    };

    const handleTab = (tab) => { setActiveTab(tab); fetchTab(tab); };

    if (!destination) return null;

    // Render each tab's content
    const renderContent = () => {
        const d = data[activeTab];
        const l = loading[activeTab];
        if (l) return <div className="flex justify-center py-8"><Loader className="w-5 h-5 animate-spin text-orange" /></div>;
        if (!d) return (
            <button onClick={() => fetchTab(activeTab)} className="w-full py-6 text-sm text-orange hover:underline flex items-center justify-center gap-2">
                <Globe className="w-4 h-4" /> Load {activeTab} info for {destination}
            </button>
        );
        if (activeTab === 'culture') return (
            <div className="space-y-4">
                {d.mustEat?.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-charcoal mb-2">🍽️ Must Eat</p>
                        <div className="space-y-2">{d.mustEat.map((f, i) => (
                            <div key={i} className="bg-ivory rounded-xl p-3">
                                <p className="text-sm font-medium text-charcoal">{f.name}</p>
                                <p className="text-xs text-warmgray">{f.description}</p>
                                {f.whereToFind && <p className="text-xs text-orange mt-0.5">📍 {f.whereToFind}</p>}
                            </div>
                        ))}</div>
                    </div>
                )}
                {d.customs?.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-charcoal mb-2">🙏 Local Customs</p>
                        <ul className="space-y-1">{d.customs.map((c, i) => <li key={i} className="text-xs text-charcoal/75 flex gap-2"><span className="text-orange">•</span>{c}</li>)}</ul>
                    </div>
                )}
                {d.doAndDont && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-green-700 mb-2">✅ Do</p>
                            {d.doAndDont.do?.map((item, i) => <p key={i} className="text-xs text-charcoal/70 mb-1">{item}</p>)}
                        </div>
                        <div className="bg-red-50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-red-600 mb-2">❌ Don't</p>
                            {d.doAndDont.dont?.map((item, i) => <p key={i} className="text-xs text-charcoal/70 mb-1">{item}</p>)}
                        </div>
                    </div>
                )}
                <div className="flex flex-wrap gap-2">
                    {d.dressCode && <span className="tag-olive text-xs">👗 {d.dressCode}</span>}
                    {d.tipping && <span className="tag text-xs">💰 {d.tipping}</span>}
                    {d.greeting && <span className="tag-orange text-xs">👋 {d.greeting}</span>}
                </div>
            </div>
        );
        if (activeTab === 'pulse') return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-charcoal text-sm">{d.crowdLevel} Season</p>
                        <p className="text-xs text-warmgray">{d.season}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-xl text-xs font-bold ${d.travelAdvisory?.level === 'Safe' ? 'bg-green-100 text-green-700' : d.travelAdvisory?.level === 'Caution' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {d.travelAdvisory?.level}
                    </div>
                </div>
                {d.events?.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-charcoal mb-2">🎉 Events This Month</p>
                        {d.events.map((e, i) => (
                            <div key={i} className="bg-ivory rounded-xl p-2.5 mb-2">
                                <p className="text-sm font-medium text-charcoal">{e.name}</p>
                                <p className="text-xs text-warmgray">{e.date} — {e.description}</p>
                            </div>
                        ))}
                    </div>
                )}
                {d.localTip && <p className="text-xs text-orange font-medium bg-orange/5 rounded-xl px-3 py-2">💡 {d.localTip}</p>}
                {d.trending && <p className="tag-orange text-xs">🔥 {d.trendReason}</p>}
            </div>
        );
        if (activeTab === 'phrasebook') return (
            <div className="space-y-2">
                <p className="text-xs text-warmgray mb-3">Language: <span className="font-medium text-charcoal">{d.language}</span></p>
                {['greeting', 'food', 'transport', 'shopping', 'emergency'].map(cat => {
                    const phrases = d.phrases?.filter(p => p.category === cat);
                    if (!phrases?.length) return null;
                    return (
                        <div key={cat} className="mb-3">
                            <p className="text-xs font-semibold text-charcoal capitalize mb-1.5">{cat}</p>
                            {phrases.map((p, i) => (
                                <div key={i} className="grid grid-cols-2 gap-2 bg-ivory rounded-xl p-2.5 mb-1.5 text-xs">
                                    <div>
                                        <p className="text-warmgray">English</p>
                                        <p className="font-medium text-charcoal">{p.english}</p>
                                    </div>
                                    <div>
                                        <p className="text-warmgray">Local / Pronunciation</p>
                                        <p className="font-medium text-charcoal">{p.local}</p>
                                        {p.pronunciation && <p className="text-warmgray italic">[{p.pronunciation}]</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="card overflow-hidden">
            <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-4 bg-charcoal/5">
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-orange" />
                    <span className="font-semibold text-charcoal text-sm">Destination Intel</span>
                    <span className="tag-orange text-xs">AI</span>
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-warmgray" /> : <ChevronDown className="w-4 h-4 text-warmgray" />}
            </button>
            {open && (
                <div className="p-4">
                    <div className="flex gap-1 mb-4 bg-ivory rounded-xl p-1">
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => handleTab(tab.id)}
                                className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-charcoal' : 'text-warmgray hover:text-charcoal'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="max-h-96 overflow-y-auto">{renderContent()}</div>
                </div>
            )}
        </div>
    );
}
