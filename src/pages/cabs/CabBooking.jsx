import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { ArrowRight, Car } from 'lucide-react';

export default function CabBooking() {
    const { cart, confirmBooking } = useBooking();
    const navigate = useNavigate();
    const cab = cart?.item;
    const totalPrice = cab?.price || 3500;
    const [form, setForm] = useState({ name: '', phone: '', email: '', pickup: '', drop: '' });

    const handleConfirm = () => {
        const booking = confirmBooking([form], { method: 'Simulated', amount: totalPrice });
        navigate('/cabs/confirmation', { state: { booking } });
    };

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-display font-bold text-charcoal mb-6">Confirm Cab Booking</h1>
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold mb-5">Passenger & Trip Details</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[['name', 'Full Name', 'text'], ['phone', 'Phone', 'tel'], ['email', 'Email', 'email'], ['pickup', 'Pickup Address', 'text'], ['drop', 'Drop Address', 'text']].map(([k, l, t]) => (
                                    <div key={k} className={k === 'pickup' || k === 'drop' ? 'sm:col-span-2' : ''}>
                                        <label className="text-xs font-medium text-warmgray mb-1 block">{l}</label>
                                        <input type={t} className="input-field" placeholder={l} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 space-y-3">
                                <p className="text-sm font-medium text-charcoal mb-3">Payment Method</p>
                                {['💳 Credit / Debit Card', '📱 UPI', '💵 Cash on Arrival'].map(m => (
                                    <label key={m} className="flex items-center gap-3 p-3 rounded-xl border-2 border-sand hover:border-orange/40 cursor-pointer">
                                        <input type="radio" name="pay" className="accent-orange" /><span className="text-sm text-charcoal">{m}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="bg-sand/20 p-4 rounded-xl mt-5 border border-sand">
                                <p className="text-sm text-warmgray">🔒 Simulated payment · Driver assigned post-booking</p>
                                <p className="font-bold text-charcoal mt-1">Total: <span className="text-orange">₹{totalPrice.toLocaleString()}</span></p>
                            </div>
                            <button onClick={handleConfirm} className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
                                Confirm Booking <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    {cab && (
                        <div className="lg:w-64 shrink-0">
                            <div className="card p-5 sticky top-24">
                                <h3 className="font-semibold text-charcoal mb-3">Ride Summary</h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <Car className="w-5 h-5 text-orange" />
                                    <div><p className="font-semibold text-sm">{cab.type}</p><p className="text-xs text-warmgray">{cab.example}</p></div>
                                </div>
                                {cab.distance && <p className="text-sm text-warmgray">Distance: ~{cab.distance} km</p>}
                                <div className="flex justify-between font-bold border-t border-sand mt-4 pt-3">
                                    <span>Total</span><span className="text-orange">₹{totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
