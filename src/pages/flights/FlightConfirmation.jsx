import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Plane, Home, Briefcase, Sparkles, Loader, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { api } from '../../services/api.js';

export default function FlightConfirmation() {
    const { state } = useLocation();
    const booking = state?.booking;
    const [itinerary, setItinerary] = useState(null);
    const [itinLoading, setItinLoading] = useState(false);
    const [itinOpen, setItinOpen] = useState(false);

    const generateItinerary = async () => {
        setItinLoading(true);
        try {
            const res = await api.ai.itinerary({
                booking,
                destination: booking?.details?.to || 'India',
                days: 3
            });
            setItinerary(res.data); setItinOpen(true);
        } catch { setItinerary({ title: 'Trip Itinerary', destination: booking?.details?.to, checklist: ['Check flight status', 'Pack documents', 'Confirm hotel'], itinerary: [] }); setItinOpen(true); }
        finally { setItinLoading(false); }
    };

    return (
        <div className="min-h-screen bg-ivory pt-20 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center animate-slide-up">
                {/* Success icon */}
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50/50">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>

                <h1 className="text-3xl font-display font-bold text-charcoal mb-2">Booking Confirmed! 🎉</h1>
                <p className="text-warmgray mb-8">Your flight has been booked successfully. Safe travels!</p>

                {booking && (
                    <div className="card p-6 text-left mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Plane className="w-5 h-5 text-orange" />
                                <span className="font-semibold text-charcoal">Flight Booking</span>
                            </div>
                            <span className="tag-orange text-xs">CONFIRMED</span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-warmgray">PNR Number</span>
                                <span className="font-bold text-charcoal tracking-widest">{booking.pnr}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-warmgray">Booking ID</span>
                                <span className="font-medium text-charcoal">{booking.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-warmgray">Passenger</span>
                                <span className="font-medium">{booking.passengers?.[0]?.name || 'Traveler'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-warmgray">Amount Paid</span>
                                <span className="font-bold text-orange">₹{booking.totalAmount?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/" className="flex-1 btn-secondary flex items-center justify-center gap-2">
                        <Home className="w-4 h-4" /> Back to Home
                    </Link>
                    <Link to="/my-trips" className="flex-1 btn-primary flex items-center justify-center gap-2">
                        <Briefcase className="w-4 h-4" /> My Trips
                    </Link>
                </div>

                {/* AI Itinerary Generator */}
                <div className="card p-5 mt-6 text-left">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-orange" />
                            <span className="font-semibold text-charcoal">AI Trip Itinerary</span>
                            <span className="tag-orange text-xs">Free</span>
                        </div>
                        {itinerary && (
                            <button onClick={() => setItinOpen(o => !o)} className="text-warmgray hover:text-charcoal">
                                {itinOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                    {!itinerary && !itinLoading && (
                        <>
                            <p className="text-sm text-warmgray mb-3">Generate a complete day-by-day itinerary, packing list, and travel tips for your trip!</p>
                            <button onClick={generateItinerary} className="btn-primary w-full flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4" /> Generate My Itinerary
                            </button>
                        </>
                    )}
                    {itinLoading && (
                        <div className="flex items-center gap-3 py-4 justify-center text-warmgray text-sm">
                            <Loader className="w-5 h-5 animate-spin text-orange" /> Crafting your personalized itinerary…
                        </div>
                    )}
                    {itinerary && itinOpen && (
                        <div className="space-y-4 mt-2">
                            <p className="font-bold text-charcoal">{itinerary.title}</p>
                            {itinerary.checklist?.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-charcoal mb-2">✅ Pre-Trip Checklist</p>
                                    <ul className="space-y-1">{itinerary.checklist.map((c, i) => <li key={i} className="text-xs text-charcoal/75 flex gap-2"><span className="text-orange">✓</span>{c}</li>)}</ul>
                                </div>
                            )}
                            {itinerary.itinerary?.slice(0, 3).map((day, i) => (
                                <div key={i} className="bg-ivory rounded-xl p-3">
                                    <p className="font-semibold text-charcoal text-sm">Day {day.day}: {day.title}</p>
                                    <p className="text-xs text-warmgray mt-1">🌅 {day.morning}</p>
                                    <p className="text-xs text-warmgray">☀️ {day.afternoon}</p>
                                    <p className="text-xs text-warmgray">🌟 {day.evening}</p>
                                </div>
                            ))}
                            {itinerary.weatherTip && <p className="text-xs text-orange bg-orange/5 rounded-xl px-3 py-2">{itinerary.weatherTip}</p>}
                            <button onClick={() => window.print()} className="btn-secondary w-full text-sm flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" /> Save as PDF
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
