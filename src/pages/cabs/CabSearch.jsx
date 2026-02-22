import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Car, ArrowRight } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export default function CabSearch() {
    const navigate = useNavigate();
    const { updateSearch } = useBooking();
    const [form, setForm] = useState({ from: '', to: '', date: '', time: '10:00', type: 'outstation' });

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="relative h-64 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920&h=400&fit=crop" alt="Cabs" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-charcoal/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-4xl font-display font-bold text-ivory mb-2">Book a <span className="text-orange">Cab</span></h1>
                        <p className="text-sand/80">Outstation, one-way, round-trip & airport transfers</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 pb-12">
                <div className="card p-6 sm:p-8">
                    <div className="flex gap-3 mb-6">
                        {['outstation', 'airport', 'local'].map(t => (
                            <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${form.type === t ? 'bg-orange text-white' : 'bg-sand/40 text-olive hover:bg-sand'}`}>
                                {t === 'outstation' ? '🛣️ Outstation' : t === 'airport' ? '✈️ Airport' : '🏙️ Local'}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">PICKUP LOCATION</label>
                            <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input className="input-field pl-10" placeholder="Enter pickup address" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} /></div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">DROP LOCATION</label>
                            <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input className="input-field pl-10" placeholder="Enter destination" value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} /></div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">PICKUP DATE</label>
                            <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input type="date" className="input-field pl-10" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">PICKUP TIME</label>
                            <input type="time" className="input-field" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                        </div>
                    </div>
                    <button onClick={() => { updateSearch({ from: form.from, to: form.to, departureDate: form.date }); navigate('/cabs/results'); }}
                        className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4">
                        <Car className="w-5 h-5" /> Search Cabs <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-charcoal mb-4">Why Book Cabs with RouteSync?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[['🚗', 'Expert Drivers', 'Professional & verified chauffeurs'], ['💰', 'Transparent Pricing', 'No hidden charges or surge pricing'], ['📍', 'Real-time Tracking', 'Live cab tracking & driver details']].map(([e, t, d]) => (
                            <div key={t} className="card p-4">
                                <span className="text-2xl mb-2 block">{e}</span>
                                <p className="font-semibold text-charcoal">{t}</p>
                                <p className="text-sm text-warmgray mt-1">{d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
