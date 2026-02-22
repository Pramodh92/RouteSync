import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function Wallet() {
    const { user } = useAuth();
    const balance = user?.walletBalance || 0;

    const transactions = [
        { id: 1, type: 'credit', label: 'Cashback on FL123', amount: 150, date: '2024-11-12' },
        { id: 2, type: 'debit', label: 'Flight BOM-DEL', amount: 4599, date: '2024-11-10' },
        { id: 3, type: 'credit', label: 'Referral Bonus', amount: 200, date: '2024-11-05' },
        { id: 4, type: 'debit', label: 'Hotel Goa Resort', amount: 8000, date: '2024-10-28' },
    ];

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-display font-bold text-charcoal mb-6">My Wallet</h1>

                {/* Balance card */}
                <div className="relative overflow-hidden rounded-3xl bg-charcoal p-8 mb-6 text-ivory">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-8 -right-8 w-48 h-48 bg-orange rounded-full blur-2xl" />
                    </div>
                    <div className="relative z-10">
                        <WalletIcon className="w-10 h-10 mb-4 text-orange/80" />
                        <p className="text-sand/60 text-sm mb-1">Available Balance</p>
                        <p className="text-5xl font-display font-bold text-ivory mb-1">₹{balance.toLocaleString()}</p>
                        <p className="text-sand/50 text-xs">RouteSync Wallet</p>
                        <button className="mt-5 flex items-center gap-2 bg-orange text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-dark transition-colors text-sm">
                            <Plus className="w-4 h-4" /> Add Money
                        </button>
                    </div>
                </div>

                {/* Transactions */}
                <div className="card p-6">
                    <h2 className="font-display font-semibold text-xl text-charcoal mb-4">Transaction History</h2>
                    <div className="space-y-3">
                        {transactions.map(txn => (
                            <div key={txn.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-ivory transition-colors">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${txn.type === 'credit' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-400'}`}>
                                    {txn.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-charcoal text-sm">{txn.label}</p>
                                    <p className="text-warmgray text-xs">{new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                                <p className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
