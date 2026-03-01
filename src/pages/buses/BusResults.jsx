import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Star, Clock, Wifi, Zap, Coffee, ArrowRight } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import Loader from '../../components/ui/Loader';
import { api } from '../../services/api.js';

export default function BusResults() {
    const { searchData, startBooking } = useBooking();
    const navigate = useNavigate();
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        api.buses.list().then(res => { setBuses(res.data); setLoading(false); });
    }, []);

    const filtered = buses.filter(b => typeFilter === 'all' || b.type.toLowerCase().includes(typeFilter.toLowerCase()));

    const handleBook = (bus) => {
        startBooking(bus, 'buses');
        navigate(`/buses/book/${bus.id}`);
    };

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="bg-charcoal text-sand py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-2xl font-display font-bold text-ivory">{searchData.from || 'Origin'} → {searchData.to || 'Destination'}</h1>
                    <p className="text-sand/60">{filtered.length} buses available</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex gap-2 mb-6 flex-wrap">
                    {['all', 'Volvo', 'AC Sleeper', 'Semi-Sleeper', 'Seater'].map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${typeFilter === t ? 'bg-orange text-white' : 'bg-sand/40 text-charcoal hover:bg-sand'}`}>
                            {t === 'all' ? 'All Types' : t}
                        </button>
                    ))}
                </div>

                {loading ? <div className="flex justify-center py-20"><Loader size="lg" /></div> : (
                    <div className="space-y-4">
                        {filtered.map(bus => (
                            <div key={bus.id} className="card p-5 animate-fade-in">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex items-center gap-3 min-w-40">
                                        <div className="w-10 h-10 bg-sand/40 rounded-xl flex items-center justify-center">
                                            <Bus className="w-5 h-5 text-orange" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-charcoal text-sm">{bus.operator}</p>
                                            <p className="text-warmgray text-xs">{bus.type}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex items-center gap-6">
                                        <div><p className="text-xl font-bold text-charcoal">{bus.departure}</p>
                                            <p className="text-warmgray text-xs">{bus.from}</p></div>
                                        <div className="flex-1 flex flex-col items-center">
                                            <p className="text-warmgray text-xs mb-1">{bus.duration}</p>
                                            <div className="flex items-center w-full gap-1">
                                                <div className="flex-1 h-px bg-sand" /><Bus className="w-4 h-4 text-orange" /><div className="flex-1 h-px bg-sand" />
                                            </div>
                                        </div>
                                        <div className="text-right"><p className="text-xl font-bold text-charcoal">{bus.arrival}</p>
                                            <p className="text-warmgray text-xs">{bus.to}</p></div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {bus.amenities.slice(0, 3).map(a => <span key={a} className="tag-olive text-xs">{a}</span>)}
                                    </div>

                                    <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 ml-auto">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 text-gold" fill="#C9A227" />
                                            <span className="text-sm font-medium">{bus.rating}</span>
                                        </div>
                                        <p className="text-orange font-bold text-lg">₹{bus.price}</p>
                                        <p className="text-warmgray text-xs">{bus.availableSeats} seats left</p>
                                        <button onClick={() => handleBook(bus)} className="btn-primary text-sm px-5 py-2.5">Book Now</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
