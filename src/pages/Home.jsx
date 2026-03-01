import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import {
    Plane, Hotel, Train, Bus, Car, Package,
    MapPin, Calendar, Users, ArrowRight, Star,
    Quote, ChevronRight, TrendingUp, Zap, Shield, Clock
} from 'lucide-react';
import AISearchBar from '../components/ai/AISearchBar.jsx';

const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
];

const TABS = [
    { id: 'flights', icon: Plane, label: 'Flights' },
    { id: 'hotels', icon: Hotel, label: 'Hotels' },
    { id: 'trains', icon: Train, label: 'Trains' },
    { id: 'buses', icon: Bus, label: 'Buses' },
    { id: 'cabs', icon: Car, label: 'Cabs' },
    { id: 'holidays', icon: Package, label: 'Holidays' },
];

const TRENDING = [
    { name: 'Goa', label: 'Beach & Sun', img: 'https://images.unsplash.com/photo-1587922546307-776227941871?w=400&h=300&fit=crop', price: '₹2,999' },
    { name: 'Rajasthan', label: 'Heritage', img: 'https://s7ap1.scene7.com/is/image/incredibleindia/2-mehrangarh-fort-jodhpur-rajasthan-city-hero?qlt=82&ts=1726660925514', price: '₹3,499' },
    { name: 'Kerala', label: 'Backwaters', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop', price: '₹4,199' },
    { name: 'Shimla', label: 'Mountains', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=300&fit=crop', price: '₹3,799' },
    { name: 'Andaman', label: 'Islands', img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=400&h=300&fit=crop', price: '₹6,499' },
    { name: 'Manali', label: 'Snow & Trek', img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop', price: '₹4,899' },
];

const TESTIMONIALS = [
    { name: 'Priya Sharma', location: 'Mumbai', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', text: 'RouteSync made planning our Rajasthan trip effortless. The hotel suggestions were spot-on and the booking process was seamless!', rating: 5 },
    { name: 'Arjun Patel', location: 'Delhi', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', text: 'Best travel platform I\'ve used. Got amazing deals on flights to Goa and the entire family trip was perfectly organized.', rating: 5 },
    { name: 'Sneha Reddy', location: 'Bangalore', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop', text: 'The Kerala backwaters package was an absolute dream. Every detail was taken care of. 10/10 would book again!', rating: 5 },
];

const POPULAR_HOTELS = [
    { name: 'The Grand Marigold Palace', city: 'Jaipur', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop', rating: 5, price: '₹8,500' },
    { name: 'Serenity Beach Resort', city: 'Goa', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=250&fit=crop', rating: 4.5, price: '₹6,200' },
    { name: 'Backwater Bliss Kerala', city: 'Alleppey', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop', rating: 4.8, price: '₹7,800' },
    { name: 'Udaipur Lake Palace View', city: 'Udaipur', img: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=250&fit=crop', rating: 4.9, price: '₹9,500' },
];

function SearchPanel({ activeTab }) {
    const navigate = useNavigate();
    const { updateSearch } = useBooking();
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');
    const [city, setCity] = useState('');
    const [passengers, setPassengers] = useState(1);

    const handleSearch = () => {
        if (activeTab === 'flights') {
            updateSearch({ type: 'flights', from, to, departureDate: date });
            navigate('/flights/results');
        } else if (activeTab === 'hotels') {
            updateSearch({ type: 'hotels', to: city, departureDate: date });
            navigate('/hotels/listing');
        } else if (activeTab === 'trains') {
            updateSearch({ type: 'trains', from, to, departureDate: date });
            navigate('/trains/results');
        } else if (activeTab === 'buses') {
            updateSearch({ type: 'buses', from, to, departureDate: date });
            navigate('/buses/results');
        } else if (activeTab === 'cabs') {
            navigate('/cabs');
        } else if (activeTab === 'holidays') {
            navigate('/holidays');
        }
    };

    if (activeTab === 'hotels') {
        return (
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                    <input className="input-field pl-10" placeholder="City or Hotel Name" value={city} onChange={e => setCity(e.target.value)} />
                </div>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                    <input type="date" className="input-field pl-10 w-full sm:w-44" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                    <select className="input-field pl-10 w-full sm:w-40" value={passengers} onChange={e => setPassengers(e.target.value)}>
                        {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                    </select>
                </div>
                <button onClick={handleSearch} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                    Search <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    if (activeTab === 'cabs' || activeTab === 'holidays') {
        return (
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                    <input className="input-field pl-10" placeholder={activeTab === 'cabs' ? 'Pickup Location' : 'Destination'} />
                </div>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                    <input type="date" className="input-field pl-10 w-full sm:w-44" />
                </div>
                <button onClick={handleSearch} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                    Explore <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                <input className="input-field pl-10" placeholder="From City" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                <input className="input-field pl-10" placeholder="To City" value={to} onChange={e => setTo(e.target.value)} />
            </div>
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                <input type="date" className="input-field pl-10 w-full sm:w-44" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                <select className="input-field pl-10 w-full sm:w-36" value={passengers} onChange={e => setPassengers(e.target.value)}>
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>)}
                </select>
            </div>
            <button onClick={handleSearch} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                Search <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function Home() {
    const [heroIdx, setHeroIdx] = useState(0);
    const [activeTab, setActiveTab] = useState('flights');

    useEffect(() => {
        const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMAGES.length), 5000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="bg-ivory">
            {/* ── Hero ── */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {HERO_IMAGES.map((img, i) => (
                    <div
                        key={img}
                        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${i === heroIdx ? 'opacity-100' : 'opacity-0'}`}
                        style={{ backgroundImage: `url(${img})` }}
                    />
                ))}
                <div className="absolute inset-0 hero-overlay" />

                <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center pt-24 pb-10">
                    <div className="animate-slide-up">
                        <span className="inline-flex items-center gap-2 bg-orange/20 backdrop-blur-sm border border-orange/30 text-orange px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                            <Zap className="w-3.5 h-3.5" /> India's Premium Travel Platform
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-ivory leading-tight text-shadow-lg mb-4">
                            Discover Your Next<br />
                            <span className="text-gradient">Perfect Journey</span>
                        </h1>
                        <p className="text-sand/80 text-lg sm:text-xl mb-10 max-w-2xl mx-auto text-shadow">
                            Search, compare, and book flights, hotels, trains, buses, cabs and curated holiday packages — all in one place.
                        </p>

                        {/* Search Card */}
                        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-5 text-left">
                            {/* Tabs */}
                            <div className="flex flex-wrap gap-1 mb-5 pb-4 border-b border-sand/50">
                                {TABS.map(({ id, icon: Icon, label }) => (
                                    <button
                                        key={id}
                                        onClick={() => setActiveTab(id)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === id
                                            ? 'bg-orange text-white shadow-orange'
                                            : 'text-olive hover:bg-sand/40'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <SearchPanel activeTab={activeTab} />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-10">
                        {[
                            { label: 'Happy Travelers', value: '2M+' },
                            { label: 'Destinations', value: '500+' },
                            { label: 'Hotels Listed', value: '50K+' },
                            { label: 'Daily Flights', value: '800+' },
                        ].map(({ label, value }) => (
                            <div key={label} className="text-center">
                                <div className="text-2xl sm:text-3xl font-display font-bold text-orange text-shadow">{value}</div>
                                <div className="text-sand/70 text-sm">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── AI Search + Mood Filters ── */}
            <section className="section-padding bg-gradient-to-br from-charcoal to-charcoal/95">
                <div className="container-max">
                    <div className="text-center mb-8">
                        <span className="inline-flex items-center gap-2 bg-orange/20 border border-orange/30 text-orange px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                            <Zap className="w-3.5 h-3.5" /> AI-Powered Search
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-display font-bold text-ivory mb-3">
                            Search in <span className="text-orange">Plain English</span>
                        </h2>
                        <p className="text-sand/70 max-w-xl mx-auto">Just describe what you want — our AI understands you.</p>
                    </div>
                    <div className="max-w-3xl mx-auto">
                        <AISearchBar />
                    </div>

                    {/* Mood tiles */}
                    <div className="mt-10">
                        <p className="text-center text-sand/60 text-sm mb-5">Or pick a travel mood →</p>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto">
                            {[
                                { mood: 'Relaxing', emoji: '🌅', desc: 'Beach & Spa', color: 'from-blue-800 to-blue-600' },
                                { mood: 'Adventure', emoji: '🏔️', desc: 'Trek & Wild', color: 'from-green-800 to-green-600' },
                                { mood: 'Romantic', emoji: '💑', desc: 'Couples', color: 'from-pink-800 to-pink-600' },
                                { mood: 'Family', emoji: '👨‍👩‍👧‍👦', desc: 'Kids & Fun', color: 'from-yellow-700 to-yellow-500' },
                                { mood: 'Solo', emoji: '🎒', desc: 'Budget & Free', color: 'from-orange/80 to-orange' },
                            ].map(({ mood, emoji, desc, color }) => (
                                <Link key={mood} to={`/holidays?mood=${mood.toLowerCase()}`}
                                    className={`group bg-gradient-to-br ${color} rounded-2xl p-4 text-center cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg`}>
                                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{emoji}</div>
                                    <p className="text-white font-semibold text-sm">{mood}</p>
                                    <p className="text-white/70 text-xs">{desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* AI Feature links */}
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                        {[
                            { to: '/trip-planner', emoji: '🗺️', label: 'AI Trip Planner' },
                            { to: '/budget', emoji: '🎯', label: 'Budget Optimizer' },
                            { to: '/travel-buddies', emoji: '🤝', label: 'Travel Buddy' },
                        ].map(({ to, emoji, label }) => (
                            <Link key={to} to={to} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-sand px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
                                <span>{emoji}</span> {label}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Why RouteSync ── */}
            <section className="section-padding bg-cream">
                <div className="container-max">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal mb-3">
                            Why Choose <span className="text-gradient">RouteSync</span>?
                        </h2>
                        <p className="text-warmgray max-w-xl mx-auto">We make travel planning effortless, affordable, and memorable.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Zap, title: 'Instant Booking', desc: 'Confirm your flights, hotels and packages in under 2 minutes.', color: 'bg-orange/10 text-orange' },
                            { icon: Shield, title: 'Secure & Trusted', desc: '100% safe transactions with end-to-end encryption and buyer protection.', color: 'bg-gold/10 text-gold-dark' },
                            { icon: TrendingUp, title: 'Best Prices', desc: 'We compare hundreds of options to always get you the best deal.', color: 'bg-olive/10 text-olive-dark' },
                            { icon: Clock, title: '24/7 Support', desc: 'Round-the-clock expert travel support whenever you need us.', color: 'bg-orange/10 text-orange' },
                        ].map(({ icon: Icon, title, desc, color }) => (
                            <div key={title} className="card p-6 text-center hover:-translate-y-1 transition-transform duration-300">
                                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4`}>
                                    <Icon className="w-7 h-7" />
                                </div>
                                <h3 className="font-semibold text-charcoal mb-2">{title}</h3>
                                <p className="text-warmgray text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Trending Destinations ── */}
            <section className="section-padding">
                <div className="container-max">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal">
                                Trending <span className="text-gradient">Destinations</span>
                            </h2>
                            <p className="text-warmgray mt-1">Explore India's most sought-after getaways</p>
                        </div>
                        <Link to="/holidays" className="hidden sm:flex items-center gap-1 text-orange font-medium hover:gap-2 transition-all">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                        {TRENDING.map(({ name, label, img, price }) => (
                            <Link key={name} to="/holidays" className="group relative rounded-2xl overflow-hidden aspect-[4/3] block">
                                <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-4">
                                    <p className="text-ivory font-semibold text-lg leading-tight">{name}</p>
                                    <div className="flex items-center justify-between gap-4 mt-1">
                                        <span className="text-sand/80 text-sm">{label}</span>
                                        <span className="text-orange font-bold text-sm">From {price}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Deals Banner ── */}
            <section className="section-padding bg-gradient-to-r from-charcoal via-[#2D1A00] to-charcoal">
                <div className="container-max">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl sm:text-4xl font-display font-bold text-ivory">
                            Exclusive <span className="text-orange">Deals & Offers</span>
                        </h2>
                        <p className="text-sand/70 mt-2">Limited time savings just for you</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            { code: 'FLYNOW30', title: 'Fly Smarter, Pay Less', desc: '30% off on domestic flights this weekend', cat: 'Flights', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop' },
                            { code: 'STAY2000', title: 'Hotel Staycation Deal', desc: 'Up to ₹2000 off on 2+ night hotel stays', cat: 'Hotels', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop' },
                            { code: 'HOLIDAY25', title: 'Package Bonanza', desc: 'Save 25% on any 5-day holiday package', cat: 'Holidays', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=200&fit=crop' },
                        ].map(({ code, title, desc, cat, img }) => (
                            <div key={code} className="relative rounded-2xl overflow-hidden group cursor-pointer">
                                <img src={img} alt={title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-charcoal/70" />
                                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                                    <span className="tag-orange self-start">{cat}</span>
                                    <div>
                                        <h3 className="text-ivory font-semibold text-lg">{title}</h3>
                                        <p className="text-sand/70 text-sm mt-0.5">{desc}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="bg-orange/20 border border-orange/40 text-orange text-xs font-bold px-3 py-1 rounded-lg tracking-wider">{code}</span>
                                            <Link to="/offers" className="text-orange text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                                                Grab Deal <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link to="/offers" className="btn-secondary inline-flex items-center gap-2 border-orange/60 text-orange hover:bg-orange hover:text-white">
                            View All Offers <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Popular Hotels ── */}
            <section className="section-padding bg-cream">
                <div className="container-max">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal">
                                Popular <span className="text-gradient">Hotels</span>
                            </h2>
                            <p className="text-warmgray mt-1">Handpicked stays for every occasion</p>
                        </div>
                        <Link to="/hotels" className="hidden sm:flex items-center gap-1 text-orange font-medium hover:gap-2 transition-all">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {POPULAR_HOTELS.map(({ name, city, img, rating, price }) => (
                            <Link key={name} to="/hotels/listing" className="card group">
                                <div className="relative overflow-hidden rounded-t-2xl">
                                    <img src={img} alt={name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-400" />
                                    <span className="absolute top-3 left-3 bg-gold text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                                        <Star className="w-3 h-3" fill="white" /> {rating}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-charcoal text-sm leading-snug">{name}</h3>
                                    <div className="flex items-center gap-1 mt-1 mb-3">
                                        <MapPin className="w-3 h-3 text-warmgray" />
                                        <span className="text-warmgray text-xs">{city}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-orange font-bold">{price}</span>
                                            <span className="text-warmgray text-xs">/night</span>
                                        </div>
                                        <span className="text-orange text-xs font-medium flex items-center gap-0.5">Book <ChevronRight className="w-3.5 h-3.5" /></span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="section-padding">
                <div className="container-max">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal">
                            Loved by <span className="text-gradient">Travelers</span>
                        </h2>
                        <p className="text-warmgray mt-2">Real stories from our happy customers</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map(({ name, location, avatar, text, rating }) => (
                            <div key={name} className="card p-6 hover:-translate-y-1 transition-transform duration-300">
                                <Quote className="w-8 h-8 text-orange/30 mb-3" />
                                <p className="text-charcoal/80 text-sm leading-relaxed mb-5">{text}</p>
                                <div className="flex items-center gap-3">
                                    <img src={avatar} alt={name} className="w-11 h-11 rounded-full object-cover ring-2 ring-orange/20" />
                                    <div>
                                        <p className="font-semibold text-charcoal text-sm">{name}</p>
                                        <p className="text-warmgray text-xs">{location}</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-0.5">
                                        {[...Array(rating)].map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 text-gold" fill="#C9A227" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── App Download CTA ── */}
            <section className="section-padding bg-gradient-to-br from-charcoal via-[#2D1A00] to-charcoal overflow-hidden">
                <div className="container-max">
                    <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="text-center lg:text-left max-w-lg">
                            <span className="tag-orange mb-4">Coming Soon</span>
                            <h2 className="text-3xl sm:text-4xl font-display font-bold text-ivory mb-4">
                                Take RouteSync<br />Everywhere You Go
                            </h2>
                            <p className="text-sand/70 leading-relaxed mb-6">
                                Download our app for exclusive mobile deals, real-time flight tracking, and seamless trip management on the go.
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-sand px-5 py-3 rounded-xl transition-all">
                                    <span className="text-2xl">🍎</span>
                                    <div className="text-left"><div className="text-xs">Download on the</div><div className="font-semibold">App Store</div></div>
                                </button>
                                <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-sand px-5 py-3 rounded-xl transition-all">
                                    <span className="text-2xl">▶️</span>
                                    <div className="text-left"><div className="text-xs">Get it on</div><div className="font-semibold">Google Play</div></div>
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="w-64 h-64 bg-orange/10 rounded-full flex items-center justify-center">
                                <div className="w-48 h-48 bg-orange/20 rounded-full flex items-center justify-center animate-float">
                                    <span className="text-7xl">✈️</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
