import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Hotel, ArrowRight } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export default function HotelSearch() {
    const navigate = useNavigate();
    const { updateSearch } = useBooking();
    const [form, setForm] = useState({ city: '', checkIn: '', checkOut: '', rooms: 1, guests: 2 });

    const popularCities = ['Goa', 'Jaipur', 'Shimla', 'Manali', 'Alleppey', 'Mumbai', 'Delhi', 'Udaipur'];

    const handleSearch = () => {
        updateSearch({ type: 'hotels', to: form.city, departureDate: form.checkIn, returnDate: form.checkOut, rooms: form.rooms, guests: form.guests });
        navigate('/hotels/listing');
    };

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="relative h-64 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920&h=400&fit=crop" alt="Hotels" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-charcoal/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-4xl font-display font-bold text-ivory mb-2">Find <span className="text-orange">Perfect Hotels</span></h1>
                        <p className="text-sand/80">Luxury resorts to boutique stays — all at the best prices</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 pb-12">
                <div className="card p-6 sm:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-warmgray mb-1 block">CITY / DESTINATION</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input className="input-field pl-10" placeholder="Where do you want to stay?" value={form.city}
                                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">CHECK-IN</label>
                            <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input type="date" className="input-field pl-10" value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} /></div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">CHECK-OUT</label>
                            <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input type="date" className="input-field pl-10" value={form.checkOut} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} /></div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">ROOMS</label>
                            <select className="input-field" value={form.rooms} onChange={e => setForm(f => ({ ...f, rooms: +e.target.value }))}>
                                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">GUESTS</label>
                            <div className="relative"><Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <select className="input-field pl-10" value={form.guests} onChange={e => setForm(f => ({ ...f, guests: +e.target.value }))}>
                                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                                </select></div>
                        </div>
                    </div>
                    <button onClick={handleSearch} className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4">
                        <Hotel className="w-5 h-5" /> Search Hotels <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-charcoal mb-4">Popular Destinations</h2>
                    <div className="flex flex-wrap gap-3">
                        {popularCities.map(c => (
                            <button key={c} onClick={() => setForm(f => ({ ...f, city: c }))}
                                className="px-4 py-2 rounded-xl bg-white border border-sand text-charcoal text-sm hover:border-orange hover:text-orange transition-all shadow-sm">
                                📍 {c}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
