import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Instagram, Twitter, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
    Services: [
        { label: 'Flights', href: '/flights' },
        { label: 'Hotels', href: '/hotels' },
        { label: 'Trains', href: '/trains' },
        { label: 'Buses', href: '/buses' },
        { label: 'Cabs', href: '/cabs' },
        { label: 'Holiday Packages', href: '/holidays' },
    ],
    Company: [
        { label: 'About Us', href: '/about-us' },
        { label: 'Contact Us', href: '/contact-us' },
        { label: 'Travel Guides', href: '/travel-guides' },
        { label: 'Offers', href: '/offers' },
        { label: 'Support', href: '/support' },
    ],
    Legal: [
        { label: 'Terms & Conditions', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Cookie Policy', href: '/support' },
        { label: 'Cancellation Policy', href: '/support' },
    ],
};

const socials = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Youtube, href: '#', label: 'YouTube' },
];

export default function Footer() {
    return (
        <footer className="bg-charcoal text-sand">
            {/* Newsletter */}
            <div className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-serif font-semibold text-ivory">Get Exclusive Travel Deals</h3>
                        <p className="text-sand/60 text-sm mt-1">Subscribe for curated offers and travel inspiration.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="flex-1 md:w-72 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-sand placeholder-sand/40 focus:outline-none focus:border-orange transition-colors"
                        />
                        <button className="btn-primary whitespace-nowrap">Subscribe</button>
                    </div>
                </div>
            </div>

            {/* Main footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-orange to-gold rounded-xl flex items-center justify-center">
                                <Plane className="w-5 h-5 text-white" fill="white" />
                            </div>
                            <span className="text-2xl font-display font-bold text-ivory">
                                Route<span className="text-orange">Sync</span>
                            </span>
                        </Link>
                        <p className="text-sand/60 text-sm leading-relaxed mb-5 max-w-xs">
                            Your trusted travel companion for flights, hotels, trains, and unforgettable holiday experiences across India and beyond.
                        </p>
                        {/* Contact */}
                        <div className="space-y-2 text-sm text-sand/60">
                            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-orange" /><span>support@routesync.in</span></div>
                            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-orange" /><span>1800-123-4567 (Toll Free)</span></div>
                            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange" /><span>Mumbai, Maharashtra, India</span></div>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([cat, links]) => (
                        <div key={cat}>
                            <h4 className="text-ivory font-semibold mb-4 text-sm uppercase tracking-wider">{cat}</h4>
                            <ul className="space-y-2">
                                {links.map(({ label, href }) => (
                                    <li key={label}>
                                        <Link
                                            to={href}
                                            className="text-sand/60 hover:text-orange text-sm transition-colors"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sand/40 text-sm">
                        © {new Date().getFullYear()} RouteSync. All rights reserved. Made with ♥ in India.
                    </p>
                    <div className="flex items-center gap-4">
                        {socials.map(({ icon: Icon, href, label }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-orange/20 hover:text-orange text-sand/60 flex items-center justify-center transition-all"
                            >
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
