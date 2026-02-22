import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Plane, ArrowRight } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export default function FlightSearch() {
    const navigate = useNavigate();
    const { updateSearch } = useBooking();
    const [form, setForm] = useState({ from: '', to: '', date: '', returnDate: '', passengers: 1, class: 'Economy', type: 'one-way' });

    const handleSearch = () => {
        updateSearch({ from: form.from, to: form.to, departureDate: form.date, returnDate: form.returnDate, passengers: { adults: form.passengers }, class: form.class });
        navigate('/flights/results');
    };

    return (
        <div className="min-h-screen bg-ivory pt-20">
            {/* Hero */}
            <div className="relative h-64 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=400&fit=crop" alt="Flights" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-charcoal/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-4xl font-display font-bold text-ivory mb-2">Book <span className="text-orange">Flights</span></h1>
                        <p className="text-sand/80">Find the best fares for domestic and international travel</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
                <div className="card p-6 sm:p-8">
                    {/* Trip type */}
                    <div className="flex gap-3 mb-6">
                        {['one-way', 'round-trip'].map(t => (
                            <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${form.type === t ? 'bg-orange text-white' : 'bg-sand/40 text-olive hover:bg-sand'}`}>
                                {t === 'one-way' ? 'One Way' : 'Round Trip'}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="relative">
                            <label className="block text-xs font-medium text-warmgray mb-1 ml-1">FROM</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input className="input-field pl-10" placeholder="Departure city (e.g. Mumbai)" value={form.from}
                                    onChange={e => setForm(f => ({ ...f, from: e.target.value }))} />
                            </div>
                        </div>
                        <div className="relative">
                            <label className="block text-xs font-medium text-warmgray mb-1 ml-1">TO</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input className="input-field pl-10" placeholder="Arrival city (e.g. Delhi)" value={form.to}
                                    onChange={e => setForm(f => ({ ...f, to: e.target.value }))} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-medium text-warmgray mb-1 ml-1">DEPARTURE DATE</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input type="date" className="input-field pl-10" value={form.date}
                                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                            </div>
                        </div>
                        {form.type === 'round-trip' && (
                            <div>
                                <label className="block text-xs font-medium text-warmgray mb-1 ml-1">RETURN DATE</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                    <input type="date" className="input-field pl-10" value={form.returnDate}
                                        onChange={e => setForm(f => ({ ...f, returnDate: e.target.value }))} />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-medium text-warmgray mb-1 ml-1">PASSENGERS</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <select className="input-field pl-10" value={form.passengers}
                                    onChange={e => setForm(f => ({ ...f, passengers: +e.target.value }))}>
                                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-warmgray mb-1 ml-1">CLASS</label>
                            <select className="input-field" value={form.class}
                                onChange={e => setForm(f => ({ ...f, class: e.target.value }))}>
                                <option>Economy</option><option>Business</option><option>First Class</option>
                            </select>
                        </div>
                    </div>

                    <button onClick={handleSearch} className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4">
                        <Plane className="w-5 h-5" /> Search Flights <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Popular routes */}
                <div className="mt-8 mb-10">
                    <h2 className="text-lg font-semibold text-charcoal mb-4">Popular Routes</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[['Mumbai', 'Delhi', '₹4,599'], ['Delhi', 'Goa', '₹5,599'], ['Bangalore', 'Mumbai', '₹3,799'], ['Chennai', 'Kolkata', '₹5,799']].map(([f, t, p]) => (
                            <button key={f + t} onClick={() => { setForm(prev => ({ ...prev, from: f, to: t })); }}
                                className="card p-3 text-left hover:-translate-y-0.5 transition-transform">
                                <p className="text-xs text-warmgray">{f} → {t}</p>
                                <p className="font-bold text-orange text-sm mt-0.5">From {p}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
