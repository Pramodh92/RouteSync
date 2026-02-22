import React, { useState } from 'react';
import { Search, BookOpen, MessageCircle, HelpCircle, Package, CreditCard, User, ShieldCheck, ChevronRight } from 'lucide-react';

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { icon: BookOpen, title: 'Getting Started', desc: 'New to RouteSync? Start here.', count: 5 },
        { icon: Package, title: 'Bookings', desc: 'Managing trips and modifications.', count: 12 },
        { icon: CreditCard, title: 'Payments & Refunds', desc: 'Secure payments and refund processes.', count: 8 },
        { icon: User, title: 'Account Settings', desc: 'Manage your profile and security.', count: 6 },
        { icon: ShieldCheck, title: 'Travel Safety', desc: 'Guidelines for a safe journey.', count: 10 },
        { icon: HelpCircle, title: 'General FAQs', desc: 'Common questions answered.', count: 15 },
    ];

    const popularFaqs = [
        'How do I cancel my booking?',
        'What is the refund policy for flights?',
        'Can I change my hotel dates after booking?',
        'How do I use RouteSync coins?',
        'Is insurance included in holiday packages?',
    ];

    return (
        <div className="min-h-screen bg-ivory pt-20">
            {/* Hero Search */}
            <div className="bg-charcoal text-ivory py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">How can we <span className="text-orange">help you?</span></h1>
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-warmgray" />
                        <input
                            className="w-full bg-white text-charcoal rounded-2xl py-5 pl-14 pr-6 text-lg focus:ring-2 focus:ring-orange/50 outline-none shadow-glass"
                            placeholder="Search for articles, topics, or FAQs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                        <span className="text-sand/50 text-sm">Popular:</span>
                        {['Refunds', 'Cancellations', 'PNR Status'].map(tag => (
                            <button key={tag} className="text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors">
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16">
                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                    {categories.map((cat, i) => (
                        <div key={i} className="card p-6 hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                            <div className="w-12 h-12 bg-sand/30 text-orange rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange group-hover:text-white transition-colors">
                                <cat.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-charcoal mb-2">{cat.title}</h3>
                            <p className="text-warmgray text-sm mb-4">{cat.desc}</p>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-xs font-semibold text-orange uppercase tracking-wider">{cat.count} Articles</span>
                                <ChevronRight className="w-4 h-4 text-warmgray group-hover:text-orange transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* FAQs */}
                    <div>
                        <h2 className="text-2xl font-display font-bold text-charcoal mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {popularFaqs.map((faq, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-sand hover:border-orange/20 cursor-pointer group">
                                    <span className="font-medium text-charcoal group-hover:text-orange transition-colors">{faq}</span>
                                    <ChevronRight className="w-4 h-4 text-warmgray group-hover:text-orange" />
                                </div>
                            ))}
                        </div>
                        <button className="text-orange font-bold mt-6 hover:underline flex items-center gap-1">
                            View all FAQs <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Contact Support */}
                    <div className="card p-8 bg-charcoal text-ivory border-none">
                        <h2 className="text-2xl font-display font-bold mb-4">Still need help?</h2>
                        <p className="text-sand/60 mb-8">Our support team is available 24/7 to assist you with any questions or issues.</p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                    <MessageCircle className="w-6 h-6 text-orange" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Live Chat</h3>
                                    <p className="text-sm text-sand/50">Chat with a human expert in under 2 minutes.</p>
                                    <button className="mt-2 text-orange text-sm font-bold hover:underline">Start Chat Now</button>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                    <HelpCircle className="w-6 h-6 text-orange" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Support Ticket</h3>
                                    <p className="text-sm text-sand/50">Send us a detailed message and get a response within 4 hours.</p>
                                    <button className="mt-2 text-orange text-sm font-bold hover:underline">Open a Ticket</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
