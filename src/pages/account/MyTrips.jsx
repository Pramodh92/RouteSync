import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { Plane, Hotel, Train, Bus, Car, Package, X, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

const typeIcons = { flights: Plane, hotels: Hotel, trains: Train, buses: Bus, cabs: Car, holidays: Package };
const typeLabels = { flights: 'Flight', hotels: 'Hotel', trains: 'Train', buses: 'Bus', cabs: 'Cab', holidays: 'Holiday' };

export default function MyTrips() {
    const { bookings, cancelBooking } = useBooking();
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState(null);

    const filtered = filter === 'all' ? bookings : bookings.filter(b => b.type === filter || b.status === filter);
    const sorted = [...filtered].reverse();

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-display font-bold text-charcoal mb-6">My Trips</h1>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[['all', 'All Bookings'], ['confirmed', 'Confirmed'], ['cancelled', 'Cancelled'], ['flights', '✈️ Flights'], ['hotels', '🏨 Hotels'], ['trains', '🚆 Trains']].map(([val, label]) => (
                        <button key={val} onClick={() => setFilter(val)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === val ? 'bg-orange text-white' : 'bg-white border border-sand text-charcoal hover:border-orange/40'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {sorted.length === 0 ? (
                    <div className="card p-12 text-center">
                        <Plane className="w-12 h-12 text-sand mx-auto mb-4" />
                        <h3 className="text-charcoal font-semibold text-xl mb-2">No trips found</h3>
                        <p className="text-warmgray">Start booking your dream vacation!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sorted.map(booking => {
                            const Icon = typeIcons[booking.type] || Plane;
                            const label = typeLabels[booking.type] || 'Booking';
                            return (
                                <div key={booking.id} className="card p-5 animate-fade-in">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${booking.status === 'cancelled' ? 'bg-sand/50' : 'bg-orange/10'}`}>
                                            <Icon className={`w-6 h-6 ${booking.status === 'cancelled' ? 'text-warmgray' : 'text-orange'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="font-semibold text-charcoal capitalize">{label} Booking</span>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                                    {booking.status === 'confirmed' ? <CheckCircle className="w-3 h-3 inline mr-1" /> : <XCircle className="w-3 h-3 inline mr-1" />}
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <p className="text-warmgray text-sm">ID: {booking.id}</p>
                                            {booking.pnr && <p className="text-warmgray text-sm">PNR: <span className="font-medium tracking-wider">{booking.pnr}</span></p>}
                                            <div className="flex items-center gap-1 text-warmgray text-xs mt-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-orange text-lg">₹{booking.totalAmount?.toLocaleString()}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <button onClick={() => setSelected(booking)}
                                                    className="text-xs text-charcoal border border-sand hover:border-orange rounded-lg px-2 py-1 flex items-center gap-1 transition-all">
                                                    <Eye className="w-3 h-3" /> Details
                                                </button>
                                                {booking.status === 'confirmed' && (
                                                    <button onClick={() => { if (window.confirm('Cancel this booking?')) cancelBooking(booking.id); }}
                                                        className="text-xs text-red-500 border border-red-200 hover:border-red-400 rounded-lg px-2 py-1 flex items-center gap-1 transition-all">
                                                        <X className="w-3 h-3" /> Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detail modal */}
            {selected && (
                <div className="fixed inset-0 z-50 bg-charcoal/60 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="card max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-display font-semibold text-charcoal text-lg">Booking Details</h3>
                            <button onClick={() => setSelected(null)} className="text-warmgray hover:text-charcoal"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3 text-sm">
                            {[
                                ['Booking ID', selected.id],
                                ['PNR', selected.pnr || '—'],
                                ['Type', selected.type],
                                ['Status', selected.status],
                                ['Amount', `₹${selected.totalAmount?.toLocaleString()}`],
                                ['Date', new Date(selected.createdAt).toLocaleString()],
                            ].map(([k, v]) => (
                                <div key={k} className="flex justify-between">
                                    <span className="text-warmgray">{k}</span>
                                    <span className={`font-medium capitalize ${k === 'Amount' ? 'text-orange' : ''}`}>{v}</span>
                                </div>
                            ))}
                            {selected.passengers?.[0]?.name && (
                                <div className="flex justify-between"><span className="text-warmgray">Passenger</span><span className="font-medium">{selected.passengers[0].name}</span></div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
