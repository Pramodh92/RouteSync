import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import {
    Plane, Clock, Wifi, Coffee, Monitor, Zap,
    ArrowRight, Filter, ChevronDown, Star, ArrowUpDown
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

function FlightCard({ flight, onBook }) {
    const stops = flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop`;
    return (
        <div className="card p-5 hover:-translate-y-0.5 transition-all duration-300 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Airline */}
                <div className="flex items-center gap-3 min-w-36">
                    <div className="w-10 h-10 rounded-xl bg-sand/40 flex items-center justify-center">
                        <Plane className="w-5 h-5 text-orange" />
                    </div>
                    <div>
                        <p className="font-semibold text-charcoal text-sm">{flight.airline}</p>
                        <p className="text-warmgray text-xs">{flight.airlineCode} {flight.id.slice(2)}</p>
                    </div>
                </div>

                {/* Route */}
                <div className="flex-1 flex items-center gap-4 sm:gap-8">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-charcoal">{flight.departureTime}</p>
                        <p className="text-warmgray text-sm font-medium">{flight.fromCode}</p>
                        <p className="text-warmgray text-xs">{flight.from}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-0.5">
                        <p className="text-warmgray text-xs">{flight.duration}</p>
                        <div className="flex items-center w-full gap-1">
                            <div className="flex-1 h-px bg-sand" />
                            <Plane className="w-4 h-4 text-orange rotate-90" />
                            <div className="flex-1 h-px bg-sand" />
                        </div>
                        <span className={`text-xs font-medium ${flight.stops === 0 ? 'text-olive' : 'text-orange'}`}>{stops}</span>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-charcoal">{flight.arrivalTime}</p>
                        <p className="text-warmgray text-sm font-medium">{flight.toCode}</p>
                        <p className="text-warmgray text-xs">{flight.to}</p>
                    </div>
                </div>

                {/* Amenities */}
                <div className="hidden lg:flex items-center gap-2">
                    {flight.amenities?.slice(0, 3).map(a => (
                        <span key={a} className="tag-olive text-xs">{a}</span>
                    ))}
                </div>

                {/* Price & Book */}
                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 ml-auto">
                    <div className="text-right">
                        <p className="text-2xl font-bold text-charcoal">₹{flight.price.toLocaleString()}</p>
                        <p className="text-warmgray text-xs">{flight.class} · {flight.seats} seats left</p>
                    </div>
                    <button onClick={() => onBook(flight)} className="btn-primary text-sm px-5 py-2.5">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function FlightResults() {
    const { searchData, startBooking } = useBooking();
    const navigate = useNavigate();
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('price');
    const [maxPrice, setMaxPrice] = useState(15000);
    const [stopsFilter, setStopsFilter] = useState('all');

    useEffect(() => {
        fetch('/data/flights.json')
            .then(r => r.json())
            .then(data => { setFlights(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtered = flights
        .filter(f => stopsFilter === 'all' || (stopsFilter === 'nonstop' && f.stops === 0))
        .filter(f => f.price <= maxPrice)
        .sort((a, b) => sortBy === 'price' ? a.price - b.price : a.duration.localeCompare(b.duration));

    const handleBook = (flight) => {
        startBooking(flight, 'flights');
        navigate(`/flights/book/${flight.id}`);
    };

    return (
        <div className="min-h-screen bg-ivory pt-20">
            {/* Header */}
            <div className="bg-charcoal text-sand py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-display font-bold text-ivory mb-1">
                        {searchData.from || 'Any'} → {searchData.to || 'Any'}
                    </h1>
                    <p className="text-sand/60">
                        {searchData.departureDate || 'Flexible dates'} · {searchData.passengers?.adults || 1} Passenger(s)
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filters */}
                    <aside className="lg:w-64 shrink-0">
                        <div className="card p-5 sticky top-24">
                            <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
                                <Filter className="w-4 h-4 text-orange" /> Filters
                            </h3>

                            {/* Stops */}
                            <div className="mb-5">
                                <p className="text-sm font-medium text-charcoal mb-3">Stops</p>
                                <div className="space-y-2">
                                    {[['all', 'Any'], ['nonstop', 'Non-stop only']].map(([val, lab]) => (
                                        <label key={val} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="stops" value={val} checked={stopsFilter === val} onChange={() => setStopsFilter(val)}
                                                className="accent-orange" />
                                            <span className="text-sm text-charcoal">{lab}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-5">
                                <p className="text-sm font-medium text-charcoal mb-3">Max Price: <span className="text-orange">₹{maxPrice.toLocaleString()}</span></p>
                                <input type="range" min={1000} max={15000} step={500} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)}
                                    className="w-full accent-orange" />
                                <div className="flex justify-between text-xs text-warmgray mt-1"><span>₹1,000</span><span>₹15,000</span></div>
                            </div>

                            {/* Sort */}
                            <div>
                                <p className="text-sm font-medium text-charcoal mb-3">Sort By</p>
                                <div className="space-y-2">
                                    {[['price', 'Cheapest First'], ['duration', 'Shortest Duration']].map(([val, lab]) => (
                                        <label key={val} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="sort" value={val} checked={sortBy === val} onChange={() => setSortBy(val)}
                                                className="accent-orange" />
                                            <span className="text-sm text-charcoal">{lab}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Results */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-charcoal font-medium">
                                <span className="text-orange font-bold">{filtered.length}</span> flights found
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20"><Loader size="lg" /></div>
                        ) : filtered.length === 0 ? (
                            <div className="card p-12 text-center">
                                <Plane className="w-12 h-12 text-sand mx-auto mb-4" />
                                <p className="text-charcoal font-semibold text-lg">No flights found</p>
                                <p className="text-warmgray text-sm mt-1">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filtered.map(f => <FlightCard key={f.id} flight={f} onBook={handleBook} />)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
