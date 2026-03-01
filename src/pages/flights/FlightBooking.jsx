import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { Plane, User, Mail, Phone, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import Loader from '../../components/ui/Loader';
import { api } from '../../services/api.js';
import TripHealthScore from '../../components/ai/TripHealthScore.jsx';

export default function FlightBooking() {
    const { id } = useParams();
    const { cart, updateCart, confirmBooking } = useBooking();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [flight, setFlight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addOns, setAddOns] = useState({ meal: false, baggage: false, insurance: false });
    const [passenger, setPassenger] = useState({ name: '', email: '', phone: '', age: '', gender: 'Male' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        api.flights.get(id)
            .then(res => { setFlight(res.data); setLoading(false); })
            .catch(() => {
                // fallback: load list and find by id
                api.flights.list().then(r => {
                    const found = r.data.find(f => f.id === id) || r.data[0];
                    setFlight(found);
                    setLoading(false);
                }).catch(() => setLoading(false));
            });
    }, [id]);

    const addOnPrices = { meal: 350, baggage: 800, insurance: 499 };
    const addOnTotal = Object.entries(addOns).filter(([, v]) => v).reduce((s, [k]) => s + addOnPrices[k], 0);
    const totalPrice = flight ? flight.price + addOnTotal : 0;

    const validate = () => {
        const e = {};
        if (!passenger.name.trim()) e.name = 'Name is required';
        if (!passenger.email.trim()) e.email = 'Email is required';
        if (!passenger.phone.trim()) e.phone = 'Phone is required';
        if (!passenger.age) e.age = 'Age is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleConfirm = () => {
        if (!validate()) return;
        updateCart({ totalPrice, addOns: Object.keys(addOns).filter(k => addOns[k]) });
        const booking = confirmBooking([passenger], { method: 'Simulated', amount: totalPrice });
        navigate('/flights/confirmation', { state: { booking } });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader size="lg" /></div>;
    if (!flight) return null;

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Steps */}
                <div className="flex items-center gap-2 mb-8">
                    {['Passenger Details', 'Add-ons', 'Payment'].map((s, i) => (
                        <React.Fragment key={s}>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${step > i ? 'bg-orange text-white' : step === i + 1 ? 'bg-orange/20 text-orange border border-orange' : 'bg-sand/40 text-warmgray'}`}>
                                <span className="w-5 h-5 rounded-full bg-current flex items-center justify-center text-xs text-white" style={{ background: step > i ? '' : step === i + 1 ? '#FF7A00' : '#9A9080' }}>{i + 1}</span>
                                <span className="hidden sm:block">{s}</span>
                            </div>
                            {i < 2 && <div className={`flex-1 h-px ${step > i + 1 ? 'bg-orange' : 'bg-sand'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main */}
                    <div className="flex-1">
                        {step === 1 && (
                            <div className="card p-6">
                                <h2 className="text-xl font-display font-bold text-charcoal mb-5 flex items-center gap-2">
                                    <User className="w-5 h-5 text-orange" /> Passenger Details
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-warmgray mb-1 block">Full Name *</label>
                                        <input className={`input-field ${errors.name ? 'border-red-400' : ''}`} placeholder="As on ID proof"
                                            value={passenger.name} onChange={e => setPassenger(p => ({ ...p, name: e.target.value }))} />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-warmgray mb-1 block">Age *</label>
                                        <input type="number" className={`input-field ${errors.age ? 'border-red-400' : ''}`} placeholder="Age"
                                            value={passenger.age} onChange={e => setPassenger(p => ({ ...p, age: e.target.value }))} />
                                        {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-warmgray mb-1 block">Email *</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                            <input className={`input-field pl-10 ${errors.email ? 'border-red-400' : ''}`} placeholder="email@example.com"
                                                value={passenger.email} onChange={e => setPassenger(p => ({ ...p, email: e.target.value }))} />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-warmgray mb-1 block">Phone *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                            <input className={`input-field pl-10 ${errors.phone ? 'border-red-400' : ''}`} placeholder="10-digit mobile"
                                                value={passenger.phone} onChange={e => setPassenger(p => ({ ...p, phone: e.target.value }))} />
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-warmgray mb-1 block">Gender</label>
                                        <select className="input-field" value={passenger.gender} onChange={e => setPassenger(p => ({ ...p, gender: e.target.value }))}>
                                            <option>Male</option><option>Female</option><option>Other</option>
                                        </select>
                                    </div>
                                </div>
                                <button onClick={() => { if (validate()) setStep(2); }} className="btn-primary mt-6 flex items-center gap-2">
                                    Continue to Add-ons <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="card p-6">
                                <h2 className="text-xl font-display font-bold text-charcoal mb-5">Extra Add-ons</h2>
                                <div className="space-y-4">
                                    {[
                                        { key: 'meal', label: 'In-flight Meal', desc: 'Vegetarian or non-veg meal', price: 350, emoji: '🍛' },
                                        { key: 'baggage', label: 'Extra Baggage', desc: '15kg additional checked baggage', price: 800, emoji: '🧳' },
                                        { key: 'insurance', label: 'Travel Insurance', desc: 'Trip cancellation & medical cover', price: 499, emoji: '🛡️' },
                                    ].map(({ key, label, desc, price, emoji }) => (
                                        <label key={key} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${addOns[key] ? 'border-orange bg-orange/5' : 'border-sand hover:border-orange/40'}`}>
                                            <input type="checkbox" className="accent-orange" checked={addOns[key]} onChange={e => setAddOns(a => ({ ...a, [key]: e.target.checked }))} />
                                            <span className="text-2xl">{emoji}</span>
                                            <div className="flex-1">
                                                <p className="font-semibold text-charcoal">{label}</p>
                                                <p className="text-warmgray text-sm">{desc}</p>
                                            </div>
                                            <span className="font-bold text-orange">+₹{price}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                                    <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                        Proceed to Payment <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="card p-6">
                                <h2 className="text-xl font-display font-bold text-charcoal mb-5">Payment</h2>
                                <div className="space-y-3 mb-5">
                                    {[
                                        { label: '💳 Credit / Debit Card', desc: 'All cards accepted' },
                                        { label: '📱 UPI', desc: 'GPay, PhonePe, Paytm' },
                                        { label: '🏦 Net Banking', desc: 'All major banks' },
                                        { label: '👝 Wallet', desc: 'RouteSync Wallet Balance' },
                                    ].map(({ label, desc }) => (
                                        <label key={label} className="flex items-center gap-4 p-4 rounded-xl border-2 border-sand hover:border-orange/40 cursor-pointer transition-all">
                                            <input type="radio" name="payment" className="accent-orange" defaultChecked={label.includes('Credit')} />
                                            <div>
                                                <p className="font-medium text-charcoal">{label}</p>
                                                <p className="text-warmgray text-xs">{desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <div className="bg-sand/20 rounded-xl p-4 mb-5 border border-sand">
                                    <p className="text-sm text-warmgray mb-1">🔒 This is a simulated payment — no real transaction will occur.</p>
                                    <p className="font-bold text-charcoal">Total Payable: <span className="text-orange">₹{totalPrice.toLocaleString()}</span></p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                                    <button onClick={handleConfirm} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                        Pay ₹{totalPrice.toLocaleString()} <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="lg:w-72 shrink-0">
                        <div className="card p-5 sticky top-24">
                            <h3 className="font-semibold text-charcoal mb-4">Booking Summary</h3>
                            <div className="flex items-center gap-2 mb-3">
                                <Plane className="w-5 h-5 text-orange" />
                                <div>
                                    <p className="font-semibold text-charcoal text-sm">{flight.airline}</p>
                                    <p className="text-warmgray text-xs">{flight.id}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-warmgray">{flight.from}</span>
                                <span className="text-orange font-bold">→</span>
                                <span className="text-warmgray">{flight.to}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-warmgray mb-4">
                                <span>{flight.departureTime}</span>
                                <span>{flight.duration}</span>
                                <span>{flight.arrivalTime}</span>
                            </div>
                            <div className="divider" />
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-warmgray">Base Fare</span><span className="font-medium">₹{flight.price.toLocaleString()}</span></div>
                                {addOnTotal > 0 && <div className="flex justify-between"><span className="text-warmgray">Add-ons</span><span className="font-medium">₹{addOnTotal}</span></div>}
                                <div className="flex justify-between text-base font-bold pt-2 border-t border-sand">
                                    <span>Total</span><span className="text-orange">₹{totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <TripHealthScore
                            type="flight"
                            item={flight}
                            totalAmount={totalPrice}
                            date={flight.departureDate}
                            destination={flight.to}
                            passengers={cart?.passengers?.adults || 1}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
