import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { Plane, Hotel, Train, Bus, Car, Package, Wallet, ChevronRight, TrendingUp, Gift } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const { bookings } = useBooking();
    const navigate = useNavigate();

    const recentBookings = bookings.slice(-3).reverse();

    const quickLinks = [
        { icon: Plane, label: 'Flights', href: '/flights', color: 'bg-orange/10 text-orange' },
        { icon: Hotel, label: 'Hotels', href: '/hotels', color: 'bg-gold/10 text-gold' },
        { icon: Train, label: 'Trains', href: '/trains', color: 'bg-olive/10 text-olive' },
        { icon: Bus, label: 'Buses', href: '/buses', color: 'bg-sand text-charcoal' },
        { icon: Car, label: 'Cabs', href: '/cabs', color: 'bg-orange/10 text-orange' },
        { icon: Package, label: 'Holidays', href: '/holidays', color: 'bg-gold/10 text-gold' },
    ];

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Welcome banner */}
                <div className="relative overflow-hidden rounded-3xl bg-charcoal p-8 mb-8">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold rounded-full blur-3xl" />
                    </div>
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-ivory">Hello, {user?.name?.split(' ')[0] || 'Traveler'}! 👋</h1>
                            <p className="text-sand/70 mt-1">Ready for your next adventure?</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sand/60 text-xs">Wallet Balance</p>
                                <p className="text-2xl font-bold text-orange">₹{(user?.walletBalance || 0).toLocaleString()}</p>
                            </div>
                            <Link to="/wallet" className="w-12 h-12 bg-orange/20 rounded-2xl flex items-center justify-center text-orange hover:bg-orange/30 transition-colors">
                                <Wallet className="w-6 h-6" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stats */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick links */}
                        <div className="card p-6">
                            <h2 className="font-display font-semibold text-charcoal text-lg mb-4">Quick Book</h2>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                {quickLinks.map(({ icon: Icon, label, href, color }) => (
                                    <Link key={label} to={href} className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-sand/30 transition-colors group">
                                        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-medium text-charcoal">{label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recent bookings */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-display font-semibold text-charcoal text-lg">Recent Bookings</h2>
                                <Link to="/my-trips" className="text-orange text-sm font-medium hover:underline flex items-center gap-1">
                                    View All <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                            {recentBookings.length === 0 ? (
                                <div className="text-center py-8">
                                    <Plane className="w-10 h-10 text-sand mx-auto mb-3" />
                                    <p className="text-warmgray">No bookings yet. Start exploring!</p>
                                    <Link to="/flights" className="btn-primary text-sm mt-3 inline-flex items-center gap-1"><Plane className="w-4 h-4" /> Book Now</Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentBookings.map(b => (
                                        <div key={b.id} className="flex items-center gap-4 p-3 rounded-xl bg-ivory hover:bg-sand/20 transition-colors">
                                            <div className="w-10 h-10 bg-orange/10 rounded-xl flex items-center justify-center">
                                                <Plane className="w-5 h-5 text-orange" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-charcoal text-sm truncate capitalize">{b.type} booking</p>
                                                <p className="text-warmgray text-xs">{b.id} · {new Date(b.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-charcoal text-sm">₹{b.totalAmount?.toLocaleString()}</p>
                                                <span className={`text-xs font-medium ${b.status === 'confirmed' ? 'text-green-500' : b.status === 'cancelled' ? 'text-red-500' : 'text-warmgray'}`}>
                                                    {b.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-5">
                        {/* Profile card */}
                        <div className="card p-5">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-orange text-white rounded-2xl flex items-center justify-center text-xl font-bold">
                                    {user?.name?.[0] || 'U'}
                                </div>
                                <div>
                                    <p className="font-bold text-charcoal">{user?.name || 'User'}</p>
                                    <p className="text-warmgray text-sm">{user?.email}</p>
                                </div>
                            </div>
                            <Link to="/profile" className="btn-secondary text-sm w-full text-center block">Edit Profile</Link>
                        </div>

                        {/* Offers teaser */}
                        <div className="card p-5 bg-gradient-to-br from-orange to-orange-dark text-white">
                            <Gift className="w-8 h-8 mb-3 opacity-80" />
                            <h3 className="font-bold text-lg mb-1">Exclusive Offers</h3>
                            <p className="text-white/80 text-sm mb-4">Upto 50% off on selected packages</p>
                            <Link to="/offers" className="bg-white text-orange text-sm font-bold px-4 py-2 rounded-xl hover:bg-sand transition-colors inline-block">
                                View Offers
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="card p-5">
                            <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-orange" /> Your Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between"><span className="text-warmgray text-sm">Total Bookings</span><span className="font-bold text-charcoal">{bookings.length}</span></div>
                                <div className="flex justify-between"><span className="text-warmgray text-sm">Total Spent</span><span className="font-bold text-orange">₹{bookings.reduce((s, b) => s + (b.totalAmount || 0), 0).toLocaleString()}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
