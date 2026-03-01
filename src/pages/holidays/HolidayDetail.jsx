import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star, Heart, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import Loader from '../../components/ui/Loader';
import { api } from '../../services/api.js';
import DestinationIntel from '../../components/ai/DestinationIntel.jsx';

export default function HolidayDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { startBooking } = useBooking();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openDay, setOpenDay] = useState(0);
    const [travelers, setTravelers] = useState(2);

    useEffect(() => {
        api.holidays.get(id)
            .then(res => { setPkg(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader size="lg" /></div>;
    if (!pkg) return null;

    const totalPrice = pkg.price * travelers;

    const handleBook = () => {
        startBooking({ ...pkg, price: totalPrice, travelers }, 'holidays');
        navigate(`/holidays/book/${pkg.id}`);
    };

    return (
        <div className="min-h-screen bg-ivory pt-20">
            {/* Hero */}
            <div className="relative h-80 sm:h-96 overflow-hidden">
                <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h1 className="text-4xl font-display font-bold text-ivory">{pkg.name}</h1>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-sand" /><span className="text-sand/80">{pkg.destination}</span></div>
                                    <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-sand" /><span className="text-sand/80">{pkg.duration}</span></div>
                                    <div className="flex items-center gap-1"><Star className="w-4 h-4 text-gold" fill="#C9A227" /><span className="text-sand font-medium">{pkg.rating}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main content */}
                    <div className="flex-1">
                        {/* Themes */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {(pkg.themes || []).map(t => <span key={t} className="tag-orange capitalize">{t}</span>)}
                        </div>

                        <p className="text-charcoal/80 leading-relaxed text-lg mb-8">{pkg.description}</p>

                        {/* Highlights */}
                        <h2 className="text-2xl font-display font-semibold text-charcoal mb-4">Trip Highlights</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
                            {(pkg.highlights || []).map(h => (
                                <div key={h} className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-orange mt-0.5 flex-shrink-0" />
                                    <span className="text-charcoal text-sm">{h}</span>
                                </div>
                            ))}
                        </div>

                        {/* Inclusions / Exclusions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                            <div className="card p-4">
                                <h3 className="font-semibold text-charcoal mb-3 flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Inclusions</h3>
                                <ul className="space-y-1.5">
                                    {(pkg.inclusions || []).map(i => <li key={i} className="text-sm text-charcoal/75 flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>{i}</li>)}
                                </ul>
                            </div>
                            <div className="card p-4">
                                <h3 className="font-semibold text-charcoal mb-3 flex items-center gap-2"><X className="w-4 h-4 text-red-400" /> Exclusions</h3>
                                <ul className="space-y-1.5">
                                    {(pkg.exclusions || []).map(e => <li key={e} className="text-sm text-charcoal/75 flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span>{e}</li>)}
                                </ul>
                            </div>
                        </div>

                        {/* Itinerary */}
                        <h2 className="text-2xl font-display font-semibold text-charcoal mb-4">Day-by-Day Itinerary</h2>
                        <div className="space-y-3 mb-8">
                            {(pkg.itinerary || []).map((day, i) => (
                                <div key={i} className={`rounded-2xl border-2 transition-all ${openDay === i ? 'border-orange' : 'border-sand'}`}>
                                    <button onClick={() => setOpenDay(openDay === i ? -1 : i)}
                                        className="w-full flex items-center justify-between p-4 text-left">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 bg-orange text-white rounded-full flex items-center justify-center text-sm font-bold">{i + 1}</span>
                                            <span className="font-semibold text-charcoal">{day.title || `Day ${i + 1}`}</span>
                                        </div>
                                        {openDay === i ? <ChevronUp className="w-4 h-4 text-orange" /> : <ChevronDown className="w-4 h-4 text-warmgray" />}
                                    </button>
                                    {openDay === i && (
                                        <div className="px-4 pb-4 text-charcoal/80 text-sm leading-relaxed border-t border-sand/50 pt-3">
                                            {day.description}
                                            {day.activities && (
                                                <ul className="mt-2 space-y-1">
                                                    {day.activities.map(a => <li key={a} className="flex items-center gap-2"><span className="text-orange">•</span>{a}</li>)}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* AI Destination Intel */}
                        <div className="mt-4">
                            <DestinationIntel destination={pkg.destination || pkg.title?.split(' ').slice(-1)[0] || 'India'} />
                        </div>
                    </div>

                    {/* Booking sidebar */}
                    <div className="lg:w-80 shrink-0">
                        <div className="card p-5 sticky top-24">
                            <p className="text-3xl font-bold text-orange mb-0.5">₹{pkg.price.toLocaleString()}<span className="text-warmgray text-sm font-normal">/person</span></p>
                            <p className="text-xs text-warmgray mb-4">{pkg.duration} · {(pkg.cities || []).join(' → ')}</p>

                            <div className="mb-4">
                                <label className="text-xs font-medium text-warmgray mb-1 block">Number of Travelers</label>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setTravelers(t => Math.max(1, t - 1))} className="w-9 h-9 rounded-xl border-2 border-sand hover:border-orange font-bold text-orange transition-all">−</button>
                                    <span className="flex-1 text-center font-bold text-charcoal text-lg">{travelers}</span>
                                    <button onClick={() => setTravelers(t => Math.min(10, t + 1))} className="w-9 h-9 rounded-xl border-2 border-sand hover:border-orange font-bold text-orange transition-all">+</button>
                                </div>
                            </div>

                            <div className="bg-sand/20 rounded-xl p-3 mb-4 space-y-1.5">
                                <div className="flex justify-between text-sm"><span className="text-warmgray">₹{pkg.price.toLocaleString()} × {travelers}</span><span>₹{totalPrice.toLocaleString()}</span></div>
                                <div className="flex justify-between text-base font-bold border-t border-sand pt-1.5">
                                    <span>Total</span><span className="text-orange">₹{totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <button onClick={handleBook} className="btn-primary w-full mb-2">Book Now</button>
                            <p className="text-xs text-warmgray text-center">Free cancellation up to 15 days before</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
