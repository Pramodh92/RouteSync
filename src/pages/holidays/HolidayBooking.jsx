import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { ArrowRight, Package, MapPin } from 'lucide-react';

export default function HolidayBooking() {
    const { cart, confirmBooking } = useBooking();
    const navigate = useNavigate();
    const pkg = cart?.item;
    const totalPrice = pkg?.price || 25000;
    const [step, setStep] = useState(1);
    const [lead, setLead] = useState({ name: '', email: '', phone: '', travelDate: '' });

    const handleConfirm = () => {
        const booking = confirmBooking([lead], { method: 'Simulated', amount: totalPrice });
        navigate('/holidays/confirmation', { state: { booking } });
    };

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-display font-bold text-charcoal mb-6">Holiday Package Booking</h1>
                <div className="flex gap-2 mb-6">
                    {['Lead Traveler', 'Payment'].map((s, i) => (
                        <React.Fragment key={s}>
                            <div className={`px-4 py-2 rounded-xl text-sm font-medium ${step > i ? 'bg-orange text-white' : step === i + 1 ? 'bg-orange/20 text-orange' : 'bg-sand/40 text-warmgray'}`}>{s}</div>
                            {i < 1 && <div className={`flex-1 h-px self-center ${step > i + 1 ? 'bg-orange' : 'bg-sand'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        {step === 1 && (
                            <div className="card p-6">
                                <h2 className="text-xl font-semibold mb-5">Lead Traveler Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[['name', 'Full Name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel']].map(([k, l, t]) => (
                                        <div key={k}>
                                            <label className="text-xs font-medium text-warmgray mb-1 block">{l}</label>
                                            <input type={t} className="input-field" placeholder={l} value={lead[k]} onChange={e => setLead(x => ({ ...x, [k]: e.target.value }))} />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-xs font-medium text-warmgray mb-1 block">Travel Start Date</label>
                                        <input type="date" className="input-field" value={lead.travelDate} onChange={e => setLead(x => ({ ...x, travelDate: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-sand/20 rounded-xl border border-sand text-sm text-warmgray">
                                    💡 Our holiday experts will reach out to customize this package for your group.
                                </div>
                                <button onClick={() => setStep(2)} className="btn-primary mt-6 flex items-center gap-2">
                                    Continue to Payment <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {step === 2 && (
                            <div className="card p-6">
                                <h2 className="text-xl font-semibold mb-5">Payment</h2>
                                <div className="space-y-3 mb-4">
                                    {['💳 Credit / Debit Card', '📱 UPI', '🏦 Net Banking', '👝 Wallet'].map(m => (
                                        <label key={m} className="flex items-center gap-3 p-4 rounded-xl border-2 border-sand hover:border-orange/40 cursor-pointer">
                                            <input type="radio" name="pay" className="accent-orange" /><span className="text-sm text-charcoal">{m}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="bg-sand/20 p-4 rounded-xl mb-4 border border-sand">
                                    <p className="text-sm text-warmgray">🔒 Simulated payment · EMI options available</p>
                                    <p className="font-bold text-charcoal mt-1">Total: <span className="text-orange">₹{totalPrice.toLocaleString()}</span></p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                                    <button onClick={handleConfirm} className="btn-primary flex-1">Confirm & Pay</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Package summary */}
                    {pkg && (
                        <div className="lg:w-72 shrink-0">
                            <div className="card p-5 sticky top-24">
                                <h3 className="font-semibold text-charcoal mb-3">Package Summary</h3>
                                <img src={pkg.image} alt={pkg.name} className="w-full h-36 object-cover rounded-xl mb-3" />
                                <h4 className="font-semibold text-charcoal">{pkg.name}</h4>
                                <div className="flex items-center gap-1 mb-1"><MapPin className="w-3.5 h-3.5 text-warmgray" /><span className="text-xs text-warmgray">{pkg.destination}</span></div>
                                <p className="text-xs text-warmgray mb-3">{pkg.duration} · {pkg.travelers || 2} travelers</p>
                                <div className="flex justify-between font-bold border-t border-sand pt-3">
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
