import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Plane, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(form.email, form.password);
        setLoading(false);
        if (result.success) navigate('/dashboard');
        else setError(result.message || 'Invalid credentials. Try: alice@routesync.com / alice123');
    };

    return (
        <div className="min-h-screen bg-ivory flex">
            {/* Left panel */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&h=900&fit=crop" alt="Travel" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-charcoal/80 to-orange/30" />
                <div className="relative z-10 flex flex-col justify-center p-12">
                    <div className="mb-8">
                        <Link to="/" className="flex items-center gap-2 mb-12">
                            <div className="w-10 h-10 bg-orange rounded-xl flex items-center justify-center">
                                <Plane className="w-5 h-5 text-white" fill="white" />
                            </div>
                            <span className="font-display font-bold text-2xl text-ivory">RouteSync</span>
                        </Link>
                        <h2 className="text-4xl font-display font-bold text-ivory mb-4">Your Journey Begins Here</h2>
                        <p className="text-sand/80 text-lg">Book flights, hotels, trains, buses and holiday packages — all in one place.</p>
                    </div>
                    <div className="space-y-4">
                        {[['✈️', 'Flights', 'Best deals on 500+ routes'], ['🏨', 'Hotels', '10,000+ properties'], ['🚆', 'Trains', 'Instant PNR confirmation']].map(([e, t, d]) => (
                            <div key={t} className="flex items-center gap-3 text-sand/80">
                                <span className="text-2xl">{e}</span>
                                <div><p className="font-semibold text-ivory">{t}</p><p className="text-xs">{d}</p></div>
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
                    <h1 className="text-3xl font-display font-bold text-charcoal mb-2">Welcome back 👋</h1>
                    <p className="text-warmgray mb-8">Sign in to access your bookings and continue your journey.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">EMAIL ADDRESS</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input type="email" className="input-field pl-10" placeholder="alice@routesync.com" value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-warmgray mb-1 block">PASSWORD</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                <input type={showPass ? 'text' : 'password'} className="input-field pl-10 pr-10" placeholder="••••••••"
                                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warmgray hover:text-orange">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
                        )}

                        <div className="bg-sand/30 border border-sand rounded-xl p-3 text-xs text-warmgray">
                            <strong>Demo credentials:</strong><br />
                            Email: alice@routesync.com · Password: alice123
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <p className="text-center text-sm text-warmgray mt-6">
                        Don't have an account? <Link to="/register" className="text-orange font-semibold hover:underline">Sign Up Free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
