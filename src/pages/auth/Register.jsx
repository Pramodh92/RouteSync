import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, Plane, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true);
        const result = await signup(form.name, form.email, form.password, form.phone);
        setLoading(false);
        if (result.success) navigate('/dashboard');
        else setError(result.message || 'Registration failed. Please try again.');
    };

    return (
        <div className="min-h-screen bg-ivory flex">
            {/* Left panel */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=900&fit=crop" alt="Travel" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-charcoal/80 to-orange/30" />
                <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
                    <Link to="/" className="flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-orange rounded-xl flex items-center justify-center">
                            <Plane className="w-5 h-5 text-white" fill="white" />
                        </div>
                        <span className="font-display font-bold text-2xl text-ivory">RouteSync</span>
                    </Link>
                    <h2 className="text-4xl font-display font-bold text-ivory mb-4">Join 2M+ Happy Travelers</h2>
                    <p className="text-sand/80">Get exclusive deals, instant refunds, and priority support as a RouteSync member.</p>
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        {[['2M+', 'Members'], ['98%', 'Satisfaction'], ['24/7', 'Support']].map(([v, l]) => (
                            <div key={l} className="text-center">
                                <p className="text-2xl font-bold text-orange">{v}</p>
                                <p className="text-sand/60 text-sm">{l}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-6 lg:max-w-lg">
                <div className="w-full max-w-md">
                    <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="w-8 h-8 bg-orange rounded-lg flex items-center justify-center">
                            <Plane className="w-4 h-4 text-white" fill="white" />
                        </div>
                        <span className="font-display font-bold text-xl text-charcoal">RouteSync</span>
                    </Link>
                    <h1 className="text-3xl font-display font-bold text-charcoal mb-2">Create Account ✨</h1>
                    <p className="text-warmgray mb-8">Join RouteSync and start exploring the world at the best prices.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">FULL NAME</label>
                            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input className="input-field pl-10" placeholder="Your full name" value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">EMAIL</label>
                            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input type="email" className="input-field pl-10" placeholder="your@email.com" value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">PHONE</label>
                            <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input type="tel" className="input-field pl-10" placeholder="10-digit mobile" value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">PASSWORD</label>
                            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input type={showPass ? 'text' : 'password'} className="input-field pl-10 pr-10" placeholder="Min 6 characters" value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warmgray hover:text-orange">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">CONFIRM PASSWORD</label>
                            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input type={showPass ? 'text' : 'password'} className="input-field pl-10" placeholder="Confirm password" value={form.confirm}
                                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required /></div>
                        </div>

                        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

                        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <p className="text-center text-sm text-warmgray mt-6">
                        Already have an account? <Link to="/login" className="text-orange font-semibold hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
