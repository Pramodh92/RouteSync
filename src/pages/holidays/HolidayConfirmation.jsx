import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, Briefcase, Home } from 'lucide-react';
export default function HolidayConfirmation() {
    const { state } = useLocation();
    const booking = state?.booking;
    return (
        <div className="min-h-screen bg-ivory pt-20 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center animate-slide-up">
                <div className="w-24 h-24 bg-green-50 rounded-full mx-auto mb-6 flex items-center justify-center ring-8 ring-green-50/50">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h1 className="text-3xl font-display font-bold text-charcoal mb-2">Holiday Booked! 🌴</h1>
                <p className="text-warmgray mb-8">Your dream holiday is confirmed. Our team will contact you with details!</p>
                {booking && (
                    <div className="card p-6 text-left mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2"><Package className="w-5 h-5 text-orange" /><span className="font-semibold">Holiday Package</span></div>
                            <span className="tag-orange text-xs">CONFIRMED</span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-warmgray">Booking ID</span><span className="font-bold">{booking.id}</span></div>
                            <div className="flex justify-between"><span className="text-warmgray">Lead Traveler</span><span>{booking.passengers?.[0]?.name || 'Traveler'}</span></div>
                            <div className="flex justify-between"><span className="text-warmgray">Amount Paid</span><span className="font-bold text-orange">₹{booking.totalAmount?.toLocaleString()}</span></div>
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
