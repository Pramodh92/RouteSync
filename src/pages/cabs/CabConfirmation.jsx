import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Car, Briefcase, Home, Phone } from 'lucide-react';
export default function CabConfirmation() {
    const { state } = useLocation();
    const booking = state?.booking;
    return (
        <div className="min-h-screen bg-ivory pt-20 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center animate-slide-up">
                <div className="w-24 h-24 bg-green-50 rounded-full mx-auto mb-6 flex items-center justify-center ring-8 ring-green-50/50">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h1 className="text-3xl font-display font-bold text-charcoal mb-2">Cab Booked! 🚗</h1>
                <p className="text-warmgray mb-8">Your cab is confirmed. The driver will contact you shortly.</p>
                {booking && (
                    <div className="card p-6 text-left mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2"><Car className="w-5 h-5 text-orange" /><span className="font-semibold">Cab Booking</span></div>
                            <span className="tag-orange text-xs">CONFIRMED</span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-warmgray">Booking ID</span><span className="font-bold">{booking.id}</span></div>
                            <div className="flex justify-between"><span className="text-warmgray">Amount</span><span className="font-bold text-orange">₹{booking.totalAmount?.toLocaleString()}</span></div>
                        </div>
                        <div className="mt-4 p-3 bg-orange/5 rounded-xl border border-orange/20 flex items-center gap-3">
                            <Phone className="w-5 h-5 text-orange" />
                            <div>
                                <p className="font-semibold text-charcoal text-sm">Driver will call you</p>
                                <p className="text-xs text-warmgray">Your driver details will be shared 30 min before pickup</p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex gap-3">
                    <Link to="/" className="flex-1 btn-secondary flex items-center justify-center gap-2"><Home className="w-4 h-4" />Home</Link>
                    <Link to="/my-trips" className="flex-1 btn-primary flex items-center justify-center gap-2"><Briefcase className="w-4 h-4" />My Trips</Link>
                </div>
            </div>
        </div>
    );
}
