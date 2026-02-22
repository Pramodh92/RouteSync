import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Clock, ArrowRight, Filter } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import Loader from '../../components/ui/Loader';

export default function TrainResults() {
    const { searchData, startBooking } = useBooking();
    const navigate = useNavigate();
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [classFilter, setClassFilter] = useState('all');

    useEffect(() => {
        fetch('/data/trains.json').then(r => r.json()).then(d => { setTrains(d); setLoading(false); });
    }, []);

    const handleBook = (train, cls) => {
        startBooking({ ...train, price: cls.price, selectedClass: cls }, 'trains');
        navigate(`/trains/book/${train.id}`);
    };

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="bg-charcoal text-sand py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-2xl font-display font-bold text-ivory">{searchData.from || 'Origin'} → {searchData.to || 'Destination'}</h1>
                    <p className="text-sand/60 mt-1">{trains.length} trains found</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <Filter className="w-4 h-4 text-orange" />
                    <span className="text-sm font-medium text-charcoal">Class:</span>
                    {['all', '1A', '2A', '3A', 'SL', 'CC', 'EC'].map(c => (
                        <button key={c} onClick={() => setClassFilter(c)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${classFilter === c ? 'bg-orange text-white' : 'bg-sand/40 text-charcoal hover:bg-sand'}`}>
                            {c === 'all' ? 'All Classes' : c}
                        </button>
                    ))}
                </div>

                {loading ? <div className="flex justify-center py-20"><Loader size="lg" /></div> : (
                    <div className="space-y-5">
                        {trains.map(train => (
                            <div key={train.id} className="card p-5 animate-fade-in">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-charcoal text-lg">{train.name}</h3>
                                        <p className="text-warmgray text-sm">Train #{train.number}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-warmgray text-sm">
                                        <Clock className="w-4 h-4" />
                                        <span>{train.duration}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mb-4">
                                    <div>
                                        <p className="text-xl font-bold text-charcoal">{train.departure}</p>
                                        <p className="text-warmgray text-sm">{train.from}</p>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center">
                                        <div className="flex items-center w-full gap-2">
                                            <div className="flex-1 h-px bg-sand" />
                                            <Train className="w-4 h-4 text-orange" />
                                            <div className="flex-1 h-px bg-sand" />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-charcoal">{train.arrival}</p>
                                        <p className="text-warmgray text-sm">{train.to}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 border-t border-sand pt-4">
                                    {train.classes
                                        .filter(c => classFilter === 'all' || c.type === classFilter)
                                        .map(cls => (
                                            <div key={cls.type} className="flex items-center justify-between flex-1 min-w-40 bg-ivory rounded-xl px-4 py-3 border border-sand">
                                                <div>
                                                    <p className="font-semibold text-charcoal text-sm">{cls.type}</p>
                                                    <p className="text-warmgray text-xs">{cls.name}</p>
                                                    <p className="text-xs text-olive mt-0.5">{cls.available} seats</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-orange">₹{cls.price.toLocaleString()}</p>
                                                    <button onClick={() => handleBook(train, cls)}
                                                        className="text-xs text-orange font-medium flex items-center gap-0.5 mt-1 hover:gap-1 transition-all">
                                                        Book <ArrowRight className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
