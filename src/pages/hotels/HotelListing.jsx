import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Wifi, Waves, Dumbbell, Coffee, Filter } from 'lucide-react';
import Loader from '../../components/ui/Loader';

const AMENITY_ICONS = { WiFi: Wifi, Pool: Waves, Gym: Dumbbell, Restaurant: Coffee };

export default function HotelListing() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [maxPrice, setMaxPrice] = useState(15000);
    const [catFilter, setCatFilter] = useState('all');

    useEffect(() => {
        fetch('/data/hotels.json').then(r => r.json()).then(d => { setHotels(d); setLoading(false); });
    }, []);

    const filtered = hotels
        .filter(h => catFilter === 'all' || h.category === catFilter)
        .filter(h => h.pricePerNight <= maxPrice);

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="bg-charcoal text-sand py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-display font-bold text-ivory">Hotels Available</h1>
                    <p className="text-sand/60 mt-1">{filtered.length} properties found</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filters */}
                    <aside className="lg:w-64 shrink-0">
                        <div className="card p-5 sticky top-24">
                            <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2"><Filter className="w-4 h-4 text-orange" /> Filters</h3>
                            <div className="mb-5">
                                <p className="text-sm font-medium text-charcoal mb-3">Category</p>
                                <div className="space-y-2">
                                    {['all', 'Luxury', 'Resort', 'Heritage', 'Business'].map(c => (
                                        <label key={c} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="cat" checked={catFilter === c} onChange={() => setCatFilter(c)} className="accent-orange" />
                                            <span className="text-sm text-charcoal capitalize">{c === 'all' ? 'All Categories' : c}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-charcoal mb-3">Max Price/Night: <span className="text-orange">₹{maxPrice.toLocaleString()}</span></p>
                                <input type="range" min={3000} max={15000} step={500} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} className="w-full accent-orange" />
                            </div>
                        </div>
                    </aside>

                    {/* Hotel Grid */}
                    <div className="flex-1">
                        {loading ? <div className="flex justify-center py-20"><Loader size="lg" /></div> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {filtered.map(hotel => (
                                    <Link key={hotel.id} to={`/hotels/${hotel.id}`} className="card group hover:-translate-y-1 transition-transform duration-300 flex flex-col">
                                        <div className="relative overflow-hidden rounded-t-2xl">
                                            <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-400" />
                                            <span className="absolute top-3 left-3 bg-gold text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                                                <Star className="w-3 h-3" fill="white" /> {hotel.rating}
                                            </span>
                                            <span className="absolute top-3 right-3 tag bg-charcoal/80 text-sand text-xs">{hotel.category}</span>
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <h3 className="font-semibold text-charcoal mb-1">{hotel.name}</h3>
                                            <div className="flex items-center gap-1 mb-2">
                                                <MapPin className="w-3 h-3 text-warmgray" />
                                                <span className="text-warmgray text-xs">{hotel.city}, {hotel.state}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {hotel.amenities.slice(0, 4).map(a => (
                                                    <span key={a} className="tag-olive text-xs">{a}</span>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between mt-auto">
                                                <div>
                                                    <span className="text-orange font-bold text-lg">₹{hotel.pricePerNight.toLocaleString()}</span>
                                                    <span className="text-warmgray text-xs">/night</span>
                                                    <p className="text-warmgray text-xs line-through">₹{hotel.originalPrice.toLocaleString()}</p>
                                                </div>
                                                <span className="text-xs text-warmgray">{hotel.reviews.toLocaleString()} reviews</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
