import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, HelpCircle, CheckCircle } from 'lucide-react';

export default function ContactUs() {
    const [form, setForm] = useState({ name: '', email: '', subject: 'Support', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
    };

    const contactOptions = [
        { icon: Phone, title: 'Call Us', detail: '+91 1800-ROUTE-SYNC', sub: '24/7 Priority Support' },
        { icon: Mail, title: 'Email Us', detail: 'support@routesync.com', sub: 'Response within 2 hours' },
        { icon: MessageCircle, title: 'Live Chat', detail: 'Open 24/7', sub: 'Chat with our experts' },
    ];

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="bg-charcoal text-ivory py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Get in <span className="text-orange">Touch</span></h1>
                    <p className="text-sand/70 text-lg">We're here to help you with every step of your journey.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-10 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Cards */}
                    <div className="lg:col-span-1 space-y-4">
                        {contactOptions.map((opt, i) => (
                            <div key={i} className="card p-6 flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-12 h-12 bg-orange text-white rounded-xl flex items-center justify-center shrink-0">
                                    <opt.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal">{opt.title}</h3>
                                    <p className="text-orange font-semibold">{opt.detail}</p>
                                    <p className="text-warmgray text-sm mt-1">{opt.sub}</p>
                                </div>
                            </div>
                        ))}

                        <div className="card p-6 bg-orange/5 border-orange/20">
                            <h3 className="font-bold text-charcoal flex items-center gap-2 mb-3">
                                <MapPin className="w-5 h-5 text-orange" /> Corporate Office
                            </h3>
                            <p className="text-warmgray text-sm leading-relaxed">
                                123 Travel Plaza, Luxury Heights,<br />
                                MG Road, Bangalore, Karnataka<br />
                                India - 560001
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="card p-8 md:p-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-bl-full -z-0" />

                            <h2 className="text-2xl font-display font-bold text-charcoal mb-6 relative z-10">Send us a Message</h2>

                            {submitted ? (
                                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-fade-in">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-charcoal mb-2">Message Sent!</h3>
                                    <p className="text-warmgray">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                                    <button onClick={() => setSubmitted(false)} className="btn-secondary mt-6">Send Another Message</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-warmgray mb-1 block uppercase tracking-wider">Your Name</label>
                                            <input className="input-field" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-warmgray mb-1 block uppercase tracking-wider">Email Address</label>
                                            <input className="input-field" type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-warmgray mb-1 block uppercase tracking-wider">Subject</label>
                                        <select className="input-field" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                                            <option>General Inquiry</option>
                                            <option>Booking Issue</option>
                                            <option>Refund Request</option>
                                            <option>Feedback</option>
                                            <option>Partnership</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-warmgray mb-1 block uppercase tracking-wider">Message</label>
                                        <textarea className="input-field min-h-[150px] resize-none py-3" placeholder="Tell us how we can help..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
                                    </div>
                                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                                        <Send className="w-5 h-5" /> Send Message
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm">
                                <HelpCircle className="w-8 h-8 text-orange/40" />
                                <div>
                                    <h4 className="font-bold text-charcoal text-sm">Need quick answers?</h4>
                                    <a href="/support" className="text-orange text-xs font-semibold hover:underline">Check our Help Center</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm">
                                <CheckCircle className="w-8 h-8 text-orange/40" />
                                <div>
                                    <h4 className="font-bold text-charcoal text-sm">Business Inquiry?</h4>
                                    <a href="mailto:partners@routesync.com" className="text-orange text-xs font-semibold hover:underline">partners@routesync.com</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
