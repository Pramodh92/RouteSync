import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Users, Wifi, Wind, Check } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import Loader from '../../components/ui/Loader';
import { api } from '../../services/api.js';

export default function CabResults() {
    const { searchData, startBooking } = useBooking();
    const navigate = useNavigate();
    const [cabs, setCabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [distance, setDistance] = useState(250);

    useEffect(() => {
        api.cabs.list().then(res => { setCabs(res.data); setLoading(false); });
    }, []);

    const getPriceForCab = (cab) => Math.round(cab.basePrice + (distance * cab.pricePerKm));

    const handleBook = (cab) => {
        startBooking({ ...cab, price: getPriceForCab(cab), distance }, 'cabs');
        navigate(`/cabs/book/${cab.id}`);
    };

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="bg-charcoal text-sand py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-2xl font-display font-bold text-ivory">{searchData.from || 'Pickup'} → {searchData.to || 'Drop'}</h1>
                    <p className="text-sand/60">Choose your cab type</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Distance slider */}
                <div className="card p-4 mb-6 flex items-center gap-4">
                    <label className="text-sm font-medium text-charcoal whitespace-nowrap">Estimated Distance:</label>
                    <input type="range" min={50} max={1000} step={50} value={distance} onChange={e => setDistance(+e.target.value)} className="flex-1 accent-orange" />
                    <span className="text-orange font-bold whitespace-nowrap">{distance} km</span>
                </div>

                {loading ? <div className="flex justify-center py-20"><Loader size="lg" /></div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {cabs.map(cab => {
                            const price = getPriceForCab(cab);
                            return (
                                <div key={cab.id} className="card p-5 hover:-translate-y-0.5 transition-transform duration-300 animate-fade-in">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-20 h-14 rounded-xl bg-sand/30 flex items-center justify-center">
                                            <Car className="w-8 h-8 text-orange" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-charcoal text-lg">{cab.type}</h3>
                                            <div className="flex items-center gap-2 text-warmgray text-sm">
                                                <Users className="w-4 h-4" /> <span>{cab.capacity} Passengers</span>
                                            </div>
                                            <p className="text-xs text-warmgray mt-0.5">{cab.example}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-orange">₹{price.toLocaleString()}</p>
                                            <p className="text-xs text-warmgray">₹{cab.pricePerKm}/km</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {cab.amenities.map(a => (
                                            <span key={a} className="flex items-center gap-1 text-xs text-olive bg-olive/10 px-2 py-1 rounded-lg">
                                                <Check className="w-3 h-3" /> {a}
                                            </span>
                                        ))}
                                    </div>
                                    <button onClick={() => handleBook(cab)} className="btn-primary w-full">Book {cab.type}</button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
