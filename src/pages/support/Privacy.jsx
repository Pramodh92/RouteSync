import React from 'react';
import { Shield, Lock, Eye, FileText, Bell } from 'lucide-react';

export default function Privacy() {
    const sections = [
        {
            icon: Shield,
            title: 'Information Collection',
            content: 'We collect information you provide directly to us when you create an account, make a booking, or contact support. This includes your name, email address, phone number, and payment details (processed securely via our partners).'
        },
        {
            icon: Eye,
            title: 'How We Use Your Data',
            content: 'Your data is used to process bookings, send confirmations, and improve our services. We may also use it to send personalized offers and travel updates if you have opted in to our newsletter.'
        },
        {
            icon: Lock,
            title: 'Data Security',
            content: 'We implement industry-standard security measures to protect your personal information. RouteSync uses end-to-end encryption for sensitive data and regular security audits to ensure your safety.'
        },
        {
            icon: Bell,
            title: 'Your Choices',
            content: 'You can update your account information at any time via the profile settings. You also have the right to request the deletion of your data or opt-out of marketing communications.'
        }
    ];

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="bg-charcoal text-ivory py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-display font-bold mb-4">Privacy <span className="text-orange">Policy</span></h1>
                    <p className="text-sand/70">Last Updated: February 22, 2026</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="card p-8 md:p-12 mb-12">
                    <div className="flex items-center gap-3 mb-8 text-orange">
                        <FileText className="w-8 h-8" />
                        <h2 className="text-2xl font-display font-bold text-charcoal">Commitment to Your Privacy</h2>
                    </div>

                    <p className="text-warmgray leading-relaxed mb-10">
                        At RouteSync, we take your privacy seriously. This policy describes how we collect, use, and handle your information when you use our website and services. By using RouteSync, you agree to the collection and use of information in accordance with this policy.
                    </p>

                    <div className="space-y-12">
                        {sections.map((section, i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-6">
                                <div className="w-12 h-12 bg-sand/30 text-orange rounded-2xl flex items-center justify-center shrink-0">
                                    <section.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-charcoal mb-3">{section.title}</h3>
                                    <p className="text-warmgray leading-relaxed">{section.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 p-6 bg-ivory rounded-2xl border border-sand">
                        <h4 className="font-bold text-charcoal mb-2">Cookies and Tracking</h4>
                        <p className="text-sm text-warmgray">
                            We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                        </p>
                    </div>
                </div>

                <div className="text-center text-warmgray text-sm">
                    <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@routesync.com" className="text-orange hover:underline">privacy@routesync.com</a></p>
                </div>
            </div>
        </div>
    );
}
