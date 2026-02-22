import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Bus, ArrowRight } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export default function BusSearch() {
    const navigate = useNavigate();
    const { updateSearch } = useBooking();
    const [form, setForm] = useState({ from: '', to: '', date: '' });

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="relative h-64 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=1920&h=400&fit=crop" alt="Buses" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-charcoal/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-4xl font-display font-bold text-ivory mb-2">Book <span className="text-orange">Bus Tickets</span></h1>
                        <p className="text-sand/80">Volvo, AC Sleeper, Seater & more</p>
                    </div>
                </div>
            </div>
            <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-10 pb-12">
                <div className="card p-6 sm:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">FROM</label>
                            <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input className="input-field pl-10" placeholder="Departure city" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} /></div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">TO</label>
                            <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input className="input-field pl-10" placeholder="Arrival city" value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} /></div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">DATE</label>
                            <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input type="date" className="input-field pl-10" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
                        </div>
                    </div>
                    <button onClick={() => { updateSearch({ from: form.from, to: form.to, departureDate: form.date }); navigate('/buses/results'); }}
                        className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4">
                        <Bus className="w-5 h-5" /> Search Buses <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-charcoal mb-4">Popular Routes</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[['Mumbai', 'Pune', '₹450'], ['Delhi', 'Jaipur', '₹650'], ['Bangalore', 'Goa', '₹1,200']].map(([f, t, p]) => (
                            <button key={f + t} onClick={() => setForm({ from: f, to: t, date: '' })}
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
