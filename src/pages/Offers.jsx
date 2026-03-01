import React, { useState, useEffect } from 'react';
import { Tag, Clock, ChevronRight, Copy, CheckCircle } from 'lucide-react';
import { api } from '../services/api.js';

export default function Offers() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState('');
    const [catFilter, setCatFilter] = useState('all');

    useEffect(() => {
        api.offers.list().then(res => { setOffers(res.data); setLoading(false); });
    }, []);

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code).catch(() => { });
        setCopied(code);
        setTimeout(() => setCopied(''), 2000);
    };

    const cats = ['all', ...new Set(offers.map(o => o.category))];
    const filtered = catFilter === 'all' ? offers : offers.filter(o => o.category === catFilter);

    return (
        <div className="min-h-screen bg-ivory pt-20">
            {/* Hero */}
            <div className="bg-charcoal text-ivory py-14 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-orange rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-56 h-56 bg-gold rounded-full blur-3xl" />
                </div>
                <div className="max-w-5xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl font-display font-bold mb-3">Deals & <span className="text-orange">Offers</span></h1>
                    <p className="text-sand/70 text-lg">Exclusive discounts on flights, hotels, and holiday packages</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Category filter */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {cats.map(c => (
                        <button key={c} onClick={() => setCatFilter(c)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${catFilter === c ? 'bg-orange text-white' : 'bg-white border border-sand text-charcoal hover:border-orange hover:text-orange'}`}>
                            {c === 'all' ? '🎁 All Offers' : c}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-sand border-t-orange rounded-full animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filtered.map(offer => (
                            <div key={offer.id} className="card overflow-hidden hover:-translate-y-0.5 transition-transform duration-300 animate-fade-in">
                                <div className="relative overflow-hidden h-44">
                                    <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
                                    <div className="absolute top-3 left-3">
                                        <span className="bg-orange text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">
                                            {offer.type === 'percentage' ? `${offer.discount}% OFF` : `₹${offer.discount} OFF`}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 left-3">
                                        <span className="tag bg-charcoal/80 text-sand text-xs capitalize">{offer.category}</span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-charcoal text-lg mb-1">{offer.title}</h3>
                                    <p className="text-warmgray text-sm mb-3">{offer.description}</p>

                                    {/* Code copy */}
                                    <div className="flex items-center justify-between bg-sand/30 rounded-xl px-4 py-3 mb-3 border border-sand border-dashed">
                                        <div>
                                            <p className="text-xs text-warmgray mb-0.5">Coupon Code</p>
                                            <p className="font-bold text-charcoal tracking-widest">{offer.code}</p>
                                        </div>
                                        <button onClick={() => handleCopy(offer.code)}
                                            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${copied === offer.code ? 'bg-green-100 text-green-600' : 'bg-orange/10 text-orange hover:bg-orange/20'}`}>
                                            {copied === offer.code ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                                        </button>
                                    </div>

                                    {offer.minAmount && (
                                        <p className="text-xs text-warmgray">Min. booking: ₹{offer.minAmount.toLocaleString()}</p>
                                    )}
                                    {offer.validUntil && (
                                        <div className="flex items-center gap-1 text-xs text-warmgray mt-1">
                                            <Clock className="w-3 h-3" />
                                            <span>Valid till: {offer.validUntil}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
