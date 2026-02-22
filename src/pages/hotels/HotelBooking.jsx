import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { User, Mail, Phone, MapPin, Calendar, ArrowRight } from 'lucide-react';

export default function HotelBooking() {
    const { id } = useParams();
    const { cart, updateCart, confirmBooking } = useBooking();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [guest, setGuest] = useState({ name: '', email: '', phone: '', checkIn: '', checkOut: '' });
    const [errors, setErrors] = useState({});
    const hotel = cart?.item;
    const totalPrice = hotel?.price || hotel?.pricePerNight || 6000;

    const validate = () => {
        const e = {};
        if (!guest.name.trim()) e.name = 'Required';
        if (!guest.email.trim()) e.email = 'Required';
        if (!guest.phone.trim()) e.phone = 'Required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleConfirm = () => {
        const booking = confirmBooking([guest], { method: 'Simulated', amount: totalPrice });
        navigate('/hotels/confirmation', { state: { booking } });
    };

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-display font-bold text-charcoal mb-6">Complete Your Hotel Booking</h1>

                {/* Steps */}
                <div className="flex items-center gap-2 mb-8">
                    {['Guest Details', 'Payment'].map((s, i) => (
                        <React.Fragment key={s}>
                            <div className={`px-4 py-2 rounded-xl text-sm font-medium ${step > i ? 'bg-orange text-white' : step === i + 1 ? 'bg-orange/20 text-orange border border-orange' : 'bg-sand/40 text-warmgray'}`}>{s}</div>
                            {i < 1 && <div className={`flex-1 h-px ${step > i + 1 ? 'bg-orange' : 'bg-sand'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        {step === 1 && (
                            <div className="card p-6">
                                <h2 className="text-xl font-display font-semibold mb-5 flex items-center gap-2">
                                    <User className="w-5 h-5 text-orange" /> Guest Details
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[['name', 'Full Name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel']].map(([k, l, t]) => (
                                        <div key={k} className={k === 'name' ? 'sm:col-span-2' : ''}>
                                            <label className="text-xs font-medium text-warmgray mb-1 block">{l} *</label>
                                            <input type={t} className={`input-field ${errors[k] ? 'border-red-400' : ''}`} placeholder={l}
                                                value={guest[k]} onChange={e => setGuest(g => ({ ...g, [k]: e.target.value }))} />
                                            {errors[k] && <p className="text-red-500 text-xs mt-1">{errors[k]}</p>}
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-xs font-medium text-warmgray mb-1 block">Check-in Date</label>
                                        <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                            <input type="date" className="input-field pl-10" value={guest.checkIn}
                                                onChange={e => setGuest(g => ({ ...g, checkIn: e.target.value }))} /></div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-warmgray mb-1 block">Check-out Date</label>
                                        <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                            <input type="date" className="input-field pl-10" value={guest.checkOut}
                                                onChange={e => setGuest(g => ({ ...g, checkOut: e.target.value }))} /></div>
                                    </div>
                                </div>
                                <button onClick={() => { if (validate()) setStep(2); }} className="btn-primary mt-6 flex items-center gap-2">
                                    Continue to Payment <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {step === 2 && (
                            <div className="card p-6">
                                <h2 className="text-xl font-display font-semibold mb-5">Payment</h2>
                                <div className="space-y-3 mb-4">
                                    {['💳 Credit / Debit Card', '📱 UPI', '🏦 Net Banking', '👝 Wallet'].map(m => (
                                        <label key={m} className="flex items-center gap-3 p-4 rounded-xl border-2 border-sand hover:border-orange/40 cursor-pointer">
                                            <input type="radio" name="pay" className="accent-orange" defaultChecked={m.includes('Credit')} />
                                            <span className="text-charcoal text-sm">{m}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="bg-sand/20 rounded-xl p-4 mb-5 border border-sand">
                                    <p className="text-sm text-warmgray mb-1">🔒 Simulated payment — no real transaction will occur.</p>
                                    <p className="font-bold text-charcoal">Total: <span className="text-orange">₹{totalPrice.toLocaleString()}</span></p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                                    <button onClick={handleConfirm} className="btn-primary flex-1">Confirm Booking</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="lg:w-72 shrink-0">
                        <div className="card p-5 sticky top-24">
                            <h3 className="font-semibold text-charcoal mb-3">Booking Summary</h3>
                            {hotel && <><img src={hotel.image} alt={hotel.name} className="w-full h-36 object-cover rounded-xl mb-3" />
                                <h4 className="font-semibold text-charcoal text-sm">{hotel.name}</h4>
                                <div className="flex items-center gap-1 mb-3"><MapPin className="w-3.5 h-3.5 text-warmgray" /><span className="text-warmgray text-xs">{hotel.city}</span></div></>}
                            <div className="flex justify-between font-bold text-base border-t border-sand pt-3">
                                <span>Total</span><span className="text-orange">₹{totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
