import React from 'react';
import { Scale, FileText, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

export default function Terms() {
    const points = [
        { title: 'Acceptance of Terms', text: 'By accessing and using RouteSync, you agree to follow and be bound by these Terms of Service.' },
        { title: 'User Accounts', text: 'You are responsible for maintaining the confidentiality of your account and password.' },
        { title: 'Booking Policy', text: 'All bookings are subject to availability and the specific terms of the service provider (airline, hotel, etc.).' },
        { title: 'Refunds & Cancellations', text: 'Cancellations and refunds are governed by the specific policy provided at the time of booking.' },
        { title: 'Prohibited Usage', text: 'Users may not use our service for any illegal purposes or to violate any laws in their jurisdiction.' },
        { title: 'Limitation of Liability', text: 'RouteSync is not liable for any direct or indirect damages resulting from your use of the service.' },
    ];

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="bg-charcoal text-ivory py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-display font-bold mb-4">Terms of <span className="text-orange">Service</span></h1>
                    <p className="text-sand/70">Standard Operating Procedures & Legal Agreement</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="card p-8 md:p-12 mb-12">
                    <div className="flex items-center gap-3 mb-8 text-orange">
                        <Scale className="w-8 h-8" />
                        <h2 className="text-2xl font-display font-bold text-charcoal">Agreement Overview</h2>
                    </div>

                    <div className="space-y-8">
                        {points.map((point, i) => (
                            <div key={i} className="border-b border-sand pb-8 last:border-none">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-orange/10 rounded-lg flex items-center justify-center text-orange flex-shrink-0">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-lg font-bold text-charcoal">{point.title}</h3>
                                </div>
                                <p className="text-warmgray leading-relaxed pl-11">{point.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-8 bg-charcoal rounded-2xl text-ivory">
                        <div className="flex items-start gap-4 mb-4 text-orange">
                            <AlertCircle className="w-6 h-6 flex-shrink-0" />
                            <h4 className="text-xl font-display font-bold">Important Notice</h4>
                        </div>
                        <p className="text-sand/70 text-sm leading-relaxed mb-6">
                            Prices, availability, and travel rules can change without notice due to external factors like government regulations or carrier policies. RouteSync acts as an intermediary and is not responsible for provider-initiated changes.
                        </p>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orange">
                            <HelpCircle className="w-4 h-4" /> Need Clarification?
                        </div>
                    </div>
                </div>

                <div className="text-center text-warmgray text-sm">
                    <p>© 2026 RouteSync Travel. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
