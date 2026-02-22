import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { ArrowRight, MapPin, Bus } from 'lucide-react';

export default function BusBooking() {
    const { id } = useParams();
    const { cart, confirmBooking } = useBooking();
    const navigate = useNavigate();
    const bus = cart?.item;
    const totalSeats = bus?.totalSeats || 40;
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [step, setStep] = useState(1);
    const [passenger, setPassenger] = useState({ name: '', phone: '', email: '', boarding: '' });

    // Simulate booked seats from total
    const bookedSeats = React.useMemo(() => {
        const booked = new Set();
        const available = bus?.availableSeats || 20;
        const total = bus?.totalSeats || 40;
        while (booked.size < (total - available)) {
            booked.add(Math.floor(Math.random() * total) + 1);
        }
        return booked;
    }, [bus]);

    const toggleSeat = (n) => {
        if (bookedSeats.has(n)) return;
        setSelectedSeats(s => s.includes(n) ? s.filter(x => x !== n) : s.length < 4 ? [...s, n] : s);
    };

    const totalPrice = (bus?.price || 650) * selectedSeats.length;

    const handleConfirm = () => {
        const booking = confirmBooking([passenger], { method: 'Simulated', amount: totalPrice || bus?.price });
        navigate('/buses/confirmation', { state: { booking } });
    };

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-display font-bold text-charcoal mb-6">Bus Seat Selection</h1>
                <div className="flex gap-2 mb-6">
                    {['Select Seats', 'Passenger Details', 'Payment'].map((s, i) => (
                        <React.Fragment key={s}>
                            <div className={`px-3 py-2 rounded-xl text-xs font-medium ${step > i ? 'bg-orange text-white' : step === i + 1 ? 'bg-orange/20 text-orange' : 'bg-sand/40 text-warmgray'}`}>{s}</div>
                            {i < 2 && <div className={`flex-1 h-px self-center ${step > i + 1 ? 'bg-orange' : 'bg-sand'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        {step === 1 && (
                            <div className="card p-6">
                                <h2 className="text-lg font-semibold text-charcoal mb-2">Select Your Seats</h2>
                                <p className="text-warmgray text-sm mb-5">Click to select seats (max 4). Gray = Booked</p>

                                {/* Seat legend */}
                                <div className="flex items-center gap-6 mb-5 text-xs">
                                    <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-ivory border-2 border-sand" /><span>Available</span></div>
                                    <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-orange border-2 border-orange-dark" /><span className="text-orange">Selected</span></div>
                                    <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-sand/60 border-2 border-sand opacity-60" /><span className="text-warmgray">Booked</span></div>
                                </div>

                                {/* Bus layout */}
                                <div className="bg-ivory rounded-2xl p-4 border border-sand">
                                    <div className="flex justify-between items-center mb-4 px-2">
                                        <span className="text-xs font-medium text-warmgray">🚌 Front</span>
                                        <span className="text-xs text-warmgray">🚪 Door</span>
                                    </div>
                                    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(9, minmax(0, 1fr))' }}>
                                        {Array.from({ length: totalSeats }, (_, i) => i + 1).map(n => {
                                            const isBooked = bookedSeats.has(n);
                                            const isSelected = selectedSeats.includes(n);
                                            return (
                                                <button
                                                    key={n}
                                                    onClick={() => toggleSeat(n)}
                                                    className={`h-9 rounded-lg text-xs font-semibold transition-all ${isBooked ? 'bg-sand/60 border-2 border-sand cursor-not-allowed opacity-50' :
                                                            isSelected ? 'bg-orange border-2 border-orange-dark text-white shadow-orange' :
                                                                'bg-white border-2 border-sand hover:border-orange hover:bg-orange/10'
                                                        } ${n % 9 === 5 ? 'invisible' : ''}`}
                                                >
                                                    {n % 9 === 5 ? '' : n}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {selectedSeats.length > 0 && (
                                    <div className="mt-4 p-3 bg-orange/5 rounded-xl border border-orange/20">
                                        <p className="text-sm font-medium text-charcoal">Selected: Seat(s) {selectedSeats.sort((a, b) => a - b).join(', ')}</p>
                                        <p className="text-orange font-bold">₹{(bus?.price || 650)} × {selectedSeats.length} = ₹{totalPrice}</p>
                                    </div>
                                )}

                                <button disabled={!selectedSeats.length} onClick={() => setStep(2)}
                                    className="btn-primary mt-5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Continue <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="card p-6">
                                <h2 className="text-lg font-semibold mb-5">Passenger Details & Boarding</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[['name', 'Full Name'], ['phone', 'Phone'], ['email', 'Email']].map(([k, l]) => (
                                        <div key={k}>
                                            <label className="text-xs font-medium text-warmgray mb-1 block">{l}</label>
                                            <input className="input-field" placeholder={l} value={passenger[k]} onChange={e => setPassenger(p => ({ ...p, [k]: e.target.value }))} />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-xs font-medium text-warmgray mb-1 block">Boarding Point</label>
                                        <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                            <select className="input-field pl-10" value={passenger.boarding} onChange={e => setPassenger(p => ({ ...p, boarding: e.target.value }))}>
                                                <option value="">Select boarding point</option>
                                                {(bus?.boardingPoints || []).map(bp => <option key={bp} value={bp}>{bp}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                                    <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">Proceed to Payment <ArrowRight className="w-4 h-4" /></button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="card p-6">
                                <h2 className="text-lg font-semibold mb-5">Payment</h2>
                                <div className="space-y-3 mb-4">
                                    {['💳 Credit / Debit Card', '📱 UPI', '🏦 Net Banking'].map(m => (
                                        <label key={m} className="flex items-center gap-3 p-4 rounded-xl border-2 border-sand hover:border-orange/40 cursor-pointer">
                                            <input type="radio" name="pay" className="accent-orange" /><span className="text-sm text-charcoal">{m}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="bg-sand/20 p-4 rounded-xl mb-4 border border-sand">
                                    <p className="text-sm text-warmgray">🔒 Simulated payment</p>
                                    <p className="font-bold text-charcoal mt-1">Total: <span className="text-orange">₹{totalPrice || bus?.price}</span></p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                                    <button onClick={handleConfirm} className="btn-primary flex-1">Confirm & Pay</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="lg:w-64 shrink-0">
                        <div className="card p-5 sticky top-24">
                            <h3 className="font-semibold text-charcoal mb-3">Booking Summary</h3>
                            {bus && (
                                <>
                                    <div className="flex items-center gap-2 mb-3"><Bus className="w-5 h-5 text-orange" />
                                        <div><p className="font-semibold text-sm">{bus.operator}</p><p className="text-xs text-warmgray">{bus.type}</p></div>
                                    </div>
                                    <p className="text-sm text-charcoal">{bus.from} → {bus.to}</p>
                                    <p className="text-xs text-warmgray mt-0.5">{bus.departure} — {bus.arrival}</p>
                                    <div className="flex justify-between text-sm font-bold border-t border-sand mt-4 pt-3">
                                        <span>Total</span><span className="text-orange">₹{totalPrice || bus.price}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
