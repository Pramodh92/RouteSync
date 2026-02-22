import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { ArrowRight } from 'lucide-react';

export default function TrainBooking() {
    const { cart, confirmBooking } = useBooking();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [p, setP] = useState({ name: '', age: '', gender: 'Male', berth: 'Lower' });
    const train = cart?.item;
    const price = train?.price || 1950;

    const handleConfirm = () => {
        const booking = confirmBooking([p], { method: 'Simulated', amount: price });
        navigate('/trains/confirmation', { state: { booking } });
    };

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-display font-bold text-charcoal mb-6">Train Booking</h1>
                <div className="flex gap-2 mb-6">
                    {['Passenger Details', 'Payment'].map((s, i) => (
                        <React.Fragment key={s}>
                            <div className={`px-4 py-2 rounded-xl text-sm font-medium ${step > i ? 'bg-orange text-white' : step === i + 1 ? 'bg-orange/20 text-orange' : 'bg-sand/40 text-warmgray'}`}>{s}</div>
                            {i < 1 && <div className={`flex-1 h-px self-center ${step > i + 1 ? 'bg-orange' : 'bg-sand'}`} />}
                        </React.Fragment>
                    ))}
                </div>
                <div className="flex gap-6 flex-col lg:flex-row">
                    <div className="flex-1">
                        {step === 1 && (
                            <div className="card p-6">
                                <h2 className="text-xl font-semibold mb-5">Passenger Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[['name', 'Full Name'], ['age', 'Age']].map(([k, l]) => (
                                        <div key={k}><label className="text-xs font-medium text-warmgray mb-1 block">{l} *</label>
                                            <input className="input-field" placeholder={l} value={p[k]} onChange={e => setP(x => ({ ...x, [k]: e.target.value }))} /></div>
                                    ))}
                                    <div><label className="text-xs font-medium text-warmgray mb-1 block">Gender</label>
                                        <select className="input-field" value={p.gender} onChange={e => setP(x => ({ ...x, gender: e.target.value }))}>
                                            <option>Male</option><option>Female</option><option>Other</option>
                                        </select></div>
                                    <div><label className="text-xs font-medium text-warmgray mb-1 block">Berth Preference</label>
                                        <select className="input-field" value={p.berth} onChange={e => setP(x => ({ ...x, berth: e.target.value }))}>
                                            <option>Lower</option><option>Middle</option><option>Upper</option><option>Side Lower</option><option>Side Upper</option>
                                        </select></div>
                                </div>
                                <button onClick={() => setStep(2)} className="btn-primary mt-6 flex items-center gap-2">Continue <ArrowRight className="w-4 h-4" /></button>
                            </div>
                        )}
                        {step === 2 && (
                            <div className="card p-6">
                                <h2 className="text-xl font-semibold mb-5">Payment</h2>
                                <div className="space-y-3 mb-4">
                                    {['💳 Credit / Debit Card', '📱 UPI', '🏦 Net Banking'].map(m => (
                                        <label key={m} className="flex items-center gap-3 p-4 rounded-xl border-2 border-sand hover:border-orange/40 cursor-pointer">
                                            <input type="radio" name="pay" className="accent-orange" /><span className="text-sm text-charcoal">{m}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="bg-sand/20 p-4 rounded-xl mb-4 border border-sand">
                                    <p className="text-sm text-warmgray">🔒 Simulated payment</p>
                                    <p className="font-bold text-charcoal mt-1">Total: <span className="text-orange">₹{price.toLocaleString()}</span></p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                                    <button onClick={handleConfirm} className="btn-primary flex-1">Confirm & Pay ₹{price.toLocaleString()}</button>
                                </div>
                            </div>
                        )}
                    </div>
                    {train && (
                        <div className="lg:w-64 shrink-0">
                            <div className="card p-5 sticky top-24">
                                <h3 className="font-semibold text-charcoal mb-3">Journey Summary</h3>
                                <p className="font-bold text-charcoal">{train.name}</p>
                                <p className="text-warmgray text-sm">{train.from} → {train.to}</p>
                                {train.selectedClass && <p className="text-sm text-orange font-medium mt-1">{train.selectedClass.type} — {train.selectedClass.name}</p>}
                                <div className="flex justify-between font-bold border-t border-sand mt-4 pt-3">
                                    <span>Total</span><span className="text-orange">₹{price.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
