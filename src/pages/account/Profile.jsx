import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Lock, CheckCircle } from 'lucide-react';

export default function Profile() {
    const { user, updateProfile } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        currentPassword: '',
        newPassword: '',
    });
    const [saved, setSaved] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        if (typeof updateProfile === 'function') updateProfile({ name: form.name, phone: form.phone });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-display font-bold text-charcoal mb-8">My Profile</h1>

                <div className="flex flex-col sm:flex-row gap-8 mb-8">
                    {/* Avatar */}
                    <div className="flex flex-col items-center">
                        <div className="w-28 h-28 rounded-3xl bg-orange text-white flex items-center justify-center text-5xl font-bold shadow-warm">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <p className="mt-3 font-semibold text-charcoal">{user?.name}</p>
                        <p className="text-warmgray text-sm">{user?.email}</p>
                    </div>
                    {/* Quick stats */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[['Wallet', `₹${(user?.walletBalance || 0).toLocaleString()}`, 'text-orange'],
                        ['Member Since', user?.joinDate || '—', 'text-olive'],
                        ['RouteSync Coins', (user?.walletBalance || 0) * 0.1 | 0, 'text-gold']].map(([k, v, c]) => (
                            <div key={k} className="card p-4">
                                <p className="text-xs text-warmgray mb-1">{k}</p>
                                <p className={`font-bold ${c} text-lg`}>{v}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="font-display font-semibold text-xl text-charcoal mb-5">Edit Profile</h2>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-warmgray mb-1 block">FULL NAME</label>
                                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                    <input className="input-field pl-10" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-warmgray mb-1 block">EMAIL (read-only)</label>
                                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray" />
                                    <input className="input-field pl-10 opacity-60" value={form.email} readOnly /></div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-warmgray mb-1 block">PHONE</label>
                                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                    <input className="input-field pl-10" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                            </div>
                        </div>

                        <div className="divider" />
                        <h3 className="font-semibold text-charcoal">Change Password</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-warmgray mb-1 block">CURRENT PASSWORD</label>
                                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                    <input type="password" className="input-field pl-10" placeholder="Current password" value={form.currentPassword}
                                        onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} /></div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-warmgray mb-1 block">NEW PASSWORD</label>
                                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange" />
                                    <input type="password" className="input-field pl-10" placeholder="New password" value={form.newPassword}
                                        onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} /></div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2">
                            <button type="submit" className="btn-primary flex items-center gap-2">
                                Save Changes
                            </button>
                            {saved && (
                                <div className="flex items-center gap-1.5 text-green-600 text-sm animate-fade-in">
                                    <CheckCircle className="w-4 h-4" /> Profile updated!
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
