import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, Heart, ArrowRight, Tag } from 'lucide-react';
import { api } from '../../services/api.js';

export default function HolidayPackages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [themeFilter, setThemeFilter] = useState('all');

    useEffect(() => {
        api.holidays.list().then(res => { setPackages(res.data); setLoading(false); });
    }, []);

    const themes = ['all', ...new Set(packages.map(p => p.category).filter(Boolean))];
    const filtered = themeFilter === 'all' ? packages : packages.filter(p => p.category === themeFilter);

    return (
        <div className="min-h-screen bg-ivory pt-20">
            {/* Hero */}
            <div className="relative h-80 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1920&h=500&fit=crop" alt="Holiday Packages" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/50 to-transparent" />
                <div className="absolute inset-0 flex items-center px-8 sm:px-16">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-display font-bold text-ivory mb-3">Holiday <span className="text-orange">Packages</span></h1>
                        <p className="text-sand/80 text-lg max-w-md">Curated holiday experiences for every kind of traveler</p>
                    </div>
                </div>
            </div>

            {/* Theme filter */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <span className="font-medium text-charcoal text-sm">Filter by Theme:</span>
                    {themes.map(t => (
                        <button key={t} onClick={() => setThemeFilter(t)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${themeFilter === t ? 'bg-orange text-white' : 'bg-white border border-sand text-charcoal hover:border-orange hover:text-orange'}`}>
                            {t === 'all' ? '✨ All Packages' : t}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-4 border-sand border-t-orange rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(pkg => (
                            <Link key={pkg.id} to={`/holidays/${pkg.id}`}
                                className="card group hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                <div className="relative overflow-hidden rounded-t-2xl">
                                    <img src={pkg.image} alt={pkg.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
                                    {pkg.trending && (
                                        <span className="absolute top-3 left-3 bg-orange text-white text-xs font-bold px-2.5 py-1 rounded-lg">🔥 Trending</span>
                                    )}
                                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                                        <Heart className="w-4 h-4 text-white" />
                                    </button>
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <h3 className="text-xl font-display font-bold text-ivory">{pkg.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <MapPin className="w-3.5 h-3.5 text-sand" />
                                            <span className="text-sand/80 text-sm">{pkg.destination}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-warmgray" />
                                                <span className="text-sm text-warmgray">{pkg.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3.5 h-3.5 text-gold" fill="#C9A227" />
                                                <span className="text-sm font-medium">{pkg.rating}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-warmgray">{pkg.reviews} reviews</div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {(pkg.themes || []).map(t => (
                                            <span key={t} className="tag-olive text-xs capitalize">{t}</span>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {pkg.highlights?.slice(0, 2).map(h => (
                                            <span key={h} className="text-xs text-charcoal/70 bg-ivory rounded-lg px-2 py-0.5 border border-sand">✓ {h}</span>
                                        ))}
                                    </div>

                                    <div className="flex items-end justify-between mt-auto">
                                        <div>
                                            <p className="text-xs text-warmgray">Starting from</p>
                                            <p className="text-2xl font-bold text-orange">₹{pkg.price.toLocaleString()}</p>
                                            <p className="text-xs text-warmgray">per person</p>
                                        </div>
                                        <button className="btn-primary text-sm px-4 py-2.5 flex items-center gap-1.5">
                                            View <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
