import React from 'react';
import { BookOpen, Map, Hash, Calendar, Heart, ArrowRight } from 'lucide-react';

export default function TravelGuides() {
    const guides = [
        {
            title: 'Top 10 Hidden Gems in Bali',
            cat: 'Adventure',
            img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop',
            read: '5 min',
            date: 'Feb 15, 2026'
        },
        {
            title: 'Luxury on a Budget: Swiss Alps',
            cat: 'Budget Luxury',
            img: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&h=400&fit=crop',
            read: '8 min',
            date: 'Feb 10, 2026'
        },
        {
            title: 'Essential Carry-on Checklist',
            cat: 'Travel Tips',
            img: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=600&h=400&fit=crop',
            read: '4 min',
            date: 'Feb 01, 2026'
        },
        {
            title: 'Dining Like a Local in Tokyo',
            cat: 'Food & Drink',
            img: '/images/tokyo.png',
            read: '6 min',
            date: 'Jan 28, 2026'
        },
    ];

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="relative h-80 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1500835595306-03f42999496a?w=1920&h=500&fit=crop" alt="Travel Guides" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-charcoal/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-ivory mb-4">Travel <span className="text-orange">Insights</span></h1>
                        <p className="text-sand/90 text-lg max-w-xl mx-auto">Expert guides, curated stories, and essential tips for your next great adventure.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-display font-bold text-charcoal">Latest Guides</h2>
                    <div className="flex gap-2">
                        {['All', 'Adventure', 'Luxury', 'Tips'].map(cat => (
                            <button key={cat} className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl border border-sand hover:border-orange hover:text-orange transition-all">
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {guides.map((guide, i) => (
                        <div key={i} className="card group overflow-hidden cursor-pointer">
                            <div className="relative h-48 overflow-hidden">
                                <img src={guide.img} alt={guide.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-4 left-4 bg-orange text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md">
                                    {guide.cat}
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-4 text-xs text-warmgray mb-3">
                                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {guide.date}</div>
                                    <div className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {guide.read} read</div>
                                </div>
                                <h3 className="text-xl font-bold text-charcoal mb-4 group-hover:text-orange transition-colors line-clamp-2">{guide.title}</h3>
                                <div className="flex items-center justify-between mt-auto">
                                    <button className="flex items-center gap-2 text-sm font-bold text-charcoal hover:text-orange">
                                        Read More <ArrowRight className="w-4 h-4" />
                                    </button>
                                    <button className="w-8 h-8 rounded-full border border-sand flex items-center justify-center text-warmgray hover:border-orange hover:text-orange transition-all">
                                        <Heart className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Newsletter Teaser */}
                <div className="mt-20 card p-8 bg-charcoal text-ivory flex flex-col md:flex-row items-center justify-between gap-8 border-none overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-display font-bold mb-2">Get Weekly <span className="text-orange">Inspiration</span></h2>
                        <p className="text-sand/60">Join 50k+ travelers receiving the best travel deals and guides.</p>
                    </div>
                    <div className="flex w-full md:w-auto gap-2 relative z-10">
                        <input className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 flex-1 md:w-64 outline-none focus:ring-2 focus:ring-orange/50" placeholder="your@email.com" />
                        <button className="btn-primary whitespace-nowrap px-8">Subscribe</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
