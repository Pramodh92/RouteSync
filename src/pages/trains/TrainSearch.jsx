import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Train, ArrowRight } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export default function TrainSearch() {
    const navigate = useNavigate();
    const { updateSearch } = useBooking();
    const [form, setForm] = useState({ from: '', to: '', date: '', passengers: 1, class: '3A' });

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="relative h-64 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1920&h=400&fit=crop" alt="Trains" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-charcoal/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-4xl font-display font-bold text-ivory mb-2">Book <span className="text-orange">Train Tickets</span></h1>
                        <p className="text-sand/80">Rajdhani, Shatabdi, Vande Bharat & more</p>
                    </div>
                </div>
            </div>
            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 pb-12">
                <div className="card p-6 sm:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">FROM STATION</label>
                            <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input className="input-field pl-10" placeholder="e.g. Mumbai Central" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} /></div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">TO STATION</label>
                            <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input className="input-field pl-10" placeholder="e.g. New Delhi" value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} /></div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">DATE OF JOURNEY</label>
                            <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input type="date" className="input-field pl-10" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">CLASS</label>
                            <select className="input-field" value={form.class} onChange={e => setForm(f => ({ ...f, class: e.target.value }))}>
                                <option value="1A">1A — AC First Class</option>
                                <option value="2A">2A — AC 2 Tier</option>
                                <option value="3A">3A — AC 3 Tier</option>
                                <option value="SL">SL — Sleeper</option>
                                <option value="CC">CC — AC Chair Car</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={() => { updateSearch({ from: form.from, to: form.to, departureDate: form.date }); navigate('/trains/results'); }}
                        className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4">
                        <Train className="w-5 h-5" /> Search Trains <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-charcoal mb-4">Popular Trains</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[['Rajdhani Express', 'Delhi → Mumbai', '₹1,950'], ['Shatabdi Express', 'Delhi → Bhopal', '₹1,155'], ['Vande Bharat', 'Delhi → Varanasi', '₹1,155']].map(([n, r, p]) => (
                            <div key={n} className="card p-3">
                                <p className="font-semibold text-charcoal text-sm">{n}</p>
                                <p className="text-warmgray text-xs mt-0.5">{r}</p>
                                <p className="text-orange font-bold text-sm mt-1">From {p}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
