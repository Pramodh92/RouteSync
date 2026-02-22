import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Plane, Hotel, Train, Bus, Car, Package,
    Menu, X, User, ChevronDown, LogOut,
    LayoutDashboard, Briefcase, Tag, Wallet, Heart
} from 'lucide-react';

const navServices = [
    { icon: Plane, label: 'Flights', href: '/flights', color: 'text-orange' },
    { icon: Hotel, label: 'Hotels', href: '/hotels', color: 'text-gold' },
    { icon: Train, label: 'Trains', href: '/trains', color: 'text-olive' },
    { icon: Bus, label: 'Buses', href: '/buses', color: 'text-orange' },
    { icon: Car, label: 'Cabs', href: '/cabs', color: 'text-gold' },
    { icon: Package, label: 'Holidays', href: '/holidays', color: 'text-olive' },
];

const userMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Briefcase, label: 'My Trips', href: '/my-trips' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Wallet, label: 'Wallet', href: '/wallet' },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userDropdown, setUserDropdown] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        setUserDropdown(false);
        navigate('/');
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-charcoal shadow-lg' : 'bg-charcoal/95 backdrop-blur-sm'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange to-gold rounded-lg flex items-center justify-center">
                            <Plane className="w-4 h-4 text-white" fill="white" />
                        </div>
                        <span className="text-xl font-display font-bold text-ivory">
                            Route<span className="text-orange">Sync</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navServices.map(({ icon: Icon, label, href, color }) => (
                            <NavLink
                                key={href}
                                to={href}
                                className={({ isActive }) =>
                                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-orange/20 text-orange'
                                        : 'text-sand/80 hover:text-sand hover:bg-white/5'
                                    }`
                                }
                            >
                                <Icon className={`w-4 h-4 ${color}`} />
                                {label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-3">
                        <NavLink
                            to="/offers"
                            className={({ isActive }) =>
                                `flex items-center gap-1 text-sm font-medium transition-colors ${isActive ? 'text-orange' : 'text-sand/80 hover:text-gold'
                                }`
                            }
                        >
                            <Tag className="w-4 h-4" /> Offers
                        </NavLink>

                        <NavLink
                            to="/travel-guides"
                            className={({ isActive }) =>
                                `flex items-center gap-1 text-sm font-medium transition-colors ${isActive ? 'text-orange' : 'text-sand/80 hover:text-gold'
                                }`
                            }
                        >
                            <Heart className="w-4 h-4" /> Guides
                        </NavLink>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserDropdown(!userDropdown)}
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-sand px-3 py-2 rounded-xl transition-all"
                                >
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                                    ) : (
                                        <User className="w-4 h-4" />
                                    )}
                                    <span className="text-sm font-medium max-w-24 truncate">{user.name}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {userDropdown && (
                                    <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-card-hover border border-sand/30 overflow-hidden animate-slide-up">
                                        <div className="p-3 bg-gradient-to-br from-orange/10 to-gold/10 border-b border-sand/30">
                                            <p className="font-semibold text-charcoal text-sm">{user.name}</p>
                                            <p className="text-xs text-warmgray truncate">{user.email}</p>
                                        </div>
                                        {userMenuItems.map(({ icon: Icon, label, href }) => (
                                            <Link
                                                key={href}
                                                to={href}
                                                onClick={() => setUserDropdown(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-sm text-charcoal hover:bg-ivory transition-colors"
                                            >
                                                <Icon className="w-4 h-4 text-orange" />
                                                {label}
                                            </Link>
                                        ))}
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t border-sand/30 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="text-sm font-medium text-sand hover:text-orange transition-colors px-3 py-2">
                                    Sign In
                                </Link>
                                <Link to="/signup" className="btn-primary text-sm px-4 py-2">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden text-sand p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden bg-charcoal border-t border-white/10 animate-slide-up">
                    <div className="px-4 py-4 space-y-1">
                        {navServices.map(({ icon: Icon, label, href, color }) => (
                            <NavLink
                                key={href}
                                to={href}
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-orange/20 text-orange' : 'text-sand/80 hover:bg-white/5 hover:text-sand'
                                    }`
                                }
                            >
                                <Icon className={`w-5 h-5 ${color}`} />
                                {label}
                            </NavLink>
                        ))}
                        <NavLink
                            to="/offers"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sand/80 hover:bg-white/5"
                        >
                            <Tag className="w-5 h-5 text-gold" /> Offers
                        </NavLink>
                        <div className="pt-3 border-t border-white/10">
                            {user ? (
                                <>
                                    {userMenuItems.map(({ icon: Icon, label, href }) => (
                                        <Link
                                            key={href}
                                            to={href}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-sand/80 hover:bg-white/5"
                                        >
                                            <Icon className="w-5 h-5 text-orange" /> {label}
                                        </Link>
                                    ))}
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-900/20"
                                    >
                                        <LogOut className="w-5 h-5" /> Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-3 px-4">
                                    <Link to="/login" className="flex-1 text-center py-2.5 border border-orange/60 text-orange rounded-xl text-sm font-medium" onClick={() => setMobileOpen(false)}>Sign In</Link>
                                    <Link to="/signup" className="flex-1 text-center btn-primary text-sm" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Backdrop for dropdowns */}
            {userDropdown && (
                <div className="fixed inset-0 z-40" onClick={() => setUserDropdown(false)} />
            )}
        </nav>
    );
}
