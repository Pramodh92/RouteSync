import React from 'react';
import { Users, Globe, Award, ShieldCheck, Heart, MapPin } from 'lucide-react';

export default function AboutUs() {
    const stats = [
        { label: 'Founded', value: '2020' },
        { label: 'Happy Travelers', value: '2M+' },
        { label: 'Countries Covered', value: '50+' },
        { label: 'Support 24/7', value: '98%' },
    ];

    const team = [
        { name: 'Arjun Sharma', role: 'CEO & Founder', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop' },
        { name: 'Priya Verma', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop' },
        { name: 'Rohan Gupta', role: 'Chief Technology Officer', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop' },
    ];

    return (
        <div className="min-h-screen bg-ivory pt-20">
            {/* Hero Section */}
            <div className="relative h-96 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=600&fit=crop" alt="About RouteSync" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-charcoal/60" />
                <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-display font-bold text-ivory mb-6">Redefining the <span className="text-orange">Way You Travel</span></h1>
                        <p className="text-sand/80 text-lg md:text-xl">RouteSync is your premium gateway to seamless travel experiences, combining luxury with efficiency.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16">
                {/* Mission & Vision */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-charcoal mb-6">Our Mission</h2>
                        <p className="text-warmgray text-lg leading-relaxed mb-6">
                            Our mission is to empower every traveler with the tools, confidence, and premium choices they need to explore the world. We believe that travel should be more than just moving from A to B — it should be an enriching journey filled with luxury, ease, and unforgettable moments.
                        </p>
                        <div className="space-y-4">
                            {[
                                { icon: ShieldCheck, text: 'Safety and security in every booking' },
                                { icon: Globe, text: 'Global reach with local expertise' },
                                { icon: Heart, text: 'Customer-first approach in everything we do' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange/10 rounded-xl flex items-center justify-center text-orange">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-charcoal">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card p-4 overflow-hidden shadow-2xl">
                        <img src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&h=600&fit=crop" alt="Mission" className="rounded-xl w-full h-full object-cover" />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                    {stats.map((stat, i) => (
                        <div key={i} className="card p-8 text-center bg-charcoal text-ivory border-none">
                            <p className="text-4xl font-display font-bold text-orange mb-2">{stat.value}</p>
                            <p className="text-sand/60 text-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Team */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-display font-bold text-charcoal mb-4">Meet the Visionaries</h2>
                    <p className="text-warmgray max-w-2xl mx-auto">The people behind RouteSync who make your dream journeys a reality.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {team.map((member, i) => (
                        <div key={i} className="card group overflow-hidden border-none shadow-xl transform transition-all duration-300 hover:-translate-y-2">
                            <div className="relative h-80">
                                <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-charcoal to-transparent">
                                    <h3 className="text-xl font-bold text-ivory">{member.name}</h3>
                                    <p className="text-orange text-sm font-medium">{member.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
