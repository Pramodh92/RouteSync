import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { Plane, Hotel, Train, Bus, Car, Package, X, Eye, Clock, CheckCircle, XCircle, RefreshCw, Star, MessageSquare, Loader, MapPin } from 'lucide-react';
import { api } from '../../services/api.js';

const typeIcons = { flights: Plane, hotels: Hotel, trains: Train, buses: Bus, cabs: Car, holidays: Package };
const typeLabels = { flights: 'Flight', hotels: 'Hotel', trains: 'Train', buses: 'Bus', cabs: 'Cab', holidays: 'Holiday' };

export default function MyTrips() {
    const { bookings, cancelBooking } = useBooking();
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [rebookModal, setRebookModal] = useState(null);   // cancelled booking object
    const [rebookData, setRebookData] = useState(null);
    const [rebookLoading, setRebookLoading] = useState(false);
    const [reviewBooking, setReviewBooking] = useState(null);
    const [reviewStep, setReviewStep] = useState(1);
    const [reviewForm, setReviewForm] = useState({ rating: 5, bestPart: '', improvement: '' });
    const [generatedReview, setGeneratedReview] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);

    const filtered = filter === 'all' ? bookings : bookings.filter(b => b.type === filter || b.status === filter);
    const sorted = [...filtered].reverse();

    return (
        <div className="min-h-screen bg-ivory pt-20">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-display font-bold text-charcoal mb-6">My Trips</h1>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[['all', 'All Bookings'], ['confirmed', 'Confirmed'], ['cancelled', 'Cancelled'], ['flights', '✈️ Flights'], ['hotels', '🏨 Hotels'], ['trains', '🚆 Trains']].map(([val, label]) => (
                        <button key={val} onClick={() => setFilter(val)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === val ? 'bg-orange text-white' : 'bg-white border border-sand text-charcoal hover:border-orange/40'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {sorted.length === 0 ? (
                    <div className="card p-12 text-center">
                        <Plane className="w-12 h-12 text-sand mx-auto mb-4" />
                        <h3 className="text-charcoal font-semibold text-xl mb-2">No trips found</h3>
                        <p className="text-warmgray">Start booking your dream vacation!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sorted.map(booking => {
                            const Icon = typeIcons[booking.type] || Plane;
                            const label = typeLabels[booking.type] || 'Booking';
                            return (
                                <div key={booking.id} className="card p-5 animate-fade-in">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${booking.status === 'cancelled' ? 'bg-sand/50' : 'bg-orange/10'}`}>
                                            <Icon className={`w-6 h-6 ${booking.status === 'cancelled' ? 'text-warmgray' : 'text-orange'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="font-semibold text-charcoal capitalize">{label} Booking</span>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                                    {booking.status === 'confirmed' ? <CheckCircle className="w-3 h-3 inline mr-1" /> : <XCircle className="w-3 h-3 inline mr-1" />}
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <p className="text-warmgray text-sm">ID: {booking.id}</p>
                                            {booking.pnr && <p className="text-warmgray text-sm">PNR: <span className="font-medium tracking-wider">{booking.pnr}</span></p>}
                                            <div className="flex items-center gap-1 text-warmgray text-xs mt-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-orange text-lg">₹{booking.totalAmount?.toLocaleString()}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <button onClick={() => setSelected(booking)}
                                                    className="text-xs text-charcoal border border-sand hover:border-orange rounded-lg px-2 py-1 flex items-center gap-1 transition-all">
                                                    <Eye className="w-3 h-3" /> Details
                                                </button>
                                                {booking.status === 'confirmed' && (
                                                    <button onClick={() => { if (window.confirm('Cancel this booking?')) { cancelBooking(booking.id); setRebookModal(booking); setRebookData(null); } }}
                                                        className="text-xs text-red-500 border border-red-200 hover:border-red-400 rounded-lg px-2 py-1 flex items-center gap-1 transition-all">
                                                        <X className="w-3 h-3" /> Cancel
                                                    </button>
                                                )}
                                                {booking.status === 'cancelled' && (
                                                    <button onClick={() => { setRebookModal(booking); setRebookData(null); }}
                                                        className="text-xs text-orange border border-orange/30 hover:bg-orange/10 rounded-lg px-2 py-1 flex items-center gap-1 transition-all">
                                                        <RefreshCw className="w-3 h-3" /> Rebook
                                                    </button>
                                                )}
                                                {booking.status === 'confirmed' && (
                                                    <button onClick={() => { setReviewBooking(booking); setReviewStep(1); setGeneratedReview(null); }}
                                                        className="text-xs text-olive border border-olive/30 hover:bg-olive/10 rounded-lg px-2 py-1 flex items-center gap-1 transition-all">
                                                        <Star className="w-3 h-3" /> Review
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── AI Re-booking Modal ── */}
            {rebookModal && (
                <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setRebookModal(null)}>
                    <div className="card max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 text-orange" />
                                <h3 className="font-bold text-charcoal">AI Re-booking Assistant</h3>
                            </div>
                            <button onClick={() => setRebookModal(null)}><X className="w-5 h-5 text-warmgray" /></button>
                        </div>
                        <p className="text-sm text-warmgray mb-4">Sorry your trip was cancelled. Let AI find you alternatives!</p>
                        {!rebookData && !rebookLoading && (
                            <button onClick={async () => {
                                setRebookLoading(true);
                                try { const res = await api.ai.rebook({ cancelledBooking: rebookModal }); setRebookData(res.data); }
                                catch (e) { setRebookData({ message: 'Could not load suggestions. Please add GROQ_API_KEY.', alternatives: [] }); }
                                finally { setRebookLoading(false); }
                            }} className="btn-primary w-full flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4" /> Find Alternative Trips
                            </button>
                        )}
                        {rebookLoading && <div className="flex justify-center py-6"><Loader className="w-6 h-6 animate-spin text-orange" /></div>}
                        {rebookData && (
                            <div className="space-y-3">
                                <p className="text-sm text-charcoal/80 italic">{rebookData.message}</p>
                                {rebookData.alternatives?.map((alt, i) => (
                                    <div key={i} className="bg-ivory rounded-xl p-3 flex items-start gap-3">
                                        <span className="text-2xl">{alt.emoji}</span>
                                        <div className="flex-1">
                                            <p className="font-semibold text-charcoal text-sm">{alt.destination}</p>
                                            <p className="text-xs text-warmgray">{alt.reason}</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                <span className="tag-orange text-xs">{alt.category}</span>
                                                <span className="tag text-xs">{alt.estimatedBudget}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {rebookData.alternatives?.length > 0 && (
                                    <a href="/holidays" className="btn-primary w-full text-center block mt-3">Browse Holiday Packages</a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── AI Review Generator Modal ── */}
            {reviewBooking && (
                <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setReviewBooking(null); setGeneratedReview(null); }}>
                    <div className="card max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-orange" />
                                <h3 className="font-bold text-charcoal">AI Review Generator</h3>
                            </div>
                            <button onClick={() => { setReviewBooking(null); setGeneratedReview(null); }}><X className="w-5 h-5 text-warmgray" /></button>
                        </div>
                        {!generatedReview ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium text-warmgray mb-2">Your Rating</p>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button key={n} onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>
                                                <Star className={`w-7 h-7 transition-colors ${n <= reviewForm.rating ? 'text-gold fill-gold' : 'text-sand'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-warmgray mb-1 block">What was the best part? *</label>
                                    <textarea className="input-field resize-none" rows={2} placeholder="e.g. Amazing beach views, great service..."
                                        value={reviewForm.bestPart} onChange={e => setReviewForm(f => ({ ...f, bestPart: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-warmgray mb-1 block">One thing to improve?</label>
                                    <textarea className="input-field resize-none" rows={2} placeholder="e.g. Breakfast could be better..."
                                        value={reviewForm.improvement} onChange={e => setReviewForm(f => ({ ...f, improvement: e.target.value }))} />
                                </div>
                                <button disabled={!reviewForm.bestPart || reviewLoading} onClick={async () => {
                                    setReviewLoading(true);
                                    try {
                                        const res = await api.ai.review({
                                            type: reviewBooking.type, destination: reviewBooking.details?.to || reviewBooking.details?.destination,
                                            ...reviewForm
                                        });
                                        setGeneratedReview(res.data);
                                    } catch { setGeneratedReview({ title: 'Great Experience!', review: reviewForm.bestPart, tags: [], rating: reviewForm.rating }); }
                                    finally { setReviewLoading(false); }
                                }} className="btn-primary w-full flex items-center justify-center gap-2">
                                    {reviewLoading ? <><Loader className="w-4 h-4 animate-spin" /> Generating…</> : '✨ Generate AI Review'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="font-bold text-charcoal">{generatedReview.title}</p>
                                <div className="flex gap-1">{[...Array(generatedReview.rating || 5)].map((_, i) => <Star key={i} className="w-4 h-4 text-gold fill-gold" />)}</div>
                                <p className="text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">{generatedReview.review}</p>
                                {generatedReview.tags?.length > 0 && <div className="flex flex-wrap gap-1">{generatedReview.tags.map(t => <span key={t} className="tag text-xs">{t}</span>)}</div>}
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => setGeneratedReview(null)} className="btn-secondary flex-1 text-sm">Edit</button>
                                    <button onClick={() => { setReviewBooking(null); setGeneratedReview(null); }} className="btn-primary flex-1 text-sm">Submit ✓</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Detail modal */}
            {selected && (
                <div className="fixed inset-0 z-50 bg-charcoal/60 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="card max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-display font-semibold text-charcoal text-lg">Booking Details</h3>
                            <button onClick={() => setSelected(null)} className="text-warmgray hover:text-charcoal"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3 text-sm">
                            {[
                                ['Booking ID', selected.id],
                                ['PNR', selected.pnr || '—'],
                                ['Type', selected.type],
                                ['Status', selected.status],
                                ['Amount', `₹${selected.totalAmount?.toLocaleString()}`],
                                ['Date', new Date(selected.createdAt).toLocaleString()],
                            ].map(([k, v]) => (
                                <div key={k} className="flex justify-between">
                                    <span className="text-warmgray">{k}</span>
                                    <span className={`font-medium capitalize ${k === 'Amount' ? 'text-orange' : ''}`}>{v}</span>
                                </div>
                            ))}
                            {selected.passengers?.[0]?.name && (
                                <div className="flex justify-between"><span className="text-warmgray">Passenger</span><span className="font-medium">{selected.passengers[0].name}</span></div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
